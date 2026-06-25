const path = require('path');
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

// Mock Redis for the script
const mockRedis = {
  getClient: () => ({
    get: async () => null,
    set: async () => {},
    del: async () => {},
  })
};

// Simple stand-alone eligibility check logic (mirroring the service)
async function testEligibility(driverId) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { verification: true },
  });

  if (!driver) return { eligible: false, reason: 'Driver not found' };

  const isKycApproved = driver.verification?.status === 'APPROVED';
  return {
    eligible: isKycApproved,
    status: driver.verification?.status || 'NOT_INITIALIZED',
  };
}

async function main() {
  const drivers = await prisma.driver.findMany({ take: 2 });
  
  if (drivers.length === 0) {
    console.log('❌ No drivers found in DB to test.');
    return;
  }

  console.log('🔍 Testing Safety Gates logic...');

  for (const driver of drivers) {
    const result = await testEligibility(driver.id);
    console.log(`Driver [${driver.id}]: Status=${result.status}, Eligible=${result.eligible}`);
    
    if (result.eligible) {
      console.log('✅ Gate allows this driver.');
    } else {
      console.log('🛑 Gate BLOCKS this driver (Correct behavior for unverified).');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
