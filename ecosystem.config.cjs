const appName = process.env.PM2_APP_NAME || 'gozon';
const appPort = Number(process.env.PORT || 6473);

module.exports = {
  apps: [
    {
      name: appName,
      cwd: '.',
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: appPort,
      },
    },
  ],
};
