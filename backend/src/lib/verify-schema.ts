import { prisma } from './prisma';

export async function verifyOAuthSchema(): Promise<void> {
  const hasGoogle =
    Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
  if (!hasGoogle) return;

  try {
    await prisma.$queryRawUnsafe('SELECT 1 FROM "SocialAccount" LIMIT 1');
  } catch {
    console.error(
      '\n[db] SocialAccount table is missing. Google sign-in will fail until you run:\n' +
        '  cd backend\n' +
        '  npm run prisma:deploy\n',
    );
    return;
  }

  try {
    await prisma.$queryRawUnsafe('SELECT "avatarUrl" FROM "User" LIMIT 1');
  } catch {
    console.error(
      '\n[db] User.avatarUrl column is missing. Google sign-up may fail until you run:\n' +
        '  cd backend\n' +
        '  npm run prisma:deploy\n',
    );
  }
}
