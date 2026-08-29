import type { ContentSnapshot } from '../content-client';

import { reviewStatusOf, summaryOf } from './coverage';

/**
 * The content as an author thinks about it: unit → topic → lesson → question.
 *
 * The files are flat lists because that is what diffs well and what the app
 * reads. Navigation is not: an author looks for "the second lesson of Kurultay",
 * never for "the eleventh element of the exercises array".
 */

export type QuestionNode = {
  id: string;
  kind: string;
  status: string;
  summary: string;
};

export type LessonNode = {
  id: string;
  questions: readonly QuestionNode[];
  title: string;
};

export type TopicNode = {
  id: string;
  lessons: readonly LessonNode[];
  skills: readonly { id: string; title: string }[];
  title: string;
};

export type PathStep = {
  id: string;
  lessonTitle: string;
  questionCount: number;
  topicTitle: string;
};

export type UnitNode = {
  id: string;
  /** Questions no lesson lists. They exist, so the tree admits them. */
  orphans: readonly QuestionNode[];
  /** The unit's single chain of steps, in the order a learner meets them. */
  steps: readonly PathStep[];
  title: string;
  topics: readonly TopicNode[];
};

type Row = Readonly<Record<string, unknown>>;

export function buildTree(snapshot: ContentSnapshot): readonly UnitNode[] {
  const unitTitles = new Map(snapshot.curriculum.units.map((unit) => [unit.id, unit.title]));

  return snapshot.units.map((file) => {
    const exercises = new Map(
      (file.exercises as Row[]).map((exercise) => [String(exercise.id), exercise]),
    );
    const lessons = file.lessons as Row[];
    const claimed = new Set(
      lessons.flatMap((lesson) =>
        Array.isArray(lesson.exerciseIds) ? lesson.exerciseIds.map(String) : [],
      ),
    );

    const topics = (file.topics as Row[]).map((topic): TopicNode => {
      const topicId = String(topic.id);

      return {
        id: topicId,
        lessons: lessons
          .filter((lesson) => String(lesson.topicId) === topicId)
          .map((lesson) => ({
            id: String(lesson.id),
            questions: (Array.isArray(lesson.exerciseIds) ? lesson.exerciseIds : [])
              .map(String)
              .flatMap((exerciseId) => {
                const exercise = exercises.get(exerciseId);
                return exercise === undefined ? [] : [toQuestion(exercise)];
              }),
            title: String(lesson.title),
          })),
        skills: (file.skills as Row[])
          .filter((skill) => String(skill.topicId) === topicId)
          .map((skill) => ({ id: String(skill.id), title: String(skill.title) })),
        title: String(topic.title),
      };
    });

    const topicTitles = new Map(
      (file.topics as Row[]).map((topic) => [String(topic.id), String(topic.title)]),
    );
    const lessonById = new Map(lessons.map((lesson) => [String(lesson.id), lesson]));

    return {
      id: file.unitId,
      steps: [...(file.pathNodes as Row[])]
        .sort((left, right) => Number(left.order) - Number(right.order))
        .map((node) => {
          const lesson = lessonById.get(String(node.lessonId));

          return {
            id: String(node.id),
            lessonTitle: String(lesson?.title ?? node.title),
            questionCount: Array.isArray(lesson?.exerciseIds) ? lesson.exerciseIds.length : 0,
            topicTitle: topicTitles.get(String(lesson?.topicId)) ?? '—',
          };
        }),
      orphans: [...exercises.values()]
        .filter((exercise) => !claimed.has(String(exercise.id)))
        .map(toQuestion),
      title: unitTitles.get(file.unitId) ?? file.unitId,
      topics,
    };
  });
}

function toQuestion(exercise: Row): QuestionNode {
  return {
    id: String(exercise.id),
    kind: String(exercise.kind),
    status: reviewStatusOf(exercise),
    summary: summaryOf(exercise),
  };
}
