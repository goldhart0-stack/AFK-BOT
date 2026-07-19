export function formatVoiceJoinPermissionError(error) {
  const message = error?.message || '';
  const code = error?.code;

  const isPermissionError = code === 50001 || /missing permissions/i.test(message) || /permission/i.test(message);

  if (isPermissionError) {
    return [
      'I could not join the voice channel. Please check my permissions.',
      '',
      'The bot needs these permissions in the voice channel and server:',
      '- Connect',
      '- Speak',
      '- View Channel',
      '',
      'If the channel is private, make sure the bot is also allowed to access it.',
    ].join('\n');
  }

  return 'I could not join the voice channel.';
}
