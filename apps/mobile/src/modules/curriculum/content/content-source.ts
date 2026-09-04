import { createContentIndex, type ContentIndex } from '@/modules/curriculum/domain/content-index';
import { assertValidContentBundle } from '@/modules/curriculum/domain/validate-content-bundle';
import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { productionPilotBundle } from '@/modules/curriculum/content/production-pilot-bundle';
import { APP_MODE } from '@/shared/config/app-config';

let index: ContentIndex | null = null;

/**
 * The single entry point to shipped content.
 *
 * The bundle is validated on first access and the result is cached, so a
 * malformed bundle throws during startup with a list of actionable issues
 * rather than rendering something subtly wrong. Content is compiled into the
 * app today; when it later arrives over the network this is the seam that
 * changes.
 */
export function getContentIndex(): ContentIndex {
  if (index === null) {
    const bundle = APP_MODE === 'productionPilot' ? productionPilotBundle : tytDraftBundle;
    index = createContentIndex(assertValidContentBundle(bundle));
  }

  return index;
}

/** Test seam: forces the next `getContentIndex()` to re-validate. */
export function resetContentIndexForTests(): void {
  index = null;
}
