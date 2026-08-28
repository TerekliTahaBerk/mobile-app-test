import type { SubjectThemeKey } from '@/modules/curriculum/domain/content-types';
import type { SubjectIconName } from '@/shared/ui/components/icons';
import { theme } from '@/shared/ui/theme/tokens';

export type SubjectTheme = {
  border: string;
  /** The strongest tone: node faces, progress fills, active outlines. */
  primary: string;
  /** The pressed edge under a node face. */
  depth: string;
  /** Body text on a soft surface. */
  ink: string;
  /** Headings on a soft surface. */
  deep: string;
  icon: SubjectIconName;
  soft: string;
};

/**
 * Resolves a subject's palette and icon from the stable theme key carried on
 * the content record. Screens ask for a theme by key; they never branch on a
 * subject ID.
 */
export function subjectTheme(key: SubjectThemeKey): SubjectTheme {
  const colors = theme.colors.subject[key];

  return { ...colors, icon: key };
}
