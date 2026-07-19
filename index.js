import { Client, GatewayIntentBits, Events, ActivityType, Partials } from 'discord.js';
import {
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import dotenv from 'dotenv';
import { formatVoiceJoinPermissionError } from './voicePermissions.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const prefix = (process.env.PREFIX || 'p!').trim();
const voiceConnections = new Map();
const rawToken = process.env.DISCORD_TOKEN || process.env.BOT_TOKEN || '';
const token = rawToken.trim();

if (!token) {
  console.error('❌ Missing Discord token. Set DISCORD_TOKEN or BOT_TOKEN in your environment.');
  process.exit(1);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Logged in as ${readyClient.user.tag}`);
  readyClient.user.setPresence({
    activities: [{ name: `for ${prefix}join | ${prefix}leave`, type: ActivityType.Watching }],
    status: 'online',
  });
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;

  const content = message.content.trim();

  if (!content.startsWith(prefix)) {
    return;
  }

  const args = content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  if (command === 'join') {
    if (!message.member?.voice?.channel) {
      await message.reply('You need to be in a voice channel to use that command.');
      return;
    }

    const existingConnection = getVoiceConnection(message.guild.id) || voiceConnections.get(message.guild.id);
    if (existingConnection) {
      await message.reply('I am already connected to a voice channel.');
      return;
    }

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: false,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
      voiceConnections.set(message.guild.id, connection);
      await message.reply(`Joined ${message.member.voice.channel.name}.`);
    } catch (error) {
      const currentStatus = connection.state.status;
      if (
        currentStatus === VoiceConnectionStatus.Ready ||
        currentStatus === VoiceConnectionStatus.Connecting ||
        currentStatus === VoiceConnectionStatus.Signalling
      ) {
        voiceConnections.set(message.guild.id, connection);
        await message.reply(`Joined ${message.member.voice.channel.name}.`);
        return;
      }

      console.error('Voice join failed:', error);
      connection.destroy();
      voiceConnections.delete(message.guild.id);
      const reply = formatVoiceJoinPermissionError(error);
      await message.reply(reply);
    }
    return;
  }

  if (command === 'leave') {
    const connection = getVoiceConnection(message.guild.id) || voiceConnections.get(message.guild.id);
    if (!connection) {
      await message.reply('I am not connected to a voice channel.');
      return;
    }

    connection.destroy();
    voiceConnections.delete(message.guild.id);
    await message.reply('Left the voice channel.');
    return;
  }

  await message.reply(`Use ${prefix}join to connect or ${prefix}leave to disconnect.`);
});

client.login(token).catch((error) => {
  console.error('❌ Discord login failed. Check that the bot token is correct and that the bot is enabled.');
  if (error?.message) {
    console.error(error.message);
  }
  process.exit(1);
});
