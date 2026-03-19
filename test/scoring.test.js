const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { _internals: { skaterQuality, goalieQuality, playerQuality, weightedQuality, buildLeagueWeights, scoreStreamers } } = require('../lib/stream');
const { catsBangerSettings, pointsSettings, catsNoBangerSettings } = require('./fixtures');

describe('skaterQuality', () => {
  it('returns 0 for 0 GP', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    assert.equal(skaterQuality({ '1': 10, '2': 5 }, 0, w.skaterWeights), 0);
  });

  it('computes exact per-game weighted score for categories league', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    // 10G * 3 + 5A * 2 + 50SOG * 0.3 + 0HIT + 0BLK + 0P*0 = 30 + 10 + 15 = 55 / 20 = 2.75
    const stats = { '1': 10, '2': 5, '14': 50, '31': 0, '32': 0 };
    assert.equal(skaterQuality(stats, 20, w.skaterWeights), 2.75);
  });

  it('uses points league weights when configured', () => {
    const w = buildLeagueWeights(pointsSettings);
    // 10G * 4.5 + 5A * 3 + 50SOG * 0.5 + 0HIT + 0BLK = 45 + 15 + 25 = 85 / 20 = 4.25
    const stats = { '1': 10, '2': 5, '14': 50, '31': 0, '32': 0 };
    assert.equal(skaterQuality(stats, 20, w.skaterWeights), 4.25);
  });

  it('includes SHP for points leagues', () => {
    const w = buildLeagueWeights(pointsSettings);
    // 1 SHP * 2 = 2 / 10 GP = 0.2
    const stats = { '11': 1 };
    assert.equal(skaterQuality(stats, 10, w.skaterWeights), 0.2);
  });
});

describe('goalieQuality', () => {
  it('returns 0 for 0 GP', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    assert.equal(goalieQuality({ '19': 10 }, 0, w.goalieWeights), 0);
  });

  it('computes quality with W and SV% bonus', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    // W=10 * 5 = 50, GAA=2.50 bonus = max(0, 3.00-2.50)*2 = 1.0, SV%=.920 bonus = max(0, .020)*200 = 4.0
    // total = 50 + 1.0 + 4.0 = 55, / 20 GP = 2.75
    const stats = { '19': 10, '23': 2.50, '26': 0.920 };
    assert.equal(goalieQuality(stats, 20, w.goalieWeights), 2.75);
  });
});

describe('playerQuality', () => {
  it('routes skater to skaterQuality with correct value', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const player = { isGoalie: false, stats: { '0': 20, '1': 10, '2': 5, '14': 50 }, gamesPlayed: 20 };
    assert.equal(playerQuality(player, w), 2.75);
  });

  it('routes goalie to goalieQuality', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const player = { isGoalie: true, stats: { '0': 20, '19': 10, '23': 2.50, '26': 0.920 }, gamesPlayed: 20 };
    assert.equal(playerQuality(player, w), 2.75);
  });

  it('returns 0 for player with empty stats', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    assert.equal(playerQuality({ isGoalie: false, stats: {}, gamesPlayed: 0 }, w), 0);
  });
});

describe('weightedQuality', () => {
  it('applies category multipliers to league weights', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const stats = { '1': 10, '2': 10, '31': 20 };
    const gp = 10;

    // Without multipliers: 10*3 + 10*2 + 20*0.3 = 30+20+6 = 56 / 10 = 5.6
    const base = weightedQuality(stats, gp, w, null);
    assert.equal(base, 5.6);

    // With HIT boosted 2.5x: 10*3 + 10*2 + 20*0.3*2.5 = 30+20+15 = 65 / 10 = 6.5
    const boosted = weightedQuality(stats, gp, w, { '31': 2.5 });
    assert.equal(boosted, 6.5);
  });

  it('returns 0 for 0 GP', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    assert.equal(weightedQuality({ '1': 10 }, 0, w, null), 0);
  });
});

