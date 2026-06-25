const { Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

async function testQueue() {
  const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  const queue = new Queue('notifications', { connection });

  const jobData = {
    userId: '9b30db61-2297-44fe-bb40-0edb0a7e8e8d',
    title: 'Hello from BullMQ!',
    body: 'Testing worker health via direct library call.',
    type: 'DIRECT_LIBRARY_TEST'
  };

  console.log('🚀 Pushing job via BullMQ library...');
  
  const job = await queue.add('send', jobData);

  console.log(`✅ Job [${job.id}] PUSHED.`);
  console.log('Check PM2 logs for "Processing background notification"');
  
  await connection.disconnect();
}

testQueue().catch(console.error);
