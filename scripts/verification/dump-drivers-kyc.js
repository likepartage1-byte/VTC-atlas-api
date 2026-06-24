const path = require('path');
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function main() {
  const drivers = await prisma.driver.findMany({
    include: {
      user: { select: { phoneNumber: true, fullName: true } },
      verification: { select: { status: true } }
    }
  });

  console.log('--- Current Drivers & KYC Status ---');
  drivers.forEach(d => {
    console.log(`ID: ${d.id}`);
    console.log(`Name: ${d.user.fullName}`);
    console.log(`Phone: ${d.user.phoneNumber}`);
    console.log(`KYC: ${d.verification?.status || 'NOT_INITIALIZED'}`);
    console.log('------------------------------------');
  });
}

main().finally(() => prisma.$disconnect());
