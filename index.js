import { Client, GatewayIntentBits, Events, ActivityType } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = (process.env.PREFIX || '!').trim();
const afkUsers = new Map();

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

  if (command === 'back') {
    afkUsers.delete(key);
    await message.reply('✅ Welcome back!');
  }
});

client.login(process.env.DISCORD_TOKEN);
