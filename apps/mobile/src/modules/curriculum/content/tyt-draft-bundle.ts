import curriculum from '@/modules/curriculum/content/data/curriculum.json';
import reviewers from '@/modules/curriculum/content/data/reviewers.json';
import { UNIT_FILES } from '@/modules/curriculum/content/units';
import type { ContentBundle } from '@/modules/curriculum/domain/content-types';
import { assertParsedContentBundle } from '@/modules/curriculum/domain/parse-content-bundle';
import { assertValidContentBundle } from '@/modules/curriculum/domain/validate-content-bundle';
import { reportError } from '@/shared/observability/observability';

/**
 * TYT — engineering vertical slice, assembled from the authored data files.
 *
 * ⚠️  THIS IS NOT PRODUCTION ACADEMIC CONTENT.
 *
 * Original Tarih material written to prove the content contract, the lesson
 * engine and the unit path end to end. Every record carries
 * `reviewStatus: 'draft'` and must stay that way until a human subject-matter
 * reviewer signs it off — see docs/CONTENT_MODEL.md. Nothing here is copied
 * from ÖSYM or any published question bank, and all of it is expected to be
 * replaced.
 *
 * The other subjects are present as **catalogue entries with no units**. That
 * is the honest representation of where the product is: the learner can see
 * that Matematik exists and is coming, and the screens render it as not yet
 * available rather than inventing a level and a progress bar for it.
 *
 * Content lives in `data/` as JSON rather than in this module as a literal, so
 * two people can edit different units without colliding, a change reads as a
 * diff of the records that changed, and the content tool can write it. The
 * The records are proved by `assertParsedContentBundle` before they are typed,
 * and their references by `assertValidContentBundle` after.
 */

export const HISTORY_SUBJECT_ID = 'tyt.history';

/** The unit the design's signature path screen renders. */
export const FIRST_TURKISH_STATES_UNIT_ID = 'tyt.history.first-turkish-states';

/**
 * The node the design shows as the current step, exported so tests and the
 * design-preview screens can name it without hard-coding a string.
 */
export const CHRONOLOGY_LESSON_ID = 'lesson.history.chronology.001';
export const CHRONOLOGY_PATH_NODE_ID = 'path.history.first-turkish-states.03';

function assemble(): unknown {
  const collect = <TKey extends 'concepts' | 'exercises' | 'lessons' | 'pathNodes' | 'skills' | 'topics'>(
    key: TKey,
  ) => UNIT_FILES.flatMap((unit) => unit[key]);

  return {
    ...curriculum,
    concepts: collect('concepts'),
    exercises: collect('exercises'),
    lessons: collect('lessons'),
    pathNodes: collect('pathNodes'),
    reviewers,
    skills: collect('skills'),
    topics: collect('topics'),
  };
}

export const tytDraftBundle: ContentBundle = validateDraftBundle();

function validateDraftBundle(): ContentBundle {
  try {
    return assertValidContentBundle(assertParsedContentBundle(assemble()));
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    reportError(error, { operation: 'content.validation' });
    throw error;
  }
}
