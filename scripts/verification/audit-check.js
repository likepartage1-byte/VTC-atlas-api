const { PrismaClient } = require('@prisma/client');

async function verifyAudit() {
  const prisma = new PrismaClient();
  console.log('━━━ AUDIT VERIFICATION PHASE ━━━');
  
  const testAction = `VERIFY_INTERNAL_${Date.now()}`;
  
  try {
    console.log(`[1] Injecting AuditLog: ${testAction}...`);
    const newLog = await prisma.auditLog.create({
      data: {
        action: testAction,
        entityType: 'SystemVerification',
        metadata: {
          step: 'Forensic Check',
          worker: 'Antigravity'
        }
      }
    });
    
    if (newLog) {
      console.log('  ✔ SUCCESS: AuditLog entry created in database.');
      
      console.log('[2] Fetching back for verification...');
      const fetched = await prisma.auditLog.findUnique({
        where: { id: newLog.id }
      });
      
      if (fetched && fetched.action === testAction) {
        console.log('  ✔ SUCCESS: Forensic confirmation — Data integrity verified.');
      } else {
        throw new Error('Verification failed: Record found but data mismatch.');
      }
    }
  } catch (error) {
    console.error('  ✘ FAILED:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAudit();
