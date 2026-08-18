const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for drivers with pending name updates...');
  const verifications = await prisma.driverVerification.findMany({
    include: {
      driver: {
        include: { user: true },
      },
    },
  });

  let updatedCount = 0;
  for (const v of verifications) {
    const meta = v.metadata || {};
    const req = meta.profileUpdateRequest;
    if (req && req.fields) {
      const fields = req.fields;
      const user = v.driver?.user;
      if (user && (user.fullName === 'New User' || !user.fullName || user.fullName.trim() === '')) {
        const first = fields.firstName || user.firstName || '';
        const last = fields.lastName || user.lastName || '';
        const fullName = fields.fullName || `${first} ${last}`.trim() || 'Driver';

        console.log(`✅ Updating driver ${v.driverId} (${user.id}): ${user.fullName} -> ${fullName}`);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: first || undefined,
            lastName: last || undefined,
            fullName: fullName,
            email: fields.email || undefined,
            city: fields.city || undefined,
          },
        });

        // Clear pending status
        delete meta.profileUpdateRequest;
        await prisma.driverVerification.update({
          where: { id: v.id },
          data: { metadata: meta },
        });

        updatedCount++;
      }
    }
  }

  console.log(`🎉 Done! Auto-approved ${updatedCount} driver name updates.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error running script:', err);
  process.exit(1);
});
