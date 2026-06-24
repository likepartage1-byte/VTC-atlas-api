const path = require('path');
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initializing KYC records for existing drivers...');
  
  const drivers = await prisma.driver.findMany({
    include: { verification: true }
  });

  console.log(`Found ${drivers.length} drivers.`);

  for (const driver of drivers) {
    if (!driver.verification) {
      console.log(`- Creating verification record for driver ${driver.id}...`);
      await prisma.driverVerification.create({
        data: {
          driverId: driver.id,
          status: 'PENDING',
        }
      });
      
      // Log initial event
      const verification = await prisma.driverVerification.findUnique({ where: { driverId: driver.id } });
      await prisma.verificationEvent.create({
        data: {
          verificationId: verification.id,
          eventType: 'SUBMITTED',
          reason: 'Legacy driver initialization',
          actorType: 'SYSTEM'
        }
      });
    } else {
      console.log(`- Driver ${driver.id} already has a verification record.`);
    }
  }

  console.log('✅ KYC Initialization complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
