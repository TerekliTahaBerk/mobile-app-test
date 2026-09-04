import { featuresForMode, resolveAppMode } from '@/shared/config/app-config';

describe('app-mode configuration', () => {
  it('uses design preview by default only in development', () => {
    expect(resolveAppMode(undefined, true)).toBe('designPreview');
    expect(resolveAppMode(undefined, false)).toBe('productionPilot');
  });

  it('accepts an explicit production pilot in every build type', () => {
    expect(resolveAppMode('productionPilot', true)).toBe('productionPilot');
    expect(resolveAppMode('productionPilot', false)).toBe('productionPilot');
  });

  it('fails fast when a non-development build explicitly requests design preview', () => {
    expect(() => resolveAppMode('designPreview', false)).toThrow(
      'designPreview is only available when __DEV__ is true',
    );
  });

  it('fails fast for an unknown explicit mode', () => {
    expect(() => resolveAppMode('production', false)).toThrow(
      'Invalid EXPO_PUBLIC_APP_MODE: production',
    );
  });
});

describe('production pilot feature gates', () => {
  it('hides every unfinished economy and unsellable product feature', () => {
    expect(featuresForMode('productionPilot')).toEqual({
      heartsEconomy: false,
      league: false,
      lgs: false,
      plus: false,
    });
  });

  it('keeps them all reviewable in a design preview build', () => {
    expect(featuresForMode('designPreview')).toEqual({
      heartsEconomy: true,
      league: true,
      lgs: true,
      plus: true,
    });
  });
});
