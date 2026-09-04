import { useEffect, useMemo, useState } from 'react';

import type { ExerciseKind } from '@/modules/curriculum/domain/content-types';
import { transitionReview } from '@/modules/curriculum/domain/review-workflow';

import {
  deleteUnit as deleteUnitFile,
  loadContent,
  saveCurriculum,
  saveUnit,
  validate,
  type ContentSnapshot,
  type UnitFile,
} from './content-client';
import {
  exerciseIdFor,
  lessonIdFor,
  newExercise,
  newLesson,
  newPathNode,
  newSkill,
  newTopic,
  newUnitFile,
  move,
  pathNodeIdFor,
  rechainPath,
  skillIdFor,
  topicIdFor,
  unitIdFor,
} from './model/authoring';
import { buildCoverage } from './model/coverage';
import { EXERCISE_KIND_LABELS } from './model/exercise-fields';
import { buildTree } from './model/tree';
import { CoverageReport } from './ui/coverage-report';
import { ConfirmDialog, type ConfirmSpec } from './ui/confirm-dialog';
import { CreateDialog, type DialogSpec } from './ui/create-dialog';
import { ExerciseEditor } from './ui/exercise-editor';
import { IssueList } from './ui/issue-list';
import { PathOrder } from './ui/path-order';
import { QuestionPreview } from './ui/question-preview';
import { ReviewControl } from './ui/review-control';
import { TreeNav } from './ui/tree-nav';

type Row = Record<string, unknown>;
type Panel = 'coverage' | 'editor' | 'path' | 'preview';
type Pending = { spec: DialogSpec; submit: (values: Readonly<Record<string, string>>) => void };
type PendingDelete = { confirm: () => void; spec: ConfirmSpec };

/**
 * İçerik Stüdyosu.
 *
 * Writes the app's authored files in place and validates with the app's own
 * gates, so what it saves is what the app will load. There is no database and
 * no account: the repository is the store and git is the review trail, which is
 * what makes an approval attributable to a person.
 */
