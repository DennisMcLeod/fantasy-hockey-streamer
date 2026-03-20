const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

// We test resolveLeague by temporarily pointing config to a temp dir
// Since resolveLeague reads config internally, we mock by writing a temp config
const { resolveLeague, CONFIG_FILE, CONFIG_DIR, saveConfig, loadConfig, ensureConfigDir } = require('../lib/config');

describe('resolveLeague', () => {
  let origConfig;

  beforeEach(() => {
    // Save existing config if any
    if (fs.existsSync(CONFIG_FILE)) {
      origConfig = fs.readFileSync(CONFIG_FILE, 'utf-8');
    }
    ensureConfigDir();
    saveConfig({
      clientId: 'test',
      clientSecret: 'test',
      defaultLeague: '465.l.26962',
      leagues: {
        dads: '465.l.26962',
        kkupfl: '465.l.120836',
        this: '465.l.43677',
      },
    });
  });

  afterEach(() => {
    // Restore original config
    if (origConfig) {
      fs.writeFileSync(CONFIG_FILE, origConfig, { mode: 0o600 });
    } else if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  });

  it('resolves a full league key as-is', () => {
    assert.equal(resolveLeague('465.l.26962'), '465.l.26962');
  });

  it('resolves an exact alias', () => {
    assert.equal(resolveLeague('dads'), '465.l.26962');
    assert.equal(resolveLeague('kkupfl'), '465.l.120836');
  });

  it('resolves a partial alias prefix', () => {
    assert.equal(resolveLeague('kk'), '465.l.120836');
    assert.equal(resolveLeague('da'), '465.l.26962');
  });

  it('is case insensitive', () => {
    assert.equal(resolveLeague('DADS'), '465.l.26962');
    assert.equal(resolveLeague('Kkupfl'), '465.l.120836');
  });

  it('returns default league when no name given', () => {
    assert.equal(resolveLeague(null), '465.l.26962');
    assert.equal(resolveLeague(undefined), '465.l.26962');
  });

  it('returns null for unknown alias', () => {
    assert.equal(resolveLeague('nonexistent'), null);
  });
});
