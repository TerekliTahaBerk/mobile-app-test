import { featuresForMode } from '@/shared/config/app-config';

describe('production pilot feature gates', () => {
  it('hides every unfinished economy and presentation-only product feature', () => {
    expect(featuresForMode('productionPilot')).toEqual({
      gemsEconomy: false,
      heartsEconomy: false,
      league: false,
      plus: false,
      quests: false,
    });
  });
});
