const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { _internals: { buildLeagueWeights, isBangerLeague, buildCategoryWeights, buildManualBoosts } } = require('../lib/stream');
const { catsBangerSettings, pointsSettings, catsExtendedSettings, catsNoBangerSettings } = require('./fixtures');

describe('buildLeagueWeights', () => {
  it('builds weights for a categories banger league', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    assert.equal(w.isPoints, false);
    assert.ok(w.skaterWeights['1'] > 0, 'G should have weight');
    assert.ok(w.skaterWeights['2'] > 0, 'A should have weight');
    assert.ok(w.skaterWeights['31'] > 0, 'HIT should have weight');
    assert.ok(w.skaterWeights['32'] > 0, 'BLK should have weight');
    assert.ok(!w.scoringStatIds.has('22'), 'GA should not be scoring');
    assert.ok(!w.scoringStatIds.has('25'), 'SV should not be scoring');
    assert.ok(w.goalieWeights['19'] > 0, 'W should have weight');
  });

  it('preserves intentional zero weights (nullish coalescing)', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    // Points (stat 3) default is 0 — should NOT fall back to 1
    assert.equal(w.skaterWeights['3'], 0, 'Points should be weighted 0 (avoid double-counting G+A)');
  });

  it('builds weights for a points league from stat_modifiers', () => {
    const w = buildLeagueWeights(pointsSettings);
    assert.equal(w.isPoints, true);
    assert.equal(w.skaterWeights['1'], 4.5);
    assert.equal(w.skaterWeights['2'], 3);
    assert.equal(w.skaterWeights['11'], 2);
    assert.equal(w.skaterWeights['14'], 0.5);
    assert.equal(w.skaterWeights['31'], 0.25);
    assert.equal(w.skaterWeights['32'], 0.5);
    assert.equal(w.goalieWeights['19'], 3);
    assert.equal(w.goalieWeights['22'], -1.5);
    assert.equal(w.goalieWeights['25'], 0.3);
    assert.equal(w.goalieWeights['27'], 3);
  });

  it('includes extended categories like +/-, PPP, FW, SHO', () => {
    const w = buildLeagueWeights(catsExtendedSettings);
    assert.ok(w.skaterWeights['4'] > 0, '+/- should have weight');
    assert.ok(w.skaterWeights['8'] > 0, 'PPP should have weight');
    assert.ok(w.skaterWeights['16'] > 0, 'FW should have weight');
    assert.ok(w.goalieWeights['27'] > 0, 'SHO should have weight');
    assert.ok(w.scoringStatIds.has('4'));
    assert.ok(w.scoringStatIds.has('8'));
    assert.ok(w.scoringStatIds.has('16'));
    assert.ok(w.scoringStatIds.has('27'));
  });
});

describe('isBangerLeague', () => {
  it('returns true when HIT or BLK are scoring stats', () => {
    assert.equal(isBangerLeague(buildLeagueWeights(catsBangerSettings)), true);
  });

  it('returns true for points league with HIT/BLK', () => {
    assert.equal(isBangerLeague(buildLeagueWeights(pointsSettings)), true);
  });

  it('returns false when neither HIT nor BLK are scoring stats', () => {
    assert.equal(isBangerLeague(buildLeagueWeights(catsNoBangerSettings)), false);
  });
});

describe('buildCategoryWeights', () => {
  const w = buildLeagueWeights(catsBangerSettings);

  it('returns null when no category needs', () => {
    assert.equal(buildCategoryWeights(null, w), null);
  });

  it('boosts losing categories with exact multiplier', () => {
    const needs = [
      { statId: '31', name: 'HIT', position: 'skater', status: 'losing', gap: -0.3 },
    ];
    const multipliers = buildCategoryWeights(needs, w);
    // 2.0 + min(1.0, abs(-0.3)) = 2.0 + 0.3 = 2.3
    assert.equal(multipliers['31'], 2.3);
  });

  it('reduces winning-by-a-lot categories to 0.5', () => {
    const needs = [
      { statId: '1', name: 'G', position: 'skater', status: 'winning', gap: 0.5 },
    ];
    const multipliers = buildCategoryWeights(needs, w);
    assert.equal(multipliers['1'], 0.5);
  });

  it('keeps close winning categories at 1.0', () => {
    const needs = [
      { statId: '14', name: 'SOG', position: 'skater', status: 'winning', gap: 0.1 },
    ];
    const multipliers = buildCategoryWeights(needs, w);
    assert.equal(multipliers['14'], 1.0);
  });

  it('uses 1.5x for tied categories', () => {
    const needs = [
      { statId: '14', name: 'SOG', position: 'skater', status: 'tied', gap: 0 },
    ];
    const multipliers = buildCategoryWeights(needs, w);
    assert.equal(multipliers['14'], 1.5);
  });

  it('excludes goalie categories', () => {
    const needs = [
      { statId: '19', name: 'W', position: 'goalie', status: 'losing', gap: -0.5 },
    ];
    const multipliers = buildCategoryWeights(needs, w);
    assert.ok(!multipliers['19'], 'goalie stats should not be in multipliers');
  });
});

describe('buildManualBoosts', () => {
  it('boosts known scoring stats at 2.5x', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const multipliers = buildManualBoosts(['HIT', 'BLK'], w);
    assert.equal(multipliers['31'], 2.5);
    assert.equal(multipliers['32'], 2.5);
  });

  it('returns null for empty valid boosts', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const multipliers = buildManualBoosts(['FAKE'], w);
    assert.equal(multipliers, null);
  });

  it('ignores stats not scored in the league', () => {
    const w = buildLeagueWeights(catsBangerSettings);
    const multipliers = buildManualBoosts(['HIT', '+/-'], w);
    assert.equal(multipliers['31'], 2.5);
    assert.ok(!multipliers['4']);
  });

  it('handles extended stat names', () => {
    const w = buildLeagueWeights(catsExtendedSettings);
    const multipliers = buildManualBoosts(['PPP', 'FW'], w);
    assert.equal(multipliers['8'], 2.5);
    assert.equal(multipliers['16'], 2.5);
  });
});
