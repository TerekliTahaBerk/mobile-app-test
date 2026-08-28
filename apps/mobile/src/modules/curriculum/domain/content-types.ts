/**
 * Curriculum and exercise contracts.
 *
 * These are product assets, not screen constants: everything here is
 * serializable, identified by a stable string ID, and free of React, React
 * Native, and UI concerns. Screens must not encode the hierarchy — they read
 * what they need through the content index and their own view models.
 *
 * ID convention (see docs/CONTENT_MODEL.md):
 *   exam      tyt
 *   subject   tyt.social.history
 *   unit      tyt.social.history.first-turkish-states
 *   topic     tyt.social.history.first-turkish-states.kurultay
 *   skill     skill.history.kurultay.function
 *   concept   concept.history.kurultay
 *   lesson    lesson.history.kurultay.001
 *   exercise  exercise.history.kurultay.001.mcq01
 *   path node path.history.first-turkish-states.03
 *
 * IDs are opaque and must survive reordering. Nothing may be identified by its
 * position in an array.
 */

export type ExamId = string;
export type SubjectId = string;
export type UnitId = string;
export type TopicId = string;
export type SkillId = string;
export type ConceptId = string;
export type LessonId = string;
export type ExerciseId = string;
export type PathNodeId = string;

/** ISO-8601 instant. Domain code never reads the clock itself. */
export type Timestamp = string;

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

/**
 * `approved` is reserved for material a human subject-matter reviewer has
 * signed off. Engineering demo content stays `draft` no matter how polished it
 * looks — see docs/CONTENT_MODEL.md.
 */
export type ReviewStatus = 'approved' | 'draft' | 'reviewed';

export type Provenance = {
  author: string;
  /** Free-text note about where the material came from. Never a copied source. */
  readonly note?: string;
  readonly reviewedAt?: Timestamp;
  readonly reviewedBy?: string;
  reviewStatus: ReviewStatus;
};

// ---------------------------------------------------------------------------
// Curriculum hierarchy
// ---------------------------------------------------------------------------

export type Exam = {
  id: ExamId;
  subjectIds: readonly SubjectId[];
  title: string;
};

/**
 * Stable presentation key for a subject. Screens must not branch on subject
 * IDs, so the identity that drives a subject's icon and colour is part of the
 * content record rather than a switch statement in the UI.
 */
export type SubjectThemeKey =
  | 'biology'
  | 'chemistry'
  | 'geography'
  | 'history'
  | 'math'
  | 'philosophy'
  | 'physics'
  | 'turkish';

export type Subject = {
  examId: ExamId;
  id: SubjectId;
  themeKey: SubjectThemeKey;
  title: string;
  /**
   * Empty while the subject is in the catalogue but has no authored material.
   * Screens show these as not yet available rather than inventing progress.
   */
  unitIds: readonly UnitId[];
};

export type Unit = {
  id: UnitId;
  subjectId: SubjectId;
  title: string;
  topicIds: readonly TopicId[];
};

export type Topic = {
  conceptIds: readonly ConceptId[];
  id: TopicId;
  skillIds: readonly SkillId[];
  title: string;
  unitId: UnitId;
};

/** What a learner can demonstrate. Every scored exercise references at least one. */
export type Skill = {
  description: string;
  id: SkillId;
  title: string;
  topicId: TopicId;
};

export type Concept = {
  definition: string;
  id: ConceptId;
  term: string;
  topicId: TopicId;
};

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

export type ExerciseKind =
  | 'fillBlank'
  | 'flashcard'
  | 'matching'
  | 'multipleChoice'
  | 'ordering'
  | 'trueFalse';

/** 1 = recall, 5 = exam-hard. Kept coarse on purpose. */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

type ExerciseBase = {
  difficulty: Difficulty;
  /** Shown after evaluation. Required so a learner always learns from a miss. */
  explanation: string;
  id: ExerciseId;
  provenance: Provenance;
  skillIds: readonly SkillId[];
};

export type MultipleChoiceExercise = ExerciseBase & {
  correctOptionId: string;
  kind: 'multipleChoice';
  options: readonly { id: string; label: string }[];
  prompt: string;
  /** Short subject/topic label for the context pill, e.g. "TARİH · KURULTAY". */
  tag: string;
};

export type FillBlankExercise = ExerciseBase & {
  /** Every selectable token, solution tokens included, in presentation order. */
  bank: readonly { id: string; label: string }[];
  /** The clue shown beside Dino. */
  hint: string;
  kind: 'fillBlank';
  /** Bank token ids in the order that forms the correct sentence. */
  solutionTokenIds: readonly string[];
  title: string;
};

export type FlashcardExercise = ExerciseBase & {
  cards: readonly { back: string; front: string; hint: string; id: string }[];
  kind: 'flashcard';
  tag: string;
};

export type MatchingExercise = ExerciseBase & {
  kind: 'matching';
  pairs: readonly { id: string; left: string; right: string }[];
  subtitle: string;
  tag: string;
  title: string;
};

export type TrueFalseExercise = ExerciseBase & {
  correctAnswer: boolean;
  kind: 'trueFalse';
  /** The claim the learner judges. */
  statement: string;
  tag: string;
};

export type OrderingExercise = ExerciseBase & {
  /** Item ids in the one accepted order. */
  correctOrder: readonly string[];
  items: readonly { id: string; label: string }[];
  kind: 'ordering';
  prompt: string;
  tag: string;
};

export type ExerciseDefinition =
  | FillBlankExercise
  | FlashcardExercise
  | MatchingExercise
  | MultipleChoiceExercise
  | OrderingExercise
  | TrueFalseExercise;

/**
 * Flashcards are self-reported recall, so they complete without being marked
 * right or wrong and never award correctness XP.
 */
export const SCORED_EXERCISE_KINDS: readonly ExerciseKind[] = [
  'fillBlank',
  'matching',
  'multipleChoice',
  'ordering',
  'trueFalse',
];

export function isScoredKind(kind: ExerciseKind): boolean {
  return SCORED_EXERCISE_KINDS.includes(kind);
}

// ---------------------------------------------------------------------------
// Lessons and path
// ---------------------------------------------------------------------------

export type Lesson = {
  estimatedMinutes: number;
  exerciseIds: readonly ExerciseId[];
  id: LessonId;
  provenance: Provenance;
  subtitle: string;
  title: string;
  topicId: TopicId;
};

export type PathNodeKind = 'checkpoint' | 'lesson' | 'practice' | 'review';

/**
 * A stop on the learning path. Deliberately not the same thing as a topic: a
 * topic can span several nodes, and checkpoints span several topics.
 */
export type PathNode = {
  id: PathNodeId;
  kind: PathNodeKind;
  /** Present for nodes a learner can actually open. */
  readonly lessonId?: LessonId;
  /** Ascending; ties are invalid. */
  order: number;
  prerequisiteIds: readonly PathNodeId[];
  title: string;
  unitId: UnitId;
};

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

/** Bumped when these contracts change shape. */
export const CONTENT_SCHEMA_VERSION = 2;

export type ContentBundle = {
  concepts: readonly Concept[];
  /** Editorial version of the material itself. */
  contentVersion: string;
  /** Version of the curriculum structure the material is filed under. */
  curriculumVersion: string;
  exams: readonly Exam[];
  exercises: readonly ExerciseDefinition[];
  lessons: readonly Lesson[];
  locale: string;
  pathNodes: readonly PathNode[];
  readonly publishedAt?: Timestamp;
  schemaVersion: number;
  skills: readonly Skill[];
  subjects: readonly Subject[];
  topics: readonly Topic[];
  units: readonly Unit[];
};
