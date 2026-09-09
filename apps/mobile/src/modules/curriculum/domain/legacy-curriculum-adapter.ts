import {
  CONTENT_SCHEMA_VERSION,
  CURRICULUM_MANIFEST_SCHEMA_VERSION,
  type CurriculumManifestV2,
} from '@/modules/curriculum/domain/content-types';
import {
  ContentValidationError,
  type ContentIssue,
} from '@/modules/curriculum/domain/validate-content-bundle';

export const LEGACY_CURRICULUM_SCHEMA_VERSION = 3;

type LegacyExam = {
  id: string;
  subjectIds: readonly string[];
  title: string;
};

type LegacySubject = {
  examId: string;
  id: string;
  themeKey: string;
  title: string;
  unitIds: readonly string[];
};

type LegacyCurriculum = {
  contentVersion: string;
  curriculumVersion: string;
  exams: readonly LegacyExam[];
  locale: string;
  schemaVersion: number;
  subjects: readonly LegacySubject[];
  units: readonly unknown[];
};

/**
 * Compatibility boundary for the original flat `curriculum.json` format.
 *
 * The adapter changes ownership links, never stable content IDs: existing
 * subject and unit IDs continue to address persisted progress and reviews.
 * Legacy TYT/AYT/YDT exam rows become programs under the YKS exam family.
 * Versions are copied from the legacy curriculum release because v1 had no
 * independently versioned exam or program definitions.
 */
export function adaptLegacyCurriculum(raw: unknown): {
  contentVersion: unknown;
  manifest: unknown;
  schemaVersion: number;
} {
  const legacy = requireLegacyCurriculum(raw);
  const programs = legacy.exams.map((exam) => ({
    examId: examFamilyId(exam.id),
    id: programId(exam.id),
    subjectIds: exam.subjectIds,
    title: exam.title,
    version: legacy.curriculumVersion,
  }));

  const examFamilies = new Map<
    string,
    { id: string; programIds: string[]; title: string; version: string }
  >();
  for (const program of programs) {
    const current = examFamilies.get(program.examId) ?? {
      id: program.examId,
      programIds: [],
      title: examFamilyTitle(program.examId),
      version: legacy.curriculumVersion,
    };
    current.programIds.push(program.id);
    examFamilies.set(program.examId, current);
  }

  const manifest: CurriculumManifestV2 = {
    exams: [...examFamilies.values()],
    id: 'curriculum.tr',
    locale: legacy.locale,
    programs,
    schemaVersion: CURRICULUM_MANIFEST_SCHEMA_VERSION,
    subjects: legacy.subjects.map((subject) => ({
      availability: subject.unitIds.length > 0 ? 'available' : 'planned',
      id: subject.id,
      prerequisiteSubjectIds: [],
      programId: programId(subject.examId),
      themeKey: subject.themeKey as CurriculumManifestV2['subjects'][number]['themeKey'],
      title: subject.title,
      unitIds: subject.unitIds,
    })),
    units: legacy.units as CurriculumManifestV2['units'],
    version: legacy.curriculumVersion,
  };

  return {
    contentVersion: legacy.contentVersion,
    manifest,
    schemaVersion: CONTENT_SCHEMA_VERSION,
  };
}

function requireLegacyCurriculum(raw: unknown): LegacyCurriculum {
  const issues: ContentIssue[] = [];
  const record = isRecord(raw) ? raw : null;
  if (record === null) {
    issues.push({
      at: 'curriculum',
      code: 'malformedRecord',
      message: 'Legacy curriculum bir kayıt nesnesi olmalı.',
    });
  } else {
    if (record.schemaVersion !== LEGACY_CURRICULUM_SCHEMA_VERSION) {
      issues.push({
        at: 'curriculum.schemaVersion',
        code: 'schemaVersionMismatch',
        message: `Legacy curriculum şema sürümü ${LEGACY_CURRICULUM_SCHEMA_VERSION} olmalı.`,
      });
    }
    for (const key of ['contentVersion', 'curriculumVersion', 'locale'] as const) {
      if (typeof record[key] !== 'string' || record[key].trim().length === 0) {
        issues.push({ at: `curriculum.${key}`, code: 'malformedRecord', message: 'Boş olmayan bir metin bekleniyordu.' });
      }
    }
    for (const key of ['exams', 'subjects', 'units'] as const) {
      if (!Array.isArray(record[key])) {
        issues.push({ at: `curriculum.${key}`, code: 'malformedRecord', message: 'Bir liste bekleniyordu.' });
      }
    }
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  return raw as LegacyCurriculum;
}

function examFamilyId(legacyExamId: string): string {
  return legacyExamId === 'tyt' || legacyExamId === 'ayt' || legacyExamId === 'ydt'
    ? 'yks'
    : legacyExamId;
}

function examFamilyTitle(examId: string): string {
  if (examId === 'yks') return 'YKS';
  if (examId === 'lgs') return 'LGS';
  if (examId === 'kpss') return 'KPSS';
  return examId.toLocaleUpperCase('tr-TR');
}

function programId(legacyExamId: string): string {
  return `${examFamilyId(legacyExamId)}.${legacyExamId}`;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