describe('scoreStreamers', () => {
  // Build minimal day and FA fixtures
  function makeDay(date, totalEmpty, isPast = false) {
    return {
      date, dayAbbrev: 'Mon', numberOfGames: 8, isOffNight: false, isPast,
      playingPlayers: [], filled: {}, benched: [],
      empty: { C: totalEmpty > 0 ? 1 : 0, D: 0, LW: 0, RW: 0, Util: Math.max(0, totalEmpty - 1) },
      totalEmpty, totalFilled: 11 - totalEmpty, totalSlots: 11,
    };
  }

  function makeFA(name, nhlTeam, stats = {}) {
    return {
      playerKey: `465.p.${name.toLowerCase().replace(/\s/g, '')}`,
      name, nhlTeam, displayPosition: 'C',
      eligiblePositions: ['C', 'Util'], playingPositions: ['C'],
      isGoalie: false, stats, yahooRank: 1, gamesPlayed: 0,
    };
  }

  it('filters out FAs that fill no empty slots', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const days = [makeDay('2026-03-17', 2), makeDay('2026-03-18', 0)];
    const teamGameDays = new Map([['TOR', ['2026-03-18']]]); // only plays on day with 0 empty
    const fas = [makeFA('No Fit', 'TOR')];
    const result = scoreStreamers(fas, days, teamGameDays, null, w);
    assert.equal(result.length, 0);
  });

  it('includes FAs that fill empty slots', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const days = [makeDay('2026-03-17', 2)];
    const teamGameDays = new Map([['TOR', ['2026-03-17']]]);
    const fas = [makeFA('Good Fit', 'TOR')];
    const result = scoreStreamers(fas, days, teamGameDays, null, w);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Good Fit');
    assert.ok(result[0].score > 0);
    assert.deepEqual(result[0].fillsDays, ['2026-03-17']);
  });

  it('ranks higher-quality FA above lower-quality', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const days = [makeDay('2026-03-17', 2)];
    const teamGameDays = new Map([['TOR', ['2026-03-17']], ['MTL', ['2026-03-17']]]);
    const fas = [
      makeFA('Low', 'TOR', { '1': 1, '2': 1, '0': 20 }),
      makeFA('High', 'MTL', { '1': 10, '2': 10, '0': 20 }),
    ];
    const result = scoreStreamers(fas, days, teamGameDays, null, w);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'High');
  });

  it('gives off-night bonus', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const offNightDay = {
      ...makeDay('2026-03-17', 2),
      isOffNight: true,
    };
    const normalDay = makeDay('2026-03-18', 2);
    const teamGameDays = new Map([
      ['TOR', ['2026-03-17']],
      ['MTL', ['2026-03-18']],
    ]);
    const fas = [
      makeFA('Off Night', 'TOR'),
      makeFA('Normal Night', 'MTL'),
    ];
    const result = scoreStreamers(fas, [offNightDay, normalDay], teamGameDays, null, w);
    const offPlayer = result.find(r => r.name === 'Off Night');
    const normPlayer = result.find(r => r.name === 'Normal Night');
    assert.ok(offPlayer.scheduleScore > normPlayer.scheduleScore, 'off-night should score higher');
  });

  it('applies category multipliers when provided', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const days = [makeDay('2026-03-17', 2)];
    const teamGameDays = new Map([['TOR', ['2026-03-17']]]);
    const fas = [makeFA('Hitter', 'TOR', { '31': 30, '0': 20 })];

    const noBoost = scoreStreamers(fas, days, teamGameDays, null, w);
    const withBoost = scoreStreamers(fas, days, teamGameDays, { '31': 3.0 }, w);

    assert.ok(withBoost[0].quality > noBoost[0].quality, 'boosted HIT should increase quality');
  });

  it('skips past days', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const days = [makeDay('2020-01-01', 2, true), makeDay('2099-12-31', 2)];
    const teamGameDays = new Map([['TOR', ['2020-01-01', '2099-12-31']]]);
    const fas = [makeFA('Future', 'TOR')];
    const result = scoreStreamers(fas, days, teamGameDays, null, w);
    // Should only fill the future day
    assert.deepEqual(result[0].fillsDays, ['2099-12-31']);
  });
});
