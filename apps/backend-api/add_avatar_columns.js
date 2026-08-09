/**
 * Script to add avatar columns to User and Driver tables
 * Run: node add_avatar_columns.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');

  try {
    // Add avatar to User table
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `User` ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(500) NULL'
    );
    console.log('✅ avatar column added to User table');
  } catch (e) {
    if (e.message && e.message.includes('Duplicate column')) {
      console.log('ℹ️  avatar column already exists in User table');
    } else {
      console.error('User table error:', e.message);
    }
  }

  try {
    // Add avatar to Driver table
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Driver` ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(500) NULL'
    );
    console.log('✅ avatar column added to Driver table');
  } catch (e) {
    if (e.message && e.message.includes('Duplicate column')) {
      console.log('ℹ️  avatar column already exists in Driver table');
    } else {
      console.error('Driver table error:', e.message);
    }
  }

  // Verify the columns exist
  const userCols = await prisma.$queryRaw`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'User' AND COLUMN_NAME = 'avatar'
  `;
  const driverCols = await prisma.$queryRaw`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Driver' AND COLUMN_NAME = 'avatar'
  `;

  console.log('\n=== Verification ===');
  console.log('User.avatar exists:', userCols.length > 0 ? '✅ YES' : '❌ NO');
  console.log('Driver.avatar exists:', driverCols.length > 0 ? '✅ YES' : '❌ NO');

  await prisma.$disconnect();
  console.log('\nDone!');
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
