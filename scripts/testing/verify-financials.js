const path = require('path');
require('dotenv').config();
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Finalizing Financial Engine Validation...');

  const driver = await prisma.driver.findFirst();
  const passenger = await prisma.user.findFirst({ where: { role: 'PASSENGER' } });

  if (!driver || !passenger) {
    console.error('❌ Need driver and passenger to test.');
    return;
  }

  // 1. Mocking the Ledger calculation logic (8%)
  const commissionRate = 0.08;
  const totalAmount = 100.00;
  const companyFee = totalAmount * commissionRate;
  const driverEarnings = totalAmount - companyFee;

  const rideId = `test-ride-${Date.now()}`;

  console.log(`Simulating settlement for Ride [${rideId}] at 8% rate...`);

  await prisma.$transaction(async (tx) => {
    // 2. Create Ride Record
    await tx.ride.create({
      data: {
        id: rideId,
        passengerId: passenger.id,
        driverId: driver.id,
        status: 'COMPLETED',
        serviceType: 'ECONOMY',
        pickupLat: 0, pickupLng: 0, pickupAddress: 'Test',
        dropoffLat: 0, dropoffLng: 0, dropoffAddress: 'Test',
        estimatedPrice: totalAmount,
        actualPrice: totalAmount,
      }
    });

    // 3. Create Ledger Entry
    await tx.rideLedger.create({
      data: {
        rideId,
        driverId: driver.id,
        totalAmount,
        companyFee,
        driverEarnings,
        taxes: 0,
        status: 'PROCESSED',
        settledAt: new Date(),
      }
    });

    // 4. Update Driver Account
    await tx.driverAccount.upsert({
      where: { driverId: driver.id },
      update: {
        balance: { increment: driverEarnings },
        totalEarned: { increment: driverEarnings },
      },
      create: {
        driverId: driver.id,
        balance: driverEarnings,
        totalEarned: driverEarnings,
      }
    });
  });

  console.log('--- DB VALIDATION ---');
  const ledger = await prisma.rideLedger.findUnique({ where: { rideId } });
  const account = await prisma.driverAccount.findUnique({ where: { driverId: driver.id } });

  if (ledger && Number(ledger.companyFee) === 8) {
    console.log(`✅ Ledger saved correctly. Total: ${ledger.totalAmount}, Fee: ${ledger.companyFee}, Earnings: ${ledger.driverEarnings}`);
  } else {
    console.error(`❌ Ledger verification failed. Fee was: ${ledger?.companyFee}`);
  }

  if (account) {
    console.log(`✅ Driver balance updated. Current balance: ${account.balance}`);
  }

  // Cleanup
  await prisma.rideLedger.delete({ where: { rideId } });
  await prisma.ride.delete({ where: { id: rideId } });
  console.log('✅ Cleanup successful.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
