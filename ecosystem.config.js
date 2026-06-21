require('dotenv').config({ path: '/var/www/VTC-atlas-api/.env' });

module.exports = {
  apps: [
    {
      name: "atlas-backend",
      script: "/var/www/VTC-atlas-api/dist/apps/backend-api/main.js",
      cwd: "/var/www/VTC-atlas-api",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,
        JWT_SECRET: process.env.JWT_SECRET
      },
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
