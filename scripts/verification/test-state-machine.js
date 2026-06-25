const path = require('path');
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function testStateMachine() {
  const driverId = '418b11b1-69d4-11f1-832b-22e8d4bfc052';
  
  console.log(`Starting state machine test for driver: ${driverId}`);

  // 1. Get current verification
  const verification = await prisma.driverVerification.findUnique({
    where: { driverId },
  });

  if (!verification) {
    console.error('Verification record not found for this driver ID.');
    process.exit(1);
  }

  console.log(`Current Status: ${verification.status}`);

  // 2. Move to UNDER_REVIEW
  console.log('Transitioning to UNDER_REVIEW...');
  const underReview = await prisma.driverVerification.update({
    where: { id: verification.id },
    data: { status: 'UNDER_REVIEW' },
  });

  await prisma.verificationEvent.create({
    data: {
      verificationId: verification.id,
      eventType: 'UNDER_REVIEW',
      statusFrom: verification.status,
      statusTo: 'UNDER_REVIEW',
      reason: 'Manual test - Review started',
      actorType: 'ADMIN',
      actorId: 'system-test-id'
    }
  });
  console.log(`New Status: ${underReview.status}`);

  // 3. Move to APPROVED
  console.log('Transitioning to APPROVED...');
  const approved = await prisma.driverVerification.update({
    where: { id: verification.id },
    data: { 
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedBy: 'system-test-id'
    },
  });

  await prisma.verificationEvent.create({
    data: {
      verificationId: verification.id,
      eventType: 'APPROVED',
      statusFrom: 'UNDER_REVIEW',
      statusTo: 'APPROVED',
      reason: 'Manual test - Final approval',
      actorType: 'ADMIN',
      actorId: 'system-test-id'
    }
  });
  console.log(`Final Status: ${approved.status}`);

  console.log('State machine test completed successfully.');
}

testStateMachine()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
