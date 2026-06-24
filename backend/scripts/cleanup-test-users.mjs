/**
 * Removes users registered with reserved RFC 2606 domains (e.g. @example.com).
 * These are created by accidental API/manual testing against a shared database.
 *
 * Usage:
 *   node scripts/cleanup-test-users.mjs          # dry run (lists only)
 *   node scripts/cleanup-test-users.mjs --apply  # delete matching users
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

const blockedDomainSql = `
  "email" LIKE '%@example.com'
  OR "email" LIKE '%@example.org'
  OR "email" LIKE '%@example.net'
  OR "email" LIKE '%@example.edu'
  OR "email" LIKE '%@test'
  OR "email" LIKE '%@invalid'
  OR "email" LIKE '%@localhost'
  OR "email" LIKE '%.test'
  OR "email" LIKE '%.local'
  OR "email" LIKE '%.localhost'
`;

const users = await prisma.$queryRawUnsafe(
  `SELECT "id", "email", "username", "displayName" FROM "User" WHERE ${blockedDomainSql} ORDER BY "createdAt" ASC`,
);

if (users.length === 0) {
  console.log('No test-domain users found.');
  await prisma.$disconnect();
  process.exit(0);
}

console.log(`${apply ? 'Deleting' : 'Would delete'} ${users.length} user(s):`);
for (const user of users) {
  console.log(`  - ${user.email} (${user.username}, ${user.displayName})`);
}

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to delete these rows.');
  await prisma.$disconnect();
  process.exit(0);
}

const ids = users.map((u) => u.id);
const deleted = await prisma.user.deleteMany({ where: { id: { in: ids } } });
console.log(`\nDeleted ${deleted.count} user(s).`);
await prisma.$disconnect();
