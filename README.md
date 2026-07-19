# AFK Discord Bot

A simple Discord bot that lets users set an AFK status with `p!afk` and clear it with `p!back`.
When someone mentions an AFK user, the bot replies with the AFK reason.

## Setup

1. Install dependencies:
   ```bash
   npm install --omit=dev
   ```
2. Copy `.env.example` to `.env` and add your bot token:
   ```bash
   copy .env.example .env
   ```
3. Start the bot:
   ```bash
   npm start
   ```

You can use `p!afk` and `p!back` by default.

## Invite the bot

Use the Discord Developer Portal to invite the bot with the `Send Messages` and `Read Message History` permissions.

## Keep it online 24/7

This bot will stay online as long as the process is running. To keep it online continuously, host it on a service such as Render, Railway, Fly.io, or a VPS.

## GitHub deployment secret

For GitHub-based deployment, add your bot token as a repository secret:

1. Open your GitHub repository.
2. Go to Settings > Secrets and variables > Actions.
3. Create a new repository secret named `DISCORD_TOKEN`.
4. Paste your Discord bot token as the value.

If your deployment platform uses a different variable name, set `BOT_TOKEN` as well.
