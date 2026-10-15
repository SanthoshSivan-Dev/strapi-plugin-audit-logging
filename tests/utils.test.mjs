import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redact, REDACTED } from '../server/src/utils/redact.js';
import {
  DEFAULT_EVENTS,
  getEntitySummary,
  resolveExcludedContentTypes,
  resolveTrackedEvents,
} from '../server/src/utils/events.js';
import config from '../server/src/config/index.js';

test('redact masks sensitive keys case-insensitively at any depth', () => {
  const input = { user: { email: 'a@b.c', Password: 'x', nested: [{ resetPasswordToken: 't' }] }, apiKey: 'k' };
  assert.deepEqual(redact(input), {
    user: { email: 'a@b.c', Password: REDACTED, nested: [{ resetPasswordToken: REDACTED }] },
    apiKey: REDACTED,
  });
});

test('redact accepts extra field names and does not mutate the input', () => {
  const input = { ssn: '123', name: 'n' };
  assert.deepEqual(redact(input, ['ssn']), { ssn: REDACTED, name: 'n' });
  assert.equal(input.ssn, '123');
});

test('redact handles circular references, dates and bigints', () => {
  const input = { date: new Date('2026-01-01T00:00:00.000Z'), big: 10n };
  input.self = input;
  assert.deepEqual(redact(input), { date: '2026-01-01T00:00:00.000Z', big: '10', self: '[Circular]' });
});

test('getEntitySummary extracts content type and entry id', () => {
  assert.deepEqual(getEntitySummary({ uid: 'api::article.article', entry: { id: 4 } }), {
    contentType: 'api::article.article',
    entryId: 4,
  });
  assert.deepEqual(getEntitySummary({ role: { id: 2 } }), { contentType: 'admin::role', entryId: 2 });
  assert.deepEqual(getEntitySummary({ permissions: [{ id: 9 }] }), { contentType: 'admin::permission', entryId: 9 });
  assert.deepEqual(getEntitySummary({}), { contentType: null, entryId: null });
});

test('resolveTrackedEvents uses defaults and applies exclusions', () => {
  assert.equal(resolveTrackedEvents({}).size, DEFAULT_EVENTS.length);
  const events = resolveTrackedEvents({ events: ['entry.create', 'entry.delete'], excludedEvents: ['entry.delete'] });
  assert.deepEqual([...events], ['entry.create']);
});

test('resolveExcludedContentTypes replaces the default list when set', () => {
  assert.ok(resolveExcludedContentTypes({}).has('plugin::upload.file'));
  assert.deepEqual([...resolveExcludedContentTypes({ excludedContentTypes: ['api::x.x'] })], ['api::x.x']);
});

test('config validator accepts defaults and rejects bad values', () => {
  assert.doesNotThrow(() => config.validator(config.default));
  assert.doesNotThrow(() => config.validator({ ...config.default, retentionDays: 0 }));
  assert.throws(() => config.validator({ ...config.default, retentionDays: -1 }));
  assert.throws(() => config.validator({ ...config.default, events: 'entry.create' }));
});
