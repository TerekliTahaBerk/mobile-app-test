import { featuresForMode } from '@/shared/config/app-config';

describe('production pilot feature gates', () => {
  it('hides every unfinished economy and unsellable product feature', () => {
    expect(featuresForMode('productionPilot')).toEqual({
      heartsEconomy: false,
      league: false,
      plus: false,
    });
  });

  it('keeps them all reviewable in a design preview build', () => {
    expect(featuresForMode('designPreview')).toEqual({
      heartsEconomy: true,
      league: true,
      plus: true,
    });
  });
});
