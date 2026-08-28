import { getContentIndex } from '@/modules/curriculum/content/content-source';
import type { PathNodeKind } from '@/modules/curriculum/domain/content-types';
import type { PathStep, UnitPath } from '@/modules/curriculum/domain/path-progression';
import type {
  PathStepView,
  UnitPathViewModel,
  UnitSection,
} from '@/modules/learn/model/unit-path-view-model';
import type { SubjectProgress } from '@/modules/progress/application/use-progress-dashboard';
import { subjectTheme } from '@/shared/ui/theme/subject-theme';

type BuildInput = {
  hearts: number | null;
  justEarned?: string | null;
  streak: number;
  subject: SubjectProgress;
};

export function buildUnitPathViewModel({
  hearts,
  justEarned = null,
  streak,
  subject,
}: BuildInput): UnitPathViewModel {
  const index = getContentIndex();
  const exam = index.bundle.exams.find((candidate) => candidate.id === subject.subject.examId);

  return {
    hearts,
    justEarned,
    level: subject.level.level,
    sections: subject.paths.map((path, order) => toSection(path, order)),
    streak,
    subjectTheme: subjectTheme(subject.subject.themeKey),
    subjectTitle: `${exam?.title ?? ''} ${subject.subject.title}`.trim(),
    xp: subject.xp,
  };

  function toSection(path: UnitPath, order: number): UnitSection {
    const unit = index.getUnit(path.unitId);
    const total = path.steps.length;
    const done = path.completedCount;
    const locked = total > 0 && path.steps.every((step) => step.status === 'locked');
    const percent = Math.round(path.completion * 100);

    return {
      eyebrow:
        total === 0
          ? `ünite ${order + 1} · yakında`
          : locked
            ? `ünite ${order + 1} · kilitli`
            : done === total
              ? `ünite ${order + 1} · tamamlandı`
              : `ünite ${order + 1} · %${percent}`,
      id: path.unitId,
      locked: locked || total === 0,
      progressLabel:
        total === 0
          ? 'İçerik hazırlanıyor'
          : locked
            ? 'Önceki üniteyi bitirince açılır'
            : done === total
              ? `${done} / ${total} çalışma`
              : `${done} / ${total} çalışma tamam`,
      steps: locked ? [] : path.steps.map(toStepView),
      title: unit.title,
    };
  }
}

function toStepView(step: PathStep): PathStepView {
  const index = getContentIndex();
  const lessonId = step.node.lessonId;

  return {
    detail: describeStep(step),
    id: step.node.id,
    kind: step.node.kind,
    ...(lessonId === undefined ? {} : { lessonId }),
    status: step.status,
    title: step.node.title,
  };

  function describeStep(current: PathStep): string {
    if (current.status === 'locked') {
      return 'önceki adımı bitir';
    }
    if (current.status === 'completed') {
      return 'tamamlandı';
    }
    if (lessonId === undefined) {
      return kindLabel(current.node.kind);
    }

    const lesson = index.getLesson(lessonId);
    const questions = lesson.exerciseIds.length;

    return `${questions} soru · ${lesson.estimatedMinutes} dk`;
  }
}

function kindLabel(kind: PathNodeKind): string {
  switch (kind) {
    case 'checkpoint':
      return 'ünitenin sonu';
    case 'practice':
      return 'hızlı tekrar';
    case 'review':
      return 'tekrar turu';
    case 'lesson':
      return 'çalışma';
  }
}
