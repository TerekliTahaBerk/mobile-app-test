import legacyCurriculum from '@/modules/curriculum/content/data/curriculum.json';
import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import type { ContentBundle } from '@/modules/curriculum/domain/content-types';
import {
  adaptLegacyCurriculum,
  LEGACY_CURRICULUM_SCHEMA_VERSION,
} from '@/modules/curriculum/domain/legacy-curriculum-adapter';
import { validateContentBundle } from '@/modules/curriculum/domain/validate-content-bundle';

function mutableCopy(): ContentBundle {
  return JSON.parse(JSON.stringify(tytDraftBundle)) as ContentBundle;
}

function edit<T>(value: unknown): T {
  return value as T;
}

describe('curriculum manifest v2', () => {
  it('models TYT, AYT and YDT as stable independently versioned YKS programs', () => {
    expect(tytDraftBundle.manifest.exams).toEqual([
      expect.objectContaining({
        id: 'yks',
        programIds: ['yks.tyt', 'yks.ayt', 'yks.ydt'],
        version: tytDraftBundle.manifest.version,
      }),
    ]);
    expect(tytDraftBundle.manifest.programs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'yks.tyt', version: tytDraftBundle.manifest.version }),
        expect.objectContaining({ id: 'yks.ayt', version: tytDraftBundle.manifest.version }),
        expect.objectContaining({ id: 'yks.ydt', version: tytDraftBundle.manifest.version }),
      ]),
    );
  });

  it('admits future LGS and KPSS programs without changing the contract', () => {
    const bundle = mutableCopy();
    edit<Array<ContentBundle['manifest']['exams'][number]>>(bundle.manifest.exams).push(
      { id: 'lgs', programIds: ['lgs.lgs'], title: 'LGS', version: '2028.1' },
      { id: 'kpss', programIds: ['kpss.lisans'], title: 'KPSS', version: '2028.1' },
    );
    edit<Array<ContentBundle['manifest']['programs'][number]>>(bundle.manifest.programs).push(
      {
        examId: 'lgs',
        id: 'lgs.lgs',
        subjectIds: [],
        title: 'LGS',
        version: '2028.1',
      },
      {
        examId: 'kpss',
        id: 'kpss.lisans',
        subjectIds: [],
        title: 'Lisans',
        version: '2028.1',
      },
    );

    expect(validateContentBundle(bundle)).toEqual([]);
  });

  it('preserves legacy subject and unit IDs while adding program ownership', () => {
    const adapted = adaptLegacyCurriculum(legacyCurriculum) as {
      manifest: ContentBundle['manifest'];
      schemaVersion: number;
    };

    expect(legacyCurriculum.schemaVersion).toBe(LEGACY_CURRICULUM_SCHEMA_VERSION);
    expect(adapted.manifest.subjects.map((subject) => subject.id)).toEqual(
      legacyCurriculum.subjects.map((subject) => subject.id),
    );
    expect(adapted.manifest.units.map((unit) => unit.id)).toEqual(
      legacyCurriculum.units.map((unit) => unit.id),
    );
    expect(adapted.manifest.subjects.find((subject) => subject.id === 'tyt.history')).toMatchObject(
      {
        availability: 'available',
        prerequisiteSubjectIds: [],
        programId: 'yks.tyt',
      },
    );
    expect(adapted.manifest.subjects.find((subject) => subject.id === 'tyt.math')).toMatchObject({
      availability: 'planned',
      programId: 'yks.tyt',
    });
  });

  it('rejects broken program and subject prerequisite references', () => {
    const bundle = mutableCopy();
    edit<{ examId: string }>(bundle.manifest.programs[0]).examId = 'missing-exam';
    edit<{ prerequisiteSubjectIds: string[] }>(
      bundle.manifest.subjects.find((subject) => subject.id === 'tyt.history'),
    ).prerequisiteSubjectIds = ['missing-subject'];

    const issues = validateContentBundle(bundle);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          at: 'manifest.programs[0].examId',
          code: 'brokenReference',
        }),
        expect.objectContaining({
          at: expect.stringContaining('prerequisiteSubjectIds'),
          code: 'brokenReference',
        }),
      ]),
    );
  });

  it('rejects duplicate manifest IDs and prerequisite cycles', () => {
    const bundle = mutableCopy();
    edit<Array<ContentBundle['manifest']['programs'][number]>>(bundle.manifest.programs).push({
      ...bundle.manifest.programs[0]!,
    });
    const history = bundle.manifest.subjects.find((subject) => subject.id === 'tyt.history')!;
    const geography = bundle.manifest.subjects.find((subject) => subject.id === 'tyt.geography')!;
    edit<{ prerequisiteSubjectIds: string[] }>(history).prerequisiteSubjectIds = [geography.id];
    edit<{ prerequisiteSubjectIds: string[] }>(geography).prerequisiteSubjectIds = [history.id];

    const issues = validateContentBundle(bundle);
    expect(issues.map((issue) => issue.code)).toContain('duplicateId');
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          at: expect.stringContaining('prerequisiteSubjectIds'),
          code: 'invalidTaxonomy',
          message: expect.stringContaining('döngü'),
        }),
      ]),
    );
  });
});
