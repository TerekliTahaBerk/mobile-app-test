import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import type { ContentBundle } from '@/modules/curriculum/domain/content-types';
import {
  assertProductionContentBundle,
  buildProductionContentBundle,
} from '@/modules/curriculum/domain/production-content';
import { reportError } from '@/shared/observability/observability';

/** The only bundle allowed to reach production-pilot screens and routes. */
export const productionPilotBundle: ContentBundle = validateProductionBundle();

function validateProductionBundle(): ContentBundle {
  try {
    return assertProductionContentBundle(buildProductionContentBundle(tytDraftBundle));
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    reportError(error, { operation: 'content.production-validation' });
    throw error;
  }
}
