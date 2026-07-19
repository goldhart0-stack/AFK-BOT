import { Client, GatewayIntentBits, Events, ActivityType } from 'discord.js';
import {
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = (process.env.PREFIX || 'p!').trim();
const afkUsers = new Map();
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
    activities: [{ name: `for ${prefix}afk | ${prefix}back`, type: ActivityType.Watching }],
    status: 'online',
  });
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;

  const key = `${message.guild.id}:${message.author.id}`;
  const content = message.content.trim();

  if (afkUsers.has(key) && !content.startsWith(prefix)) {
    afkUsers.delete(key);
    await message.reply('✅ Welcome back! I removed your AFK status.');
    return;
  }

  if (!content.startsWith(prefix)) {
    for (const mentionedUser of message.mentions.users.values()) {
      const afkKey = `${message.guild.id}:${mentionedUser.id}`;
      const afkData = afkUsers.get(afkKey);

      if (afkData) {
        await message.reply(`⚠️ ${mentionedUser.tag} is AFK: ${afkData.reason}`);
      }
    }
    return;
  }

  const args = content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  if (command === 'afk') {
    const reason = args.join(' ') || 'No reason provided.';
    afkUsers.set(key, { reason, since: new Date() });
    await message.reply(`✅ You are now AFK: ${reason}`);
    return;
  }

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
      connection.destroy();
      await message.reply('I could not join the voice channel. Please check my permissions.');
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

  if (command === 'back') {
    afkUsers.delete(key);
    await message.reply('✅ Welcome back!');
  }
});

client.login(token).catch((error) => {
  console.error('❌ Discord login failed. Check that the bot token is correct and that the bot is enabled.');
  if (error?.message) {
    console.error(error.message);
  }
  process.exit(1);
});
