module.exports = {
  apps: [
    {
      name: 'atlas-backend',
      script: 'dist/apps/backend-api/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      // Logs strategy for clean monitoring
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      combine_logs: true,
    },
  ],
};
