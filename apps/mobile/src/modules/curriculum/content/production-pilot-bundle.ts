import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import type { ContentBundle } from '@/modules/curriculum/domain/content-types';
import {
  assertProductionContentBundle,
  buildProductionContentBundle,
} from '@/modules/curriculum/domain/production-content';

/** The only bundle allowed to reach production-pilot screens and routes. */
export const productionPilotBundle: ContentBundle = assertProductionContentBundle(
  buildProductionContentBundle(tytDraftBundle),
);
