import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

/**
 * The studio's file access, as a dev-server middleware.
 *
 * The tool edits the app's authored content in place, so a change is a change
 * to the repository and review history is git history. Writes are confined to
 * the content directory and to ids that look like content ids, because a path
 * arriving over HTTP is input even when the server is local.
 */

const DATA_DIR = resolve(import.meta.dirname, '..', 'mobile', 'src', 'modules', 'curriculum', 'content', 'data');
const REVIEWERS_FILE = join(DATA_DIR, 'reviewers.json');
const UNITS_DIR = join(DATA_DIR, 'units');
const UNITS_INDEX = resolve(DATA_DIR, '..', 'units.ts');
const CONTENT_ID = /^[a-z0-9][a-z0-9.-]{0,120}$/;

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8')) as unknown;
}

async function unitFileNames(): Promise<readonly string[]> {
  return (await readdir(UNITS_DIR)).filter((name) => name.endsWith('.json')).sort();
}

async function readBundle() {
  const files = await unitFileNames();

  return {
    curriculum: await readJson(join(DATA_DIR, 'curriculum.json')),
    reviewers: await readJson(REVIEWERS_FILE),
    units: await Promise.all(files.map((name) => readJson(join(UNITS_DIR, name)))),
  };
}

/**
 * Rewrites the app's unit index from what is actually on disk.
 *
 * The bundler resolves modules at build time and cannot read a directory, so
 * the imports have to be listed somewhere. Generating that list from the
 * directory means adding a unit is one action here rather than an edit the
 * author has to remember to make in TypeScript.
 */
async function regenerateUnitIndex(): Promise<void> {
  const names = await unitFileNames();
  const entries = names.map((name) => {
    const unitId = name.replace(/\.json$/, '');
    const identifier = unitId
      .split('.')
      .slice(-1)[0]!
      .replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())
      .replace(/[^A-Za-z0-9]/g, '');

    return { identifier: /^[a-z]/.test(identifier) ? identifier : `unit${identifier}`, unitId };
  });

  const file = `${[
    ...entries.map(
      (entry) =>
        `import ${entry.identifier} from '@/modules/curriculum/content/data/units/${entry.unitId}.json';`,
    ),
    '',
    '/**',
    " * One authored unit's records, as they sit on disk.",
    ' *',
    ' * Deliberately typed as collections of `unknown`: JSON has no types, and',
    ' * pretending otherwise here would move a real risk out of the validator, which',
    ' * is the only thing that actually checks the shape.',
    ' */',
    'export type AuthoredUnitFile = {',
    '  concepts: readonly unknown[];',
    '  exercises: readonly unknown[];',
    '  lessons: readonly unknown[];',
    '  pathNodes: readonly unknown[];',
    '  skills: readonly unknown[];',
    '  topics: readonly unknown[];',
    '  unitId: string;',
    '};',
    '',
    '/**',
    ' * Authored units, one data file each. Generated from the content directory by',
    ' * the studio; add a unit there rather than editing this list by hand.',
    ' */',
    'export const UNIT_FILES: readonly AuthoredUnitFile[] = [',
    ...entries.map((entry) => `  ${entry.identifier},`),
    '];',
  ].join('\n')}\n`;

  await writeFile(UNITS_INDEX, file, 'utf8');
}

/** Exported for its own test: this is the guard on everything the tool writes. */
export function unitPathFor(unitId: string): string {
  if (!CONTENT_ID.test(unitId)) {
    throw new Error(`Geçersiz ünite kimliği: "${unitId}".`);
  }
  const path = join(UNITS_DIR, `${unitId}.json`);
  if (!path.startsWith(`${UNITS_DIR}/`)) {
    throw new Error('Ünite dosyası içerik dizininin dışında olamaz.');
  }

  return path;
}

async function bodyOf(stream: NodeJS.ReadableStream): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

export function contentApi(): Plugin {
  return {
    name: 'studio-content-api',
    configureServer(server) {
      server.middlewares.use('/api/content', (request, response, next) => {
        const send = (status: number, payload: unknown) => {
          response.statusCode = status;
          response.setHeader('content-type', 'application/json; charset=utf-8');
          response.end(JSON.stringify(payload));
        };

        const url = request.url ?? '/';
        void (async () => {
          try {
            if (request.method === 'GET' && (url === '/' || url === '')) {
              send(200, await readBundle());
              return;
            }

            if (request.method === 'PUT' && (url === '/curriculum' || url === '/curriculum/')) {
              const curriculum = await bodyOf(request);
              await writeFile(
                join(DATA_DIR, 'curriculum.json'),
                `${JSON.stringify(curriculum, null, 2)}\n`,
                'utf8',
              );
              send(200, { written: true });
              return;
            }

            const unitMatch = /^\/units\/([^/?]+)$/.exec(url);
            if (request.method === 'PUT' && unitMatch !== null) {
              const unitId = decodeURIComponent(unitMatch[1]!);
              const unit = await bodyOf(request);
              await writeFile(unitPathFor(unitId), `${JSON.stringify(unit, null, 2)}\n`, 'utf8');
              // A new file has to reach the app's import list, and a rewritten
              // one costs nothing to regenerate.
              await regenerateUnitIndex();
              send(200, { unitId, written: true });
              return;
            }

            if (request.method === 'DELETE' && unitMatch !== null) {
              const unitId = decodeURIComponent(unitMatch[1]!);
              // The repository is the store, so a deletion is a deletion in git
              // and recoverable there. Nothing here is a soft delete.
              await rm(unitPathFor(unitId), { force: true });
              await regenerateUnitIndex();
              send(200, { deleted: true, unitId });
              return;
            }

            next();
          } catch (cause) {
            send(400, { message: cause instanceof Error ? cause.message : String(cause) });
          }
        })();
      });
    },
  };
}
