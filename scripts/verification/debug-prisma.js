const path = require('path');
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function check() {
  console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));
}

check().finally(() => prisma.$disconnect());
