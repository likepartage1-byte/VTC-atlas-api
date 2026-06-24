const Redis = require('ioredis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(redisUrl);

async function checkKeys() {
  try {
    const keys = await redis.keys('*otp*');
    console.log('OTP Keys found:', keys.slice(0, 10));
    process.exit(0);
  } catch (err) {
    console.error('Redis Error:', err);
    process.exit(1);
  }
}

checkKeys();
