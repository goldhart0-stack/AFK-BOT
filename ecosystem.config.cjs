module.exports = {
  apps: [
    {
      name: 'afk-bot',
      script: 'node',
      args: 'index.js',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
