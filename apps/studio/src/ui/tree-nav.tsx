import type { ExerciseKind } from '@/modules/curriculum/domain/content-types';

import { EXERCISE_KIND_LABELS } from '../model/exercise-fields';
import type { LessonNode, TopicNode, UnitNode } from '../model/tree';
import { useReorder } from './reorderable';

export type TreeActions = {
  onAddLesson: (topicId: string, unitId: string) => void;
  onAddQuestion: (lessonId: string, topicId: string, unitId: string) => void;
  onAddSkill: (topicId: string, unitId: string) => void;
  onAddTopic: (unitId: string) => void;
  onAddUnit: () => void;
  onDeleteLesson: (lessonId: string, unitId: string) => void;
  onDeleteTopic: (topicId: string, unitId: string) => void;
  onDeleteUnit: (unitId: string) => void;
  onMoveQuestion: (lessonId: string, unitId: string, from: number, to: number) => void;
  onMoveTopic: (unitId: string, from: number, to: number) => void;
  onMoveUnit: (from: number, to: number) => void;
  onRename: (
    kind: 'lesson' | 'skill' | 'topic' | 'unit',
    id: string,
    unitId: string,
    current: string,
  ) => void;
  onSelect: (unitId: string, exerciseId: string) => void;
};

type TreeNavProps = TreeActions & {
  selectedId: string | null;
  tree: readonly UnitNode[];
};

/**
 * Unit → topic → lesson → question, with every action sitting on the level it
 * belongs to. An author should never have to know that a lesson and its
 * questions live in different arrays of the same file.
 */
