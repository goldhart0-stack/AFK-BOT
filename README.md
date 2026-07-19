# AFK Discord Bot

A simple Discord bot that lets users set an AFK status with `!afk` and clear it with `!back`.
When someone mentions an AFK user, the bot replies with the AFK reason.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your bot token:
   ```bash
   copy .env.example .env
   ```
3. Start the bot:
   ```bash
   npm start
   ```

## Invite the bot

Use the Discord Developer Portal to invite the bot with the `Send Messages` and `Read Message History` permissions.

## Keep it online 24/7

This bot will stay online as long as the process is running. To keep it online continuously, host it on a service such as Render, Railway, Fly.io, or a VPS.
