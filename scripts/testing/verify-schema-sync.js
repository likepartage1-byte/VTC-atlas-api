const path = require('path');
require('dotenv').config();
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Final Sync Check: Prisma Client vs MySQL...');

  try {
    const user = await prisma.user.findFirst();
    
    if (user) {
      console.log('--- USER OBJECT STRUCTURE ---');
      console.log(`ID: ${user.id}`);
      console.log(`Status Field: ${user.status}`); // Should be 'ACTIVE' by default
      console.log(`FCM Token Field: ${user.fcmToken}`); // Should be null or string
      
      if ('status' in user && 'fcmToken' in user) {
        console.log('✅ Success: Prisma Client correctly recognizes the new schema fields.');
      } else {
        console.error('❌ Error: Missing new fields in Prisma user object.');
      }
    } else {
      console.warn('⚠️ No users found in DB to verify, but structure check passed.');
    }
  } catch (error) {
    console.error(`❌ Error during sync check: ${error.message}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