export function TreeNav({ selectedId, tree, ...actions }: TreeNavProps) {
  const unitDrag = useReorder(actions.onMoveUnit);

  return (
    <nav className="tree">
      {tree.map((unit, unitIndex) => {
        const { className, ...handlers } = unitDrag(unitIndex);

        return (
          <section className={className} key={unit.id} {...handlers}>
            <header className="tree-unit">
              <h2>{unit.title}</h2>
              <div className="row">
                <IconButton
                  disabled={unitIndex === 0}
                  label="Üniteyi yukarı taşı"
                  onClick={() => actions.onMoveUnit(unitIndex, unitIndex - 1)}
                  symbol="↑"
                />
                <IconButton
                  disabled={unitIndex === tree.length - 1}
                  label="Üniteyi aşağı taşı"
                  onClick={() => actions.onMoveUnit(unitIndex, unitIndex + 1)}
                  symbol="↓"
                />
                <IconButton
                  label="Üniteyi yeniden adlandır"
                  onClick={() => actions.onRename('unit', unit.id, unit.id, unit.title)}
                  symbol="✎"
                />
                <IconButton
                  danger
                  label="Üniteyi sil"
                  onClick={() => actions.onDeleteUnit(unit.id)}
                  symbol="✕"
                />
              </div>
            </header>
            <div className="row tree-actions">
              <button onClick={() => actions.onAddTopic(unit.id)} type="button">
                + Konu
              </button>
            </div>

            {unit.topics.length === 0 ? (
              <p className="tree-empty">Bu ünitede henüz konu yok.</p>
            ) : (
              <Topics actions={actions} selectedId={selectedId} unit={unit} />
            )}

            {unit.orphans.length === 0 ? null : (
              <div className="tree-lesson">
                <header>
                  <h4>Derse bağlı olmayan sorular</h4>
                </header>
                {unit.orphans.map((question) => (
                  <div className="question-row" key={question.id}>
                    <QuestionButton
                      onSelect={() => actions.onSelect(unit.id, question.id)}
                      question={question}
                      selected={question.id === selectedId}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <button className="add-unit" onClick={actions.onAddUnit} type="button">
        + Yeni ünite
      </button>
    </nav>
  );
}

function Topics({
  actions,
  selectedId,
  unit,
}: {
  actions: TreeActions;
  selectedId: string | null;
  unit: UnitNode;
}) {
  const topicDrag = useReorder((from, to) => actions.onMoveTopic(unit.id, from, to));

  return (
    <>
      {unit.topics.map((topic, topicIndex) => {
        const { className, ...handlers } = topicDrag(topicIndex);

        return (
          <div className={`tree-topic ${className ?? ''}`} key={topic.id} {...handlers}>
            <header>
              <h3>{topic.title}</h3>
              <div className="row">
                <IconButton
                  disabled={topicIndex === 0}
                  label="Konuyu yukarı taşı"
                  onClick={() => actions.onMoveTopic(unit.id, topicIndex, topicIndex - 1)}
                  symbol="↑"
                />
                <IconButton
                  disabled={topicIndex === unit.topics.length - 1}
                  label="Konuyu aşağı taşı"
                  onClick={() => actions.onMoveTopic(unit.id, topicIndex, topicIndex + 1)}
                  symbol="↓"
                />
                <IconButton
                  label="Konuyu yeniden adlandır"
                  onClick={() => actions.onRename('topic', topic.id, unit.id, topic.title)}
                  symbol="✎"
                />
                <IconButton
                  danger
                  label="Konuyu sil"
                  onClick={() => actions.onDeleteTopic(topic.id, unit.id)}
                  symbol="✕"
                />
              </div>
            </header>

            <div className="skills">
              {topic.skills.map((skill) => (
                <button
                  className="skill"
                  key={skill.id}
                  onClick={() => actions.onRename('skill', skill.id, unit.id, skill.title)}
                  title="Kazanımı yeniden adlandır"
                  type="button"
                >
                  {skill.title} ✎
                </button>
              ))}
            </div>

            <div className="row tree-actions">
              <button onClick={() => actions.onAddSkill(topic.id, unit.id)} type="button">
                + Kazanım
              </button>
              <button
                disabled={topic.skills.length === 0}
                onClick={() => actions.onAddLesson(topic.id, unit.id)}
                title={topic.skills.length === 0 ? 'Önce bu konuya bir kazanım ekle.' : undefined}
                type="button"
              >
                + Ders
              </button>
            </div>

            {topic.lessons.map((lesson) => (
              <Lesson
                actions={actions}
                key={lesson.id}
                lesson={lesson}
                selectedId={selectedId}
                topic={topic}
                unitId={unit.id}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

function Lesson({
  actions,
  lesson,
  selectedId,
  topic,
  unitId,
}: {
  actions: TreeActions;
  lesson: LessonNode;
  selectedId: string | null;
  topic: TopicNode;
  unitId: string;
}) {
  const questionDrag = useReorder((from, to) =>
    actions.onMoveQuestion(lesson.id, unitId, from, to),
  );

  return (
    <div className="tree-lesson">
      <header>
        <h4>{lesson.title}</h4>
        <div className="row">
          <IconButton
            label="Dersi yeniden adlandır"
            onClick={() => actions.onRename('lesson', lesson.id, unitId, lesson.title)}
            symbol="✎"
          />
          <IconButton
            danger
            label="Dersi sil"
            onClick={() => actions.onDeleteLesson(lesson.id, unitId)}
            symbol="✕"
          />
        </div>
      </header>
      {lesson.questions.map((question, index) => {
        const { className, ...handlers } = questionDrag(index);

        return (
          <div className={`question-row ${className ?? ''}`} key={question.id} {...handlers}>
            <QuestionButton
              onSelect={() => actions.onSelect(unitId, question.id)}
              question={question}
              selected={question.id === selectedId}
            />
            <div className="row">
              <IconButton
                disabled={index === 0}
                label="Yukarı taşı"
                onClick={() => actions.onMoveQuestion(lesson.id, unitId, index, index - 1)}
                symbol="↑"
              />
              <IconButton
                disabled={index === lesson.questions.length - 1}
                label="Aşağı taşı"
                onClick={() => actions.onMoveQuestion(lesson.id, unitId, index, index + 1)}
                symbol="↓"
              />
            </div>
          </div>
        );
      })}
      <button
        className="add-inline"
        onClick={() => actions.onAddQuestion(lesson.id, topic.id, unitId)}
        type="button"
      >
        + Soru
      </button>
    </div>
  );
}

function QuestionButton({
  onSelect,
  question,
  selected,
}: {
  onSelect: () => void;
  question: { kind: string; status: string; summary: string };
  selected: boolean;
}) {
  return (
    <button
      aria-label={`${question.summary} — ${question.status}`}
      className={selected ? 'question active' : 'question'}
      onClick={onSelect}
      type="button"
    >
      <span className={`status ${question.status}`} />
      <span className="summary">{question.summary}</span>
      <span className="kind-tag">
        {EXERCISE_KIND_LABELS[question.kind as ExerciseKind] ?? question.kind}
      </span>
    </button>
  );
}

function IconButton({
  danger = false,
  disabled = false,
  label,
  onClick,
  symbol,
}: {
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  symbol: string;
}) {
  return (
    <button
      aria-label={label}
      className={danger ? 'icon danger' : 'icon'}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {symbol}
    </button>
  );
}
