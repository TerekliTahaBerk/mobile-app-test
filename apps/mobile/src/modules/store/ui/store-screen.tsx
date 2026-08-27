import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  storePreviewData,
  type PlanKey,
  type PlanPreview,
  type StorePreviewViewModel,
} from '@/modules/store/model/store-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { CloseGlyph, GemGlyph, HeartGlyph } from '@/shared/ui/components/glyphs';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { theme } from '@/shared/ui/theme/tokens';

type StoreScreenProps = {
  onClose: () => void;
};

/**
 * Design screen 13. Plan selection is local state and the CTA is inert: the
 * app has no billing integration and collects nothing. See the module's model.
 */
export function StoreScreen({ onClose }: StoreScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('yearly');
  const { campaign, consumables, consumablesTitle, footnote, intro, perks, plans } =
    storePreviewData;

  const activePlan = plans.find((plan) => plan.id === selectedPlan) ?? plans[0];

  return (
    <Screen includeBottomInset={false} testID="store-screen">
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Mağazayı kapat"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.closeButton}
          testID="store-close"
        >
          <CloseGlyph />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View
          accessible
          accessibilityLabel={`${campaign.eyebrow}. ${campaign.headline}`}
          style={styles.campaign}
        >
          <View style={styles.campaignChip}>
            <AppText align="center" style={styles.campaignDays} variant="headingXS">
              {campaign.days}
            </AppText>
            <AppText align="center" style={styles.campaignDaysUnit} variant="eyebrow">
              {campaign.daysUnit}
            </AppText>
          </View>
          <View style={styles.campaignCopy}>
            <AppText style={styles.campaignEyebrow} variant="eyebrow">
              {campaign.eyebrow}
            </AppText>
            <AppText style={styles.campaignHeadline} variant="headingXS">
              {campaign.headline}
            </AppText>
          </View>
        </View>

        <View style={styles.intro}>
          <Cizgi mood={intro.mood} width={74} />
          <View style={styles.introCopy}>
            <AppText accessibilityRole="header" variant="headingL">
              {intro.title}
            </AppText>
            <AppText color="secondary" variant="prose">
              {intro.body}
            </AppText>
          </View>
        </View>

        <View accessibilityRole="radiogroup" style={styles.plans}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              plan={plan}
              selected={plan.id === selectedPlan}
            />
          ))}
        </View>

        <View style={styles.perks}>
          {perks.map((perk) => (
            <View accessible key={perk.id} style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: perkSurfaces[perk.kind] }]}>
                <PerkGlyph kind={perk.kind} />
              </View>
              <AppText color="body" style={styles.perkLabel} variant="bodyS">
                {perk.label}
              </AppText>
            </View>
          ))}
        </View>

        <AppText color="eyebrow" variant="eyebrow">
          {consumablesTitle}
        </AppText>

        <View style={styles.consumables}>
          {consumables.map((item) => (
            <View
              accessible
              accessibilityLabel={`${item.title}, ${item.price}`}
              key={item.id}
              style={styles.consumable}
            >
              {item.kind === 'gem' ? <GemGlyph size={20} /> : <HeartGlyph size={20} />}
              <View>
                <AppText color="body" variant="labelS">
                  {item.title}
                </AppText>
                <AppText color="muted" style={styles.consumablePrice} variant="bodyS">
                  {item.price}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomAction>
        <AppButton
          accessibilityHint="Satın alma henüz etkin değil"
          label={activePlan?.cta ?? ''}
          onPress={() => undefined}
          testID="store-cta"
        />
        <AppText align="center" color="muted" variant="bodyS">
          {footnote}
        </AppText>
      </BottomAction>
    </Screen>
  );
}

type PlanCardProps = {
  onPress: () => void;
  plan: PlanPreview;
  selected: boolean;
};

function PlanCard({ onPress, plan, selected }: PlanCardProps) {
  return (
    <View style={styles.planFrame}>
      <TactilePressable
        accessibilityLabel={`${plan.title}. ${plan.meta}. Aylık ${plan.perMonth}${
          plan.badge ? `. ${plan.badge}` : ''
        }`}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        depth={0}
        depthColor="transparent"
        faceStyle={[styles.planFace, selected && styles.planFaceSelected]}
        onPress={onPress}
        radius={theme.radii.large}
        testID={`store-plan-${plan.id}`}
      >
        <View style={styles.planRow}>
          <View style={styles.planCopy}>
            <AppText variant="headingXS">{plan.title}</AppText>
            <AppText color="muted" style={styles.planMeta} variant="bodyS">
              {plan.meta}
            </AppText>
          </View>
          <View>
            <AppText align="right" variant="headingM">
              {plan.perMonth}
            </AppText>
            <AppText align="right" color="faint" style={styles.planMeta} variant="bodyS">
              {plan.perMonthUnit}
            </AppText>
          </View>
        </View>
      </TactilePressable>

      {plan.badge === undefined ? null : (
        <View importantForAccessibility="no-hide-descendants" style={styles.planBadge}>
          <AppText color="inverse" style={styles.planBadgeLabel} variant="eyebrow">
            {plan.badge}
          </AppText>
        </View>
      )}
    </View>
  );
}

function PerkGlyph({ kind }: { kind: StorePreviewViewModel['perks'][number]['kind'] }) {
  if (kind === 'heart') {
    return <HeartGlyph size={17} />;
  }
  if (kind === 'trace') {
    return <TraceMark size="xs" />;
  }
  if (kind === 'notebook') {
    return (
      <AppText color="success" variant="labelS">
        ✓
      </AppText>
    );
  }

  return (
    <View style={styles.crossGlyph}>
      <View style={[styles.crossBar, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.crossBar, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

const perkSurfaces: Record<StorePreviewViewModel['perks'][number]['kind'], string> = {
  ad: theme.colors.subject.religion.soft,
  heart: theme.colors.status.dangerSoft,
  notebook: theme.colors.subject.geography.soft,
  trace: theme.colors.trace.surface,
};

const styles = StyleSheet.create({
  campaign: {
    alignItems: 'center',
    backgroundColor: theme.colors.campaign.surface,
    borderColor: theme.colors.campaign.border,
    borderRadius: theme.radii.xlarge - 4,
    borderWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg - 1,
  },
  campaignChip: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.small + 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  campaignCopy: {
    flex: 1,
    gap: theme.spacing.xs + 1,
  },
  campaignDays: {
    color: theme.colors.campaign.accent,
  },
  campaignDaysUnit: {
    color: theme.colors.campaign.muted,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  campaignEyebrow: {
    color: theme.colors.campaign.eyebrow,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  campaignHeadline: {
    color: theme.colors.campaign.ink,
    lineHeight: 20,
  },
  consumable: {
    alignItems: 'center',
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.hairline,
    borderRadius: theme.radii.medium,
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm + 2,
    padding: theme.spacing.md + 1,
  },
  consumablePrice: {
    marginTop: theme.spacing.xs,
  },
  consumables: {
    flexDirection: 'row',
    gap: theme.spacing.sm + 2,
  },
  closeButton: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    width: theme.hitTarget,
  },
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  crossBar: {
    backgroundColor: theme.colors.subject.religion.ink,
    borderRadius: theme.radii.xs,
    height: 3.5,
    position: 'absolute',
    width: 14,
  },
  crossGlyph: {
    alignItems: 'center',
    height: 14,
    justifyContent: 'center',
    width: 14,
  },
  intro: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  introCopy: {
    flex: 1,
    gap: theme.spacing.xs + 1,
  },
  perkIcon: {
    alignItems: 'center',
    borderRadius: theme.radii.small - 2,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  perkLabel: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 20,
  },
  perkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
  },
  perks: {
    gap: theme.spacing.md + 1,
  },
  planBadge: {
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.pill,
    left: theme.spacing.lg + 2,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 1,
    position: 'absolute',
    top: -11,
  },
  planBadgeLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  planCopy: {
    flex: 1,
    gap: theme.spacing.xs + 1,
  },
  planFace: {
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.subtle,
    borderWidth: 2,
    padding: theme.spacing.lg + 1,
  },
  planFaceSelected: {
    backgroundColor: theme.colors.action.primaryTint,
    borderColor: theme.colors.action.primary,
  },
  planFrame: {
    position: 'relative',
  },
  planMeta: {
    marginTop: theme.spacing.xs + 1,
  },
  planRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  plans: {
    gap: theme.spacing.md - 1,
    marginTop: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
});
