import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../apps/backend-api/src/app.module';
import { RideLedgerService } from '../../apps/backend-api/src/modules/financial/application/ride-ledger.service';
import { PrismaService } from '../../apps/backend-api/src/core/prisma/prisma.service';

async function bootstrap() {
  console.log('🚀 Starting Settlement Engine Test...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const ledgerService = app.get(RideLedgerService);
  const prisma = app.get(PrismaService);

  // 1. Create a dummy ride in IN_PROGRESS
  const driver = await prisma.driver.findFirst();
  const passenger = await prisma.user.findFirst({ where: { role: 'PASSENGER' } });

  if (!driver || !passenger) {
    console.error('❌ Need at least one driver and one passenger in DB to test.');
    await app.close();
    return;
  }

  const ride = await prisma.ride.create({
    data: {
      passengerId: passenger.id,
      driverId: driver.id,
      status: 'IN_PROGRESS' as any,
      serviceType: 'ECONOMY',
      pickupLat: 31.6295,
      pickupLng: -7.9811,
      pickupAddress: 'Gueliz, Marrakech',
      dropoffLat: 31.6355,
      dropoffLng: -8.0011,
      dropoffAddress: 'Majorelle Garden',
      estimatedPrice: 25.0,
      actualPrice: 30.0,
    }
  });

  console.log(`Created test ride [${ride.id}] for driver [${driver.id}]`);

  // 2. We skip TripFinalizer (which sets COMPLETED) and manually set it for the guard
  await prisma.ride.update({
    where: { id: ride.id },
    data: { status: 'COMPLETED' as any }
  });

  console.log('Finalizing financials...');
  
  // 3. Test the Ledger Service
  await ledgerService.settleRide(ride.id);

  // 4. Verify results
  const ledger = await prisma.rideLedger.findUnique({
    where: { rideId: ride.id }
  });

  const account = await prisma.driverAccount.findUnique({
    where: { driverId: driver.id }
  });

  console.log('--- TEST RESULTS ---');
  if (ledger) {
    console.log(`✅ Ledger Entry Created: Total=${ledger.totalAmount}, Fee=${ledger.companyFee}, Driver=${ledger.driverEarnings}`);
    const expectedFee = Number(ledger.totalAmount) * 0.08;
    if (Math.abs(Number(ledger.companyFee) - expectedFee) < 0.01) {
      console.log('✅ Commission Calculation Correct (8%)');
    } else {
      console.log(`❌ Commission Calculation INCORRECT. Expected ${expectedFee}, got ${ledger.companyFee}`);
    }
  } else {
    console.log('❌ Ledger Entry NOT created.');
  }

  if (account) {
    console.log(`✅ Driver Account Updated: Balance=${account.balance}, Total Earned=${account.totalEarned}`);
  } else {
    console.log('❌ Driver Account NOT found/updated.');
  }

  // Cleanup
  await prisma.rideLedger.delete({ where: { rideId: ride.id } });
  await prisma.ride.delete({ where: { id: ride.id } });
  
  console.log('--- CLEANUP COMPLETE ---');
  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Settlement Test FAILED:', err);
  process.exit(1);
});
