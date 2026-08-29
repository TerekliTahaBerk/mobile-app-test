import type { ContentSnapshot } from '../content-client';

/**
 * Where the curriculum is thin.
 *
 * Everything here is counted from the authored files rather than from a
 * reviewer's impression, so "this subtopic has one question" is a fact the tool
 * states before anyone decides the unit is finished.
 */

export type SkillCoverage = {
  /** Questions measuring this skill, by difficulty. */
  byDifficulty: readonly number[];
  exercises: number;
  scored: number;
  skillId: string;
  title: string;
  topicTitle: string;
};

export type UnitCoverage = {
  approved: number;
  draft: number;
  exercises: number;
  reviewed: number;
  skills: readonly SkillCoverage[];
  title: string;
  unitId: string;
  /** Skills with no question at all. */
  unmeasuredSkills: number;
};

type Record_ = Readonly<Record<string, unknown>>;

const SCORED_KINDS = ['fillBlank', 'matching', 'multipleChoice', 'ordering', 'trueFalse'];

export function buildCoverage(snapshot: ContentSnapshot): readonly UnitCoverage[] {
  const unitTitles = new Map(snapshot.curriculum.units.map((unit) => [unit.id, unit.title]));

  return snapshot.units.map((unit) => {
    const exercises = unit.exercises as Record_[];
    const topics = unit.topics as Record_[];
    const titleOfTopic = new Map(topics.map((topic) => [String(topic.id), String(topic.title)]));

    const skills = (unit.skills as Record_[]).map((skill): SkillCoverage => {
      const measuring = exercises.filter((exercise) =>
        asArray(exercise.skillIds).includes(String(skill.id)),
      );
      const byDifficulty = [0, 0, 0, 0, 0];
      for (const exercise of measuring) {
        const difficulty = Number(exercise.difficulty);
        if (Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 5) {
          byDifficulty[difficulty - 1] = (byDifficulty[difficulty - 1] ?? 0) + 1;
        }
      }

      return {
        byDifficulty,
        exercises: measuring.length,
        scored: measuring.filter((exercise) => SCORED_KINDS.includes(String(exercise.kind))).length,
        skillId: String(skill.id),
        title: String(skill.title),
        topicTitle: titleOfTopic.get(String(skill.topicId)) ?? '—',
      };
    });

    const statusCount = (status: string) =>
      exercises.filter((exercise) => reviewStatusOf(exercise) === status).length;

    return {
      approved: statusCount('approved'),
      draft: statusCount('draft'),
      exercises: exercises.length,
      reviewed: statusCount('reviewed'),
      skills,
      title: unitTitles.get(unit.unitId) ?? unit.unitId,
      unitId: unit.unitId,
      unmeasuredSkills: skills.filter((skill) => skill.exercises === 0).length,
    };
  });
}

/** The shortest true thing that identifies a question in a list. */
export function summaryOf(exercise: Readonly<Record<string, unknown>>): string {
  for (const key of ['prompt', 'statement', 'title', 'hint']) {
    const value = exercise[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value.length > 60 ? `${value.slice(0, 57)}…` : value;
    }
  }
  const cards = exercise.cards;
  if (Array.isArray(cards) && cards.length > 0) {
    const fronts = cards
      .map((card) =>
        typeof card === 'object' && card !== null
          ? String((card as Record<string, unknown>).front ?? '')
          : '',
      )
      .filter((front) => front !== '');
    if (fronts.length > 0) {
      return fronts.join(' · ');
    }
  }

  return String(exercise.id ?? '—');
}

export function reviewStatusOf(exercise: Readonly<Record<string, unknown>>): string {
  const provenance = exercise.provenance;
  if (typeof provenance !== 'object' || provenance === null) {
    return 'draft';
  }

  return String((provenance as Record_).reviewStatus ?? 'draft');
}

function asArray(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.map(String) : [];
}
