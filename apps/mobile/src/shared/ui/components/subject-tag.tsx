import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { theme, type SubjectKey } from '@/shared/ui/theme/tokens';

type SubjectTagProps = {
  label: string;
  subject: SubjectKey;
};

/**
 * The soft context pill that opens an exercise: subject-tinted surface, a solid
 * colour chip, and the topic in eyebrow type.
 */
export function SubjectTag({ label, subject }: SubjectTagProps) {
  const tone = theme.colors.subject[subject];

  return (
    <View style={[styles.pill, { backgroundColor: tone.soft }]}>
      <View style={[styles.chip, { backgroundColor: tone.primary }]} />
      <AppText style={{ color: tone.ink }} variant="eyebrow">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 4,
    height: 12,
    width: 12,
  },
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md + 1,
    paddingVertical: 7,
  },
});
