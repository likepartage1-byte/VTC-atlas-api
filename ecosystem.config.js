module.exports = {
  apps: [
    {
      name: "atlas-backend",
      // نستخدم جذر المشروع كـ cwd للتوافق مع بنية الـ Monorepo
      cwd: "/var/www/VTC-atlas-api/current",
      script: "dist/apps/backend-api/main.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/www/VTC-atlas-api/logs/backend-error.log",
      out_file: "/var/www/VTC-atlas-api/logs/backend-out.log"
    }
  ]
};
