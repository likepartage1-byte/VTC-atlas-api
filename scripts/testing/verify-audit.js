const path = require('path');
require('dotenv').config();
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Verifying Transaction Audit Trail (Sprint 2)...');

  const driver = await prisma.driver.findFirst();
  const passenger = await prisma.user.findFirst({ where: { role: 'PASSENGER' } });

  const rideId = `audit-test-${Date.now()}`;
  const amount = 50.00;
  const earnings = amount * 0.92; // 92% for driver

  await prisma.$transaction(async (tx) => {
    // 1. Create Ride
    await tx.ride.create({
      data: {
        id: rideId,
        passengerId: passenger.id,
        driverId: driver.id,
        status: 'COMPLETED',
        serviceType: 'ECONOMY',
        pickupLat: 0, pickupLng: 0, pickupAddress: 'Test',
        dropoffLat: 0, dropoffLng: 0, dropoffAddress: 'Test',
        estimatedPrice: amount,
        actualPrice: amount,
      }
    });

    // 2. Create Ledger
    const ledger = await tx.rideLedger.create({
      data: {
        rideId,
        driverId: driver.id,
        totalAmount: amount,
        companyFee: amount * 0.08,
        driverEarnings: earnings,
        taxes: 0,
        status: 'PROCESSED',
        settledAt: new Date(),
      }
    });

    // 3. Create Audit Transaction (Crucial Sprint 2 logic)
    await tx.driverTransaction.create({
      data: {
        driverId: driver.id,
        type: 'CREDIT',
        amount: earnings,
        status: 'COMPLETED',
        referenceId: ledger.id,
        referenceType: 'RIDE_EARNING',
        description: `Audit test for ride ${rideId}`,
      }
    });

    // 4. Update Balance
    await tx.driverAccount.upsert({
      where: { driverId: driver.id },
      update: { balance: { increment: earnings }, totalEarned: { increment: earnings } },
      create: { driverId: driver.id, balance: earnings, totalEarned: earnings }
    });
  });

  console.log('--- AUDIT VALIDATION ---');
  const transaction = await prisma.driverTransaction.findFirst({
    where: { referenceType: 'RIDE_EARNING', description: { contains: rideId } },
    include: { rideLedger: true }
  });

  if (transaction && transaction.rideLedger) {
    console.log(`✅ Transaction linked to Ledger! ID: ${transaction.id}`);
    console.log(`✅ Reference Type: ${transaction.referenceType}`);
    console.log(`✅ Linked Ledger Total: ${transaction.rideLedger.totalAmount}`);
  } else {
    console.error('❌ Audit Trail linkage FAILED.');
  }

  // Cleanup
  await prisma.driverTransaction.deleteMany({ where: { description: { contains: rideId } } });
  await prisma.rideLedger.delete({ where: { rideId } });
  await prisma.ride.delete({ where: { id: rideId } });
  console.log('✅ Cleanup successful.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
