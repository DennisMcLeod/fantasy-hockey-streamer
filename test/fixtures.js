// Shared test fixtures for league settings

// H2H Categories banger league (like Dad's Hockey League)
const catsBangerSettings = {
  meta: { scoring_type: 'head' },
  settings: {
    stat_categories: {
      stats: [
        { stat: { stat_id: 1, display_name: 'G', is_only_display_stat: '0' } },
        { stat: { stat_id: 2, display_name: 'A', is_only_display_stat: '0' } },
        { stat: { stat_id: 3, display_name: 'P', is_only_display_stat: '0' } },
        { stat: { stat_id: 14, display_name: 'SOG', is_only_display_stat: '0' } },
        { stat: { stat_id: 31, display_name: 'HIT', is_only_display_stat: '0' } },
        { stat: { stat_id: 32, display_name: 'BLK', is_only_display_stat: '0' } },
        { stat: { stat_id: 19, display_name: 'W', is_only_display_stat: '0' } },
        { stat: { stat_id: 22, display_name: 'GA', is_only_display_stat: '1' } },
        { stat: { stat_id: 23, display_name: 'GAA', is_only_display_stat: '0' } },
        { stat: { stat_id: 25, display_name: 'SV', is_only_display_stat: '1' } },
        { stat: { stat_id: 26, display_name: 'SV%', is_only_display_stat: '0' } },
      ],
    },
  },
};

// H2H Points league (like KKUPFL)
const pointsSettings = {
  meta: { scoring_type: 'headpoint' },
  settings: {
    stat_categories: {
      stats: [
        { stat: { stat_id: 1, display_name: 'G', is_only_display_stat: '0' } },
        { stat: { stat_id: 2, display_name: 'A', is_only_display_stat: '0' } },
        { stat: { stat_id: 11, display_name: 'SHP', is_only_display_stat: '0' } },
        { stat: { stat_id: 14, display_name: 'SOG', is_only_display_stat: '0' } },
        { stat: { stat_id: 31, display_name: 'HIT', is_only_display_stat: '0' } },
        { stat: { stat_id: 32, display_name: 'BLK', is_only_display_stat: '0' } },
        { stat: { stat_id: 19, display_name: 'W', is_only_display_stat: '0' } },
        { stat: { stat_id: 22, display_name: 'GA', is_only_display_stat: '0' } },
        { stat: { stat_id: 25, display_name: 'SV', is_only_display_stat: '0' } },
        { stat: { stat_id: 27, display_name: 'SHO', is_only_display_stat: '0' } },
      ],
    },
    stat_modifiers: {
      stats: [
        { stat: { stat_id: '1', value: '4.5' } },
        { stat: { stat_id: '2', value: '3' } },
        { stat: { stat_id: '11', value: '2' } },
        { stat: { stat_id: '14', value: '0.5' } },
        { stat: { stat_id: '31', value: '0.25' } },
        { stat: { stat_id: '32', value: '0.5' } },
        { stat: { stat_id: '19', value: '3' } },
        { stat: { stat_id: '22', value: '-1.5' } },
        { stat: { stat_id: '25', value: '0.3' } },
        { stat: { stat_id: '27', value: '3' } },
      ],
    },
  },
};

// H2H Categories with +/-, PPP, FW, SHO (like This Is The League Name)
const catsExtendedSettings = {
  meta: { scoring_type: 'head' },
  settings: {
    stat_categories: {
      stats: [
        { stat: { stat_id: 1, display_name: 'G', is_only_display_stat: '0' } },
        { stat: { stat_id: 2, display_name: 'A', is_only_display_stat: '0' } },
        { stat: { stat_id: 4, display_name: '+/-', is_only_display_stat: '0' } },
        { stat: { stat_id: 8, display_name: 'PPP', is_only_display_stat: '0' } },
        { stat: { stat_id: 14, display_name: 'SOG', is_only_display_stat: '0' } },
        { stat: { stat_id: 16, display_name: 'FW', is_only_display_stat: '0' } },
        { stat: { stat_id: 31, display_name: 'HIT', is_only_display_stat: '0' } },
        { stat: { stat_id: 32, display_name: 'BLK', is_only_display_stat: '0' } },
        { stat: { stat_id: 19, display_name: 'W', is_only_display_stat: '0' } },
        { stat: { stat_id: 23, display_name: 'GAA', is_only_display_stat: '0' } },
        { stat: { stat_id: 26, display_name: 'SV%', is_only_display_stat: '0' } },
        { stat: { stat_id: 27, display_name: 'SHO', is_only_display_stat: '0' } },
      ],
    },
  },
};

// Non-banger categories league (no HIT or BLK)
const catsNoBangerSettings = {
  meta: { scoring_type: 'head' },
  settings: {
    stat_categories: {
      stats: [
        { stat: { stat_id: 1, display_name: 'G', is_only_display_stat: '0' } },
        { stat: { stat_id: 2, display_name: 'A', is_only_display_stat: '0' } },
        { stat: { stat_id: 3, display_name: 'P', is_only_display_stat: '0' } },
        { stat: { stat_id: 14, display_name: 'SOG', is_only_display_stat: '0' } },
        { stat: { stat_id: 19, display_name: 'W', is_only_display_stat: '0' } },
        { stat: { stat_id: 23, display_name: 'GAA', is_only_display_stat: '0' } },
        { stat: { stat_id: 26, display_name: 'SV%', is_only_display_stat: '0' } },
      ],
    },
  },
};

module.exports = { catsBangerSettings, pointsSettings, catsExtendedSettings, catsNoBangerSettings };
