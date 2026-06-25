const path = require('path');
require('dotenv').config();
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function main() {
  const driverId = '418b11b1-69d4-11f1-832b-22e8d4bfc052';
  
  console.log(`🚀 Approving driver [${driverId}] for testing...`);

  const verification = await prisma.driverVerification.findUnique({
    where: { driverId },
  });

  if (!verification) {
    console.error('❌ Verification record not found');
    return;
  }

  await prisma.driverVerification.update({
    where: { id: verification.id },
    data: {
      status: 'APPROVED',
      reviewedAt: new Date(),
    }
  });

  console.log('✅ Driver APPROVED.');
  console.log('💡 Note: If running the full app, the Redis cache should be invalidated.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
