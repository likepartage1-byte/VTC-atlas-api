module.exports = {
  apps: [
    {
      name: "atlas-backend",
      // نستخدم المسار المرتبط بـ current لضمان استمرارية التشغيل عند التحديث
      cwd: "/var/www/VTC-atlas-api/current/apps/backend-api",
      script: "dist/main.js",
      instances: 1, // أو 'max' إذا أردنا Cluster Mode لاحقاً
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      // إدارة الـ Logs بطريقة احترافية
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/www/VTC-atlas-api/logs/backend-error.log",
      out_file: "/var/www/VTC-atlas-api/logs/backend-out.log"
    }
  ]
};
