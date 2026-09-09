import type {
  ContentBundle,
  Exam,
  ExerciseDefinition,
  ExerciseId,
  Lesson,
  LessonId,
  PathNode,
  Program,
  ProgramId,
  Skill,
  SkillId,
  Subject,
  SubjectId,
  Topic,
  TopicId,
  Unit,
  UnitId,
} from '@/modules/curriculum/domain/content-types';

/**
 * Read model over a validated bundle. Screens and the lesson engine look
 * records up by ID instead of walking arrays, so the hierarchy can change
 * without touching call sites.
 *
 * Every getter throws on a miss: the bundle was validated at load, so an
 * unknown ID is a programming error, not a runtime condition to branch on.
 */
export type ContentIndex = {
  readonly bundle: ContentBundle;
  getExercise: (id: ExerciseId) => ExerciseDefinition;
  getExerciseTaxonomy: (id: ExerciseId) => ExerciseTaxonomy;
  getExamOfProgram: (id: ProgramId) => Exam;
  getLesson: (id: LessonId) => Lesson;
  getLessonExercises: (id: LessonId) => readonly ExerciseDefinition[];
  getProgramOfSubject: (id: SubjectId) => Program;
  getSkill: (id: SkillId) => Skill;
  getSubjectOfUnit: (id: UnitId) => Subject;
  getTopic: (id: TopicId) => Topic;
  getUnit: (id: UnitId) => Unit;
  /** Nodes of a unit in ascending path order. */
  getUnitPath: (id: UnitId) => readonly PathNode[];
};

/** Product-facing topic labels derived from an exercise's skill mappings. */
export type ExerciseTaxonomy = {
  /** A content Unit is the learner-facing main topic. */
  mainTopic: Unit;
  skills: readonly Skill[];
  /** Content Topics are the learner-facing subtopics. */
  subtopics: readonly Topic[];
};

export function createContentIndex(bundle: ContentBundle): ContentIndex {
  const byId = <T extends { id: string }>(records: readonly T[]) =>
    new Map(records.map((record) => [record.id, record]));

  const exercises = byId(bundle.exercises);
  const exams = byId(bundle.manifest.exams);
  const lessons = byId(bundle.lessons);
  const programs = byId(bundle.manifest.programs);
  const skills = byId(bundle.skills);
  const subjects = byId(bundle.manifest.subjects);
  const topics = byId(bundle.topics);
  const units = byId(bundle.manifest.units);

  const require = <T>(map: ReadonlyMap<string, T>, id: string, label: string): T => {
    const record = map.get(id);
    if (record === undefined) {
      throw new Error(`İçerik dizininde ${label} bulunamadı: "${id}".`);
    }

    return record;
  };

  const pathByUnit = new Map<UnitId, PathNode[]>();
  for (const node of bundle.pathNodes) {
    const nodes = pathByUnit.get(node.unitId) ?? [];
    nodes.push(node);
    pathByUnit.set(node.unitId, nodes);
  }
  for (const nodes of pathByUnit.values()) {
    nodes.sort((a, b) => a.order - b.order);
  }

  const getLesson = (id: LessonId) => require(lessons, id, 'ders');
  const getExercise = (id: ExerciseId) => require(exercises, id, 'alıştırma');
  const getUnit = (id: UnitId) => require(units, id, 'ünite');
  const getTopic = (id: TopicId) => require(topics, id, 'konu');
  const getSkill = (id: SkillId) => require(skills, id, 'kazanım');

  return {
    bundle,
    getExercise,
    getExerciseTaxonomy: (id) => {
      const exerciseSkills = getExercise(id).skillIds.map(getSkill);
      const subtopics = [...new Map(
        exerciseSkills.map((skill) => {
          const topic = getTopic(skill.topicId);
          return [topic.id, topic] as const;
        }),
      ).values()];
      const unitIds = new Set(subtopics.map((topic) => topic.unitId));
      if (unitIds.size !== 1) {
        throw new Error(`Alıştırma tek bir ana konuya bağlanmalı: "${id}".`);
      }

      return {
        mainTopic: getUnit([...unitIds][0]!),
        skills: exerciseSkills,
        subtopics,
      };
    },
    getExamOfProgram: (id) => require(exams, require(programs, id, 'program').examId, 'sınav'),
    getLesson,
    getLessonExercises: (id) => getLesson(id).exerciseIds.map(getExercise),
    getProgramOfSubject: (id) =>
      require(programs, require(subjects, id, 'ders').programId, 'program'),
    getSkill,
    getSubjectOfUnit: (id) => require(subjects, getUnit(id).subjectId, 'ders'),
    getTopic,
    getUnit,
    getUnitPath: (id) => pathByUnit.get(id) ?? [],
  };
}
