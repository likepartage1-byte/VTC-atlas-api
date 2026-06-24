const PROJECT_DIR = '/root/VTC-atlas-api';

module.exports = {
  apps: [
    {
      name: 'atlas-backend',
      script: `${PROJECT_DIR}/dist/apps/backend-api/main.js`,
      cwd: `${PROJECT_DIR}/apps/backend-api`,
      env_production: {
        NODE_ENV: 'production',
        NODE_PATH: `${PROJECT_DIR}/apps/backend-api/node_modules`,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 5,
      restart_delay: 3000,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
