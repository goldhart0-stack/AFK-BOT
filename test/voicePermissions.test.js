import test from 'node:test';
import assert from 'node:assert/strict';
import { formatVoiceJoinPermissionError } from '../voicePermissions.js';

test('formats a missing-connect permission error clearly', () => {
  const message = formatVoiceJoinPermissionError({
    code: 50001,
    message: 'Missing Permissions',
  });

  assert.match(message, /Connect/i);
  assert.match(message, /Speak/i);
});

test('falls back to a generic message when the error is unknown', () => {
  const message = formatVoiceJoinPermissionError({ message: 'Voice connection timed out' });

  assert.match(message, /could not join the voice channel/i);
  assert.doesNotMatch(message, /permissions/i);
});