export function App() {
  const [snapshot, setSnapshot] = useState<ContentSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ exerciseId: string; unitId: string } | null>(null);
  const [reviewerId, setReviewerId] = useState('');
  const [dirtyUnits, setDirtyUnits] = useState<ReadonlySet<string>>(new Set());
  const [curriculumDirty, setCurriculumDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<Panel>('editor');
  const [pending, setPending] = useState<Pending | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [removedUnits, setRemovedUnits] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    loadContent()
      .then(setSnapshot)
      .catch((cause: unknown) => setError(asMessage(cause)));
  }, []);

  const validation = useMemo(() => (snapshot === null ? null : validate(snapshot)), [snapshot]);
  const coverage = useMemo(() => (snapshot === null ? [] : buildCoverage(snapshot)), [snapshot]);
  const tree = useMemo(() => (snapshot === null ? [] : buildTree(snapshot)), [snapshot]);

  if (error !== null && snapshot === null) {
    return (
      <main className="message">
        <h1>İçerik açılamadı</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (snapshot === null || validation === null) {
    return (
      <main className="message">
        <h1>İçerik okunuyor…</h1>
      </main>
    );
  }

  const unit = snapshot.units.find((file) => file.unitId === selected?.unitId) ?? null;
  const exercises = (unit?.exercises ?? []) as Row[];
  const exercise = exercises.find((row) => String(row.id) === selected?.exerciseId) ?? null;
  const owningLessonId = exercise === null || unit === null
    ? ''
    : lessonOf(snapshot, unit.unitId, String(exercise.id));
  const owningLesson = ((unit?.lessons ?? []) as Row[]).find(
    (row) => String(row.id) === owningLessonId,
  ) ?? null;
  const skills = ((unit?.skills ?? []) as Row[]).map((skill) => ({
    id: String(skill.id),
    title: String(skill.title),
  }));
  const dirtyCount = dirtyUnits.size + removedUnits.size + (curriculumDirty ? 1 : 0);
  const reviewer = snapshot.reviewers.find((candidate) => candidate.id === reviewerId) ?? null;

  /** Every id in the bundle, so a generated one can never collide with a real one. */
  const takenIds = new Set<string>([
    ...snapshot.curriculum.units.map((entry) => entry.id),
    ...snapshot.units.flatMap((file) =>
      (['concepts', 'exercises', 'lessons', 'pathNodes', 'skills', 'topics'] as const).flatMap(
        (key) => (file[key] as Row[]).map((row) => String(row.id)),
      ),
    ),
  ]);

  const touchUnit = (unitId: string, change: (file: UnitFile) => UnitFile) => {
    setSnapshot((current) =>
      current === null
        ? current
        : {
            ...current,
            units: current.units.map((file) => (file.unitId === unitId ? change(file) : file)),
          },
    );
    setDirtyUnits((current) => new Set([...current, unitId]));
  };

  const addUnit = () =>
    setPending({
      spec: {
        // A unit with no topic, and a topic with no skill, cannot hold a
        // question — so the form asks for all three at once rather than leaving
        // the author on an invalid bundle for three more steps.
        fields: [
          { key: 'title', kind: 'text', label: 'Ünite adı', placeholder: 'Örn. Osmanlı Kuruluşu' },
          {
            choices: (snapshot.curriculum.subjects as Row[]).map((subject) => ({
              label: String(subject.title),
              value: String(subject.id),
            })),
            key: 'subjectId',
            kind: 'choice',
            label: 'Ders',
          },
          {
            key: 'topicTitle',
            kind: 'text',
            label: 'İlk konu',
            placeholder: 'Örn. Beylikten Devlete',
          },
          {
            key: 'skillTitle',
            kind: 'text',
            label: 'İlk kazanım',
            placeholder: 'Örn. Kuruluş koşullarını açıklama',
          },
        ],
        submitLabel: 'Üniteyi oluştur',
        title: 'Yeni ünite',
      },
      submit: ({ skillTitle, subjectId, title, topicTitle }) => {
        const unitId = unitIdFor(subjectId!, title!, takenIds);
        const topicId = topicIdFor(unitId, topicTitle!, takenIds);
        const skillId = skillIdFor(topicId, skillTitle!, new Set([...takenIds, topicId]));
        setSnapshot((current) =>
          current === null
            ? current
            : {
                ...current,
                curriculum: {
                  ...current.curriculum,
                  subjects: (current.curriculum.subjects as Row[]).map((subject) =>
                    String(subject.id) === subjectId
                      ? {
                          ...subject,
                          unitIds: [...(subject.unitIds as string[]), unitId],
                        }
                      : subject,
                  ),
                  units: [
                    ...current.curriculum.units,
                    { id: unitId, subjectId: subjectId!, title: title!, topicIds: [topicId] },
                  ],
                },
                units: [
                  ...current.units,
                  {
                    ...(newUnitFile(unitId) as unknown as UnitFile),
                    skills: [newSkill(skillId, skillTitle!, topicId)],
                    topics: [
                      { ...newTopic(topicId, topicTitle!, unitId), skillIds: [skillId] },
                    ],
                  },
                ],
              },
        );
        setCurriculumDirty(true);
        setDirtyUnits((current) => new Set([...current, unitId]));
        setPending(null);
      },
    });

  const addTopic = (unitId: string) =>
    setPending({
      spec: {
        fields: [
          { key: 'title', kind: 'text', label: 'Konu adı', placeholder: 'Örn. Kut ve Töre' },
          {
            key: 'skillTitle',
            kind: 'text',
            label: 'İlk kazanım',
            placeholder: 'Örn. Kurultayın işlevi',
          },
        ],
        submitLabel: 'Konuyu oluştur',
        title: 'Yeni konu',
      },
      submit: ({ skillTitle, title }) => {
        const topicId = topicIdFor(unitId, title!, takenIds);
        const skillId = skillIdFor(topicId, skillTitle!, new Set([...takenIds, topicId]));
        touchUnit(unitId, (file) => ({
          ...file,
          skills: [...file.skills, newSkill(skillId, skillTitle!, topicId)],
          topics: [
            ...file.topics,
            { ...newTopic(topicId, title!, unitId), skillIds: [skillId] },
          ],
        }));
        setSnapshot((current) =>
          current === null
            ? current
            : {
                ...current,
                curriculum: {
                  ...current.curriculum,
                  units: current.curriculum.units.map((entry) =>
                    entry.id === unitId
                      ? { ...entry, topicIds: [...entry.topicIds, topicId] }
                      : entry,
                  ),
                },
              },
        );
        setCurriculumDirty(true);
        setPending(null);
      },
    });

  const addSkill = (topicId: string, unitId: string) =>
    setPending({
      spec: {
        fields: [
          {
            key: 'title',
            kind: 'text',
            label: 'Kazanım adı',
            placeholder: 'Örn. Kurultayın işlevi',
          },
        ],
        submitLabel: 'Kazanımı oluştur',
        title: 'Yeni kazanım',
      },
      submit: ({ title }) => {
        const skillId = skillIdFor(topicId, title!, takenIds);
        touchUnit(unitId, (file) => ({
          ...file,
          skills: [...file.skills, newSkill(skillId, title!, topicId)],
          topics: (file.topics as Row[]).map((topic) =>
            String(topic.id) === topicId
              ? { ...topic, skillIds: [...(topic.skillIds as string[]), skillId] }
              : topic,
          ),
        }));
        setPending(null);
      },
    });

  const addLesson = (topicId: string, unitId: string) =>
    setPending({
      spec: {
        fields: [{ key: 'title', kind: 'text', label: 'Ders adı', placeholder: 'Örn. Takvimler' }],
        submitLabel: 'Dersi oluştur',
        title: 'Yeni ders',
      },
      submit: ({ title }) => {
        touchUnit(unitId, (file) => {
          const nodes = file.pathNodes as Row[];
          const order = nodes.length + 1;
          const lessonId = lessonIdFor(topicId, takenIds);
          const previous = nodes[nodes.length - 1];

          return {
            ...file,
            lessons: [...file.lessons, newLesson(lessonId, title!, topicId)],
            // A new lesson becomes the next step of its unit's path, chained
            // after the current last one so progression stays a single line.
            pathNodes: [
              ...nodes,
              newPathNode(
                pathNodeIdFor(unitId, order),
                lessonId,
                title!,
                unitId,
                order,
                previous === undefined ? null : String(previous.id),
              ),
            ],
          };
        });
        setPending(null);
      },
    });

  const addQuestion = (lessonId: string, topicId: string, unitId: string) =>
    setPending({
      spec: {
        fields: [
          {
            choices: Object.entries(EXERCISE_KIND_LABELS).map(([value, label]) => ({
              label,
              value,
            })),
            key: 'kind',
            kind: 'choice',
            label: 'Soru türü',
          },
          {
            choices: skillsOf(snapshot, unitId, topicId),
            key: 'skillId',
            kind: 'choice',
            label: 'Kazanım',
          },
        ],
        submitLabel: 'Soruyu oluştur',
        title: 'Yeni soru',
      },
      submit: ({ kind, skillId }) => {
        const exerciseId = exerciseIdFor(lessonId, kind as ExerciseKind, takenIds);
        touchUnit(unitId, (file) => ({
          ...file,
          exercises: [
            ...file.exercises,
            newExercise({
              id: exerciseId,
              kind: kind as ExerciseKind,
              skillId: skillId!,
              tag: titleOfUnit(snapshot, unitId).toLocaleUpperCase('tr-TR'),
            }),
          ],
          lessons: (file.lessons as Row[]).map((lesson) =>
            String(lesson.id) === lessonId
              ? { ...lesson, exerciseIds: [...(lesson.exerciseIds as string[]), exerciseId] }
              : lesson,
          ),
        }));
        setSelected({ exerciseId, unitId });
        setPanel('editor');
        setPending(null);
      },
    });

  const rename = (
    kind: 'lesson' | 'skill' | 'topic' | 'unit',
    id: string,
    unitId: string,
    current: string,
  ) =>
    setPending({
      spec: {
        fields: [{ key: 'title', kind: 'text', label: 'Yeni ad', value: current }],
        submitLabel: 'Adı değiştir',
        title: RENAME_TITLES[kind],
      },
      // Only the title changes. Ids stay put because lessons, path nodes and
      // the learner's own history all point at them.
      submit: ({ title }) => {
        if (kind === 'unit') {
          setSnapshot((snap) =>
            snap === null
              ? snap
              : {
                  ...snap,
                  curriculum: {
                    ...snap.curriculum,
                    units: snap.curriculum.units.map((entry) =>
                      entry.id === id ? { ...entry, title: title! } : entry,
                    ),
                  },
                },
          );
          setCurriculumDirty(true);
          setPending(null);
          return;
        }

        touchUnit(unitId, (file) => {
          if (kind === 'topic') {
            return {
              ...file,
              topics: (file.topics as Row[]).map((topic) =>
                String(topic.id) === id ? { ...topic, title: title! } : topic,
              ),
            };
          }
          if (kind === 'skill') {
            return {
              ...file,
              skills: (file.skills as Row[]).map((skill) =>
                String(skill.id) === id ? { ...skill, title: title! } : skill,
              ),
            };
          }

          return {
            ...file,
            lessons: (file.lessons as Row[]).map((lesson) =>
              String(lesson.id) === id ? { ...lesson, title: title! } : lesson,
            ),
            // The path shows the lesson's name, so renaming one renames both.
            pathNodes: (file.pathNodes as Row[]).map((node) =>
              String(node.lessonId) === id ? { ...node, title: title! } : node,
            ),
          };
        });
        setPending(null);
      },
    });

  const moveQuestion = (lessonId: string, unitId: string, from: number, to: number) =>
    touchUnit(unitId, (file) => ({
      ...file,
      lessons: (file.lessons as Row[]).map((lesson) =>
        String(lesson.id) === lessonId
          ? { ...lesson, exerciseIds: move(lesson.exerciseIds as string[], from, to) }
          : lesson,
      ),
    }));

  /** Reordering topics changes the order every report lists them in. */
  const moveTopic = (unitId: string, from: number, to: number) => {
    touchUnit(unitId, (file) => ({ ...file, topics: [...move(file.topics, from, to)] }));
    setSnapshot((snap) =>
      snap === null
        ? snap
        : {
            ...snap,
            curriculum: {
              ...snap.curriculum,
              units: snap.curriculum.units.map((entry) =>
                entry.id === unitId ? { ...entry, topicIds: [...move(entry.topicIds, from, to)] } : entry,
              ),
            },
          },
    );
    setCurriculumDirty(true);
  };

  /** Units are ordered inside their subject, which is what Öğren lists. */
  const moveUnit = (from: number, to: number) => {
    const unitIds = snapshot.units.map((file) => file.unitId);
    const movedIds = move(unitIds, from, to);
    setSnapshot((snap) =>
      snap === null
        ? snap
        : {
            ...snap,
            curriculum: {
              ...snap.curriculum,
              subjects: (snap.curriculum.subjects as Row[]).map((subject) => ({
                ...subject,
                unitIds: movedIds.filter((id) => (subject.unitIds as string[]).includes(id)),
              })),
              units: movedIds.flatMap(
                (id) => snap.curriculum.units.filter((entry) => entry.id === id),
              ),
            },
            units: move(snap.units, from, to) as UnitFile[],
          },
    );
    setCurriculumDirty(true);
  };

  /**
   * Reordering the path rewrites the chain, so a step's prerequisite is always
   * whatever now sits before it.
   */
  const movePathStep = (unitId: string, from: number, to: number) =>
    touchUnit(unitId, (file) => ({
      ...file,
      pathNodes: [...rechainPath(move(inPathOrder(file.pathNodes as Row[]), from, to))],
    }));

  const moveQuestionToLesson = (exerciseId: string, unitId: string, lessonId: string) =>
    touchUnit(unitId, (file) => ({
      ...file,
      lessons: (file.lessons as Row[]).map((lesson) => {
        const ids = (lesson.exerciseIds as string[]).filter((id) => id !== exerciseId);

        return {
          ...lesson,
          exerciseIds: String(lesson.id) === lessonId ? [...ids, exerciseId] : ids,
        };
      }),
    }));

  const deleteLesson = (lessonId: string, unitId: string) => {
    const file = snapshot.units.find((candidate) => candidate.unitId === unitId);
    const lesson = (file?.lessons as Row[] | undefined)?.find(
      (candidate) => String(candidate.id) === lessonId,
    );
    const questionCount = ((lesson?.exerciseIds ?? []) as string[]).length;

    setPendingDelete({
      confirm: () => {
        const questionIds = new Set((lesson?.exerciseIds ?? []) as string[]);
        touchUnit(unitId, (current) => ({
          ...current,
          exercises: (current.exercises as Row[]).filter(
            (row) => !questionIds.has(String(row.id)),
          ),
          lessons: (current.lessons as Row[]).filter((row) => String(row.id) !== lessonId),
          pathNodes: rechainPath(
            inPathOrder(current.pathNodes as Row[]).filter(
              (node) => String(node.lessonId) !== lessonId,
            ),
          ),
        }));
        setSelected(null);
        setPendingDelete(null);
      },
      spec: {
        confirmLabel: 'Dersi ve sorularını sil',
        detail: `"${String(lesson?.title ?? lessonId)}" dersi, yol üzerindeki adımı ve içindeki ${questionCount} soru silinecek.`,
        title: 'Dersi sil',
      },
    });
  };

  const deleteTopic = (topicId: string, unitId: string) => {
    const file = snapshot.units.find((candidate) => candidate.unitId === unitId);
    const topic = (file?.topics as Row[] | undefined)?.find(
      (candidate) => String(candidate.id) === topicId,
    );
    const lessons = ((file?.lessons ?? []) as Row[]).filter(
      (lesson) => String(lesson.topicId) === topicId,
    );
    const skillIds = new Set(
      ((file?.skills ?? []) as Row[])
        .filter((skill) => String(skill.topicId) === topicId)
        .map((skill) => String(skill.id)),
    );
    const questionCount = ((file?.exercises ?? []) as Row[]).filter((exercise) =>
      (exercise.skillIds as string[]).some((skillId) => skillIds.has(skillId)),
    ).length;

    setPendingDelete({
      confirm: () => {
        const lessonIds = new Set(lessons.map((lesson) => String(lesson.id)));
        touchUnit(unitId, (current) => ({
          ...current,
          concepts: (current.concepts as Row[]).filter(
            (concept) => String(concept.topicId) !== topicId,
          ),
          exercises: (current.exercises as Row[]).filter(
            (exercise) => !(exercise.skillIds as string[]).some((id) => skillIds.has(id)),
          ),
          lessons: (current.lessons as Row[]).filter(
            (lesson) => !lessonIds.has(String(lesson.id)),
          ),
          pathNodes: rechainPath(
            inPathOrder(current.pathNodes as Row[]).filter(
              (node) => !lessonIds.has(String(node.lessonId)),
            ),
          ),
          skills: (current.skills as Row[]).filter((skill) => !skillIds.has(String(skill.id))),
          topics: (current.topics as Row[]).filter((topic) => String(topic.id) !== topicId),
        }));
        setSnapshot((snap) =>
          snap === null
            ? snap
            : {
                ...snap,
                curriculum: {
                  ...snap.curriculum,
                  units: snap.curriculum.units.map((entry) =>
                    entry.id === unitId
                      ? { ...entry, topicIds: entry.topicIds.filter((id) => id !== topicId) }
                      : entry,
                  ),
                },
              },
        );
        setCurriculumDirty(true);
        setSelected(null);
        setPendingDelete(null);
      },
      spec: {
        confirmLabel: 'Konuyu ve içindekileri sil',
        detail: `"${String(topic?.title ?? topicId)}" konusu, ${skillIds.size} kazanım, ${lessons.length} ders ve ${questionCount} soru silinecek.`,
        title: 'Konuyu sil',
      },
    });
  };

  const deleteUnit = (unitId: string) => {
    const file = snapshot.units.find((candidate) => candidate.unitId === unitId);
    const title = titleOfUnit(snapshot, unitId);

    setPendingDelete({
      confirm: () => {
        setSnapshot((snap) =>
          snap === null
            ? snap
            : {
                ...snap,
                curriculum: {
                  ...snap.curriculum,
                  subjects: (snap.curriculum.subjects as Row[]).map((subject) => ({
                    ...subject,
                    unitIds: (subject.unitIds as string[]).filter((id) => id !== unitId),
                  })),
                  units: snap.curriculum.units.filter((entry) => entry.id !== unitId),
                },
                units: snap.units.filter((candidate) => candidate.unitId !== unitId),
              },
        );
        setCurriculumDirty(true);
        setRemovedUnits((current) => new Set([...current, unitId]));
        setDirtyUnits((current) => new Set([...current].filter((id) => id !== unitId)));
        setSelected(null);
        setPendingDelete(null);
      },
      spec: {
        confirmLabel: 'Üniteyi tamamen sil',
        detail: `"${title}" ünitesi ve dosyasındaki ${((file?.topics ?? []) as Row[]).length} konu, ${((file?.lessons ?? []) as Row[]).length} ders, ${((file?.exercises ?? []) as Row[]).length} soru silinecek.`,
        title: 'Üniteyi sil',
      },
    });
  };

  const deleteQuestion = () => {
    if (unit === null || exercise === null) {
      return;
    }
    const exerciseId = String(exercise.id);
    touchUnit(unit.unitId, (file) => ({
      ...file,
      exercises: (file.exercises as Row[]).filter((row) => String(row.id) !== exerciseId),
      lessons: (file.lessons as Row[]).map((lesson) => ({
        ...lesson,
        exerciseIds: (lesson.exerciseIds as string[]).filter((id) => id !== exerciseId),
      })),
    }));
    setSelected(null);
  };

  const replaceExercise = (next: Row) => {
    if (unit === null) {
      return;
    }
    touchUnit(unit.unitId, (file) => ({
      ...file,
      exercises: (file.exercises as Row[]).map((row) => (row.id === next.id ? next : row)),
    }));
  };

  const saveAll = () => {
    setSaving(true);
    const writes = [
      ...(curriculumDirty ? [saveCurriculum(snapshot.curriculum)] : []),
      ...snapshot.units
        .filter((file) => dirtyUnits.has(file.unitId))
        .map((file) => saveUnit(file)),
      ...[...removedUnits].map((unitId) => deleteUnitFile(unitId)),
    ];

    Promise.all(writes)
      .then(() => {
        setDirtyUnits(new Set());
        setRemovedUnits(new Set());
        setCurriculumDirty(false);
        setError(null);
      })
      .catch((cause: unknown) => setError(asMessage(cause)))
      .finally(() => setSaving(false));
  };

  return (
    <div className="layout">
      <aside>
        <h1>İçerik Stüdyosu</h1>
        <label className="field">
          <span className="field-label">İnceleyen</span>
          <select onChange={(event) => setReviewerId(event.target.value)} value={reviewerId}>
            <option value="">— registry’den alan uzmanı seç —</option>
            {snapshot.reviewers.map((candidate) => (
              <option disabled={candidate.status !== 'active'} key={candidate.id} value={candidate.id}>
                {candidate.displayName} · {candidate.id}
              </option>
            ))}
          </select>
        </label>

        <TreeNav
          onAddLesson={addLesson}
          onAddQuestion={addQuestion}
          onAddSkill={addSkill}
          onAddTopic={addTopic}
          onAddUnit={addUnit}
          onDeleteLesson={deleteLesson}
          onDeleteTopic={deleteTopic}
          onDeleteUnit={deleteUnit}
          onMoveQuestion={moveQuestion}
          onMoveTopic={moveTopic}
          onMoveUnit={moveUnit}
          onRename={rename}
          onSelect={(unitId, exerciseId) => {
            setSelected({ exerciseId, unitId });
            setPanel('editor');
          }}
          selectedId={selected?.exerciseId ?? null}
          tree={tree}
        />

        <div className="row panels">
          <button onClick={() => setPanel('path')} type="button">
            Yol sırası
          </button>
          <button onClick={() => setPanel('coverage')} type="button">
            Kapsam raporu
          </button>
        </div>
      </aside>

      <main>
        {panel === 'coverage' ? (
          <CoverageReport coverage={coverage} />
        ) : panel === 'path' ? (
          <PathOrder
            onMove={movePathStep}
            units={tree.map((node) => ({ id: node.id, steps: node.steps, title: node.title }))}
          />
        ) : exercise === null ? (
          <div className="message">
            <h2>Soldan bir soru seç</h2>
            <p className="muted">
              Ya da bir derse <strong>+ Soru</strong>, bir konuya <strong>+ Ders</strong>, bir
              üniteye <strong>+ Konu</strong> ekleyerek yenisini oluştur.
            </p>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button
                className={panel === 'editor' ? 'status-active' : undefined}
                onClick={() => setPanel('editor')}
                type="button"
              >
                Düzenle
              </button>
              <button
                className={panel === 'preview' ? 'status-active' : undefined}
                onClick={() => setPanel('preview')}
                type="button"
              >
                Önizleme
              </button>
              <button className="danger" onClick={deleteQuestion} type="button">
                Soruyu sil
              </button>
            </div>
            {panel === 'preview' ? (
              <QuestionPreview exercise={exercise} />
            ) : (
              <>
                {owningLesson === null ? null : (
                  <section className="editor lesson-review">
                    <h2>{String(owningLesson.title)}</h2>
                    <p className="muted">Ders onayı, içindeki her sorunun onayından ayrıdır.</p>
                    <ReviewControl
                      onChange={(status) => {
                        if (unit === null) return;
                        const provenance = owningLesson.provenance as Parameters<typeof transitionReview>[0];
                        const next = transitionReview(
                          provenance,
                          status,
                          reviewer,
                          new Date().toISOString(),
                          {
                            contentVersion: snapshot.curriculum.contentVersion,
                            curriculumVersion: snapshot.curriculum.curriculumVersion,
                            subjectId: String(
                              snapshot.curriculum.units.find((entry) => entry.id === unit.unitId)
                                ?.subjectId ?? '',
                            ),
                          },
                        );
                        touchUnit(unit.unitId, (file) => ({
                          ...file,
                          lessons: (file.lessons as Row[]).map((row) =>
                            row.id === owningLesson.id ? { ...row, provenance: next } : row,
                          ),
                        }));
                      }}
                      provenance={owningLesson.provenance as Readonly<Record<string, unknown>>}
                      reviewer={reviewer}
                      subjectId={String(
                        snapshot.curriculum.units.find((entry) => entry.id === unit?.unitId)
                          ?.subjectId ?? '',
                      )}
                    />
                  </section>
                )}
                <ExerciseEditor
                  exercise={exercise}
                  lesson={{
                    choices: lessonChoices(snapshot, unit?.unitId ?? '', exercise),
                    onChange: (lessonId) =>
                      moveQuestionToLesson(String(exercise.id), unit?.unitId ?? '', lessonId),
                    selected: owningLessonId,
                  }}
                  onChange={replaceExercise}
                  reviewer={reviewer}
                  skills={skills}
                  version={{
                    contentVersion: snapshot.curriculum.contentVersion,
                  curriculumVersion: snapshot.curriculum.curriculumVersion,
                  subjectId: String(
                    snapshot.curriculum.units.find((entry) => entry.id === unit?.unitId)?.subjectId ?? '',
                  ),
                  }}
                />
              </>
            )}
          </>
        )}
      </main>

      <section className="side">
        <IssueList issues={validation.issues} />
        <div className="save">
          <button className="wide" disabled={saving || dirtyCount === 0} onClick={saveAll} type="button">
            {saving
              ? 'Kaydediliyor…'
              : dirtyCount === 0
                ? 'Kaydedilecek değişiklik yok'
                : `${dirtyCount} dosyayı kaydet`}
          </button>
          {error === null ? null : <p className="warning">{error}</p>}
          {validation.issues.length > 0 && dirtyCount > 0 ? (
            <p className="warning">
              Doğrulama sorunlarıyla kaydedebilirsin; uygulama bu hâliyle açılmaz.
            </p>
          ) : null}
        </div>
      </section>

      {pending === null ? null : (
        <CreateDialog
          onCancel={() => setPending(null)}
          onSubmit={pending.submit}
          spec={pending.spec}
        />
      )}

      {pendingDelete === null ? null : (
        <ConfirmDialog
          onCancel={() => setPendingDelete(null)}
          onConfirm={pendingDelete.confirm}
          spec={pendingDelete.spec}
        />
      )}
    </div>
  );
}

/** Path nodes as the learner walks them, whatever order the file stores. */
function inPathOrder(nodes: readonly Row[]): Row[] {
  return [...nodes].sort((left, right) => Number(left.order) - Number(right.order));
}

const RENAME_TITLES: Readonly<Record<'lesson' | 'skill' | 'topic' | 'unit', string>> = {
  lesson: 'Dersi yeniden adlandır',
  skill: 'Kazanımı yeniden adlandır',
  topic: 'Konuyu yeniden adlandır',
  unit: 'Üniteyi yeniden adlandır',
};

/** The lessons a question could belong to: those of its own subtopic. */
function lessonChoices(
  snapshot: ContentSnapshot,
  unitId: string,
  exercise: Row,
): readonly { label: string; value: string }[] {
  const file = snapshot.units.find((candidate) => candidate.unitId === unitId);
  const skillIds = new Set((exercise.skillIds as string[]) ?? []);
  const topicIds = new Set(
    ((file?.skills ?? []) as Row[])
      .filter((skill) => skillIds.has(String(skill.id)))
      .map((skill) => String(skill.topicId)),
  );

  return ((file?.lessons ?? []) as Row[])
    .filter((lesson) => topicIds.has(String(lesson.topicId)))
    .map((lesson) => ({ label: String(lesson.title), value: String(lesson.id) }));
}

function lessonOf(snapshot: ContentSnapshot, unitId: string, exerciseId: string): string {
  const file = snapshot.units.find((candidate) => candidate.unitId === unitId);

  return String(
    ((file?.lessons ?? []) as Row[]).find((lesson) =>
      (lesson.exerciseIds as string[]).includes(exerciseId),
    )?.id ?? '',
  );
}

function skillsOf(
  snapshot: ContentSnapshot,
  unitId: string,
  topicId: string,
): readonly { label: string; value: string }[] {
  const file = snapshot.units.find((candidate) => candidate.unitId === unitId);

  return ((file?.skills ?? []) as Row[])
    .filter((skill) => String(skill.topicId) === topicId)
    .map((skill) => ({ label: String(skill.title), value: String(skill.id) }));
}

function titleOfUnit(snapshot: ContentSnapshot, unitId: string): string {
  return snapshot.curriculum.units.find((unit) => unit.id === unitId)?.title ?? unitId;
}

function asMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
