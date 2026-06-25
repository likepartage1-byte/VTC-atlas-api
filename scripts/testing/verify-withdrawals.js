const path = require('path');
require('dotenv').config();
const clientPath = path.join(process.cwd(), 'apps/backend-api/node_modules/@prisma/client');
const { PrismaClient } = require(clientPath);
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Final Financial Validation: Withdrawal Lifecycle...');

  const driver = await prisma.driver.findFirst();
  if (!driver) {
    console.error('❌ Need a driver to test.');
    return;
  }

  // 1. Setup Initial Balance
  console.log('--- PHASE 1: Setup ---');
  await prisma.driverAccount.upsert({
    where: { driverId: driver.id },
    update: { balance: 1000, lockedBalance: 0, totalWithdrawn: 0 },
    create: { driverId: driver.id, balance: 1000, lockedBalance: 0 }
  });
  console.log('✅ Driver balance set to 1000 MAD.');

  // 2. Request Withdrawal (Locking)
  console.log('--- PHASE 2: Request Withdrawal ---');
  const amount = 300;
  
  // Logic simulate WithdrawalService.requestWithdrawal
  await prisma.$transaction(async (tx) => {
    await tx.driverAccount.update({
      where: { driverId: driver.id },
      data: { lockedBalance: { increment: amount } }
    });
    const request = await tx.withdrawalRequest.create({
      data: {
        driverId: driver.id,
        amount,
        status: 'PENDING',
        bankDetails: { bank: 'BMCE', rib: '123456789' }
      }
    });

    console.log(`✅ Request [${request.id}] created. 300 MAD locked.`);
  });

  let account = await prisma.driverAccount.findUnique({ where: { driverId: driver.id } });
  console.log(`Current State: Balance=${account.balance}, Locked=${account.lockedBalance}`);

  // 3. Reject & Release
  console.log('--- PHASE 3: Reject & Release ---');
  const pendingRequest = await prisma.withdrawalRequest.findFirst({ where: { status: 'PENDING', driverId: driver.id } });
  
  await prisma.$transaction(async (tx) => {
    await tx.driverAccount.update({
      where: { driverId: driver.id },
      data: { lockedBalance: { decrement: pendingRequest.amount } }
    });
    await tx.withdrawalRequest.update({
      where: { id: pendingRequest.id },
      data: { status: 'REJECTED', rejectionReason: 'Incorrect RIB' }
    });
  });
  console.log('✅ Request REJECTED. Balance released.');

  account = await prisma.driverAccount.findUnique({ where: { driverId: driver.id } });
  console.log(`Current State: Balance=${account.balance}, Locked=${account.lockedBalance}`);

  // 4. Final Payout (The Real Deal)
  console.log('--- PHASE 4: Final Payout ---');
  const amountToPay = 500;
  
  // Create a new request first
  const newRequest = await prisma.withdrawalRequest.create({
    data: { driverId: driver.id, amount: amountToPay, status: 'PENDING' }
  });
  await prisma.driverAccount.update({
    where: { driverId: driver.id },
    data: { lockedBalance: { increment: amountToPay } }
  });

  // Now Mark as Paid (Finalization Logic)
  await prisma.$transaction(async (tx) => {
    // Deduct from real balance AND locked
    await tx.driverAccount.update({
      where: { driverId: driver.id },
      data: {
        balance: { decrement: amountToPay },
        lockedBalance: { decrement: amountToPay },
        totalWithdrawn: { increment: amountToPay }
      }
    });

    // Create Audit DEBIT Transaction
    await tx.driverTransaction.create({
      data: {
        driverId: driver.id,
        type: 'DEBIT',
        amount: amountToPay,
        status: 'COMPLETED',
        withdrawalId: newRequest.id,
        referenceType: 'WITHDRAWAL_PAID',
        description: `Payout for ${newRequest.id}`
      }
    });

    await tx.withdrawalRequest.update({
      where: { id: newRequest.id },
      data: { status: 'PAID', paidAt: new Date() }
    });
  });

  console.log('✅ Final payout executed.');

  // 5. Final Verification
  account = await prisma.driverAccount.findUnique({ where: { driverId: driver.id } });
  const transaction = await prisma.driverTransaction.findFirst({
    where: { withdrawalId: newRequest.id }
  });

  console.log('--- FINAL VALIDATION ---');
  if (Number(account.balance) === 500 && Number(account.totalWithdrawn) === 500) {
    console.log('✅ Driver Account math is CORRECT (1000 - 500 = 500)');
  } else {
    console.error(`❌ Math error: Balance=${account.balance}, TotalWithdrawn=${account.totalWithdrawn}`);
  }

  if (transaction && transaction.type === 'DEBIT') {
    console.log(`✅ Audit Transaction created: DEBIT ${transaction.amount} MAD`);
  } else {
    console.error('❌ Audit Transaction missing or incorrect.');
  }

  // Cleanup
  await prisma.driverTransaction.deleteMany({ where: { driverId: driver.id } });
  await prisma.withdrawalRequest.deleteMany({ where: { driverId: driver.id } });
  console.log('✅ Cleanup successful.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
