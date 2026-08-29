import type { ContentBundle } from '@/modules/curriculum/domain/content-types';
import { assertParsedContentBundle } from '@/modules/curriculum/domain/parse-content-bundle';
import {
  ContentValidationError,
  validateContentBundle,
  type ContentIssue,
} from '@/modules/curriculum/domain/validate-content-bundle';

/** One authored unit file, exactly as it sits on disk. */
export type UnitFile = {
  concepts: unknown[];
  exercises: unknown[];
  lessons: unknown[];
  pathNodes: unknown[];
  skills: unknown[];
  topics: unknown[];
  unitId: string;
};

export type Curriculum = {
  contentVersion: string;
  curriculumVersion: string;
  exams: unknown[];
  locale: string;
  schemaVersion: number;
  subjects: unknown[];
  units: { id: string; subjectId: string; title: string; topicIds: string[] }[];
};

export type ContentSnapshot = {
  curriculum: Curriculum;
  units: UnitFile[];
};

export async function loadContent(): Promise<ContentSnapshot> {
  const response = await fetch('/api/content');
  if (!response.ok) {
    throw new Error(`İçerik okunamadı (${response.status}).`);
  }

  return (await response.json()) as ContentSnapshot;
}

export async function saveUnit(unit: UnitFile): Promise<void> {
  const response = await fetch(`/api/content/units/${encodeURIComponent(unit.unitId)}`, {
    body: JSON.stringify(unit),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  });
  if (!response.ok) {
    const detail = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(detail.message ?? `Kaydedilemedi (${response.status}).`);
  }
}

export async function saveCurriculum(curriculum: Curriculum): Promise<void> {
  const response = await fetch('/api/content/curriculum', {
    body: JSON.stringify(curriculum),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error(`Müfredat kaydedilemedi (${response.status}).`);
  }
}

export async function deleteUnit(unitId: string): Promise<void> {
  const response = await fetch(`/api/content/units/${encodeURIComponent(unitId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Ünite silinemedi (${response.status}).`);
  }
}

/** The bundle the app would assemble from these files. */
export function assemble(snapshot: ContentSnapshot): unknown {
  const collect = (key: keyof Omit<UnitFile, 'unitId'>) =>
    snapshot.units.flatMap((unit) => unit[key]);

  return {
    ...snapshot.curriculum,
    concepts: collect('concepts'),
    exercises: collect('exercises'),
    lessons: collect('lessons'),
    pathNodes: collect('pathNodes'),
    skills: collect('skills'),
    topics: collect('topics'),
  };
}

export type ValidationResult = {
  /** The typed bundle, present only when both gates pass. */
  bundle: ContentBundle | null;
  issues: readonly ContentIssue[];
};

/**
 * Runs the app's own two gates, in the app's own order, without throwing.
 *
 * The studio must never be able to save content the app would refuse to load,
 * so it imports these rather than reimplementing them.
 */
export function validate(snapshot: ContentSnapshot): ValidationResult {
  const raw = assemble(snapshot);
  let parsed: ContentBundle;
  try {
    parsed = assertParsedContentBundle(raw);
  } catch (cause) {
    if (cause instanceof ContentValidationError) {
      return { bundle: null, issues: cause.issues };
    }
    throw cause;
  }

  const issues = validateContentBundle(parsed);

  return { bundle: issues.length === 0 ? parsed : null, issues };
}
