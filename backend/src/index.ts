import './load-env';
import { createApp } from './app';
import { connectPrisma, disconnectPrisma } from './lib/prisma';
import { verifyOAuthSchema } from './lib/verify-schema';
import { seasonService } from './services/season.service';
import { leaderboardService } from './services/leaderboard.service';
import { betSettlementService } from './services/bet-settlement.service';
import { betRepairService } from './services/bet-repair.service';
import { adminBootstrapService } from './services/admin/admin-bootstrap.service';
import { marketTypeConfigService } from './services/admin/market-type-config.service';

const SETTLEMENT_INTERVAL_MS = 30 * 1000;

function logGoogleOAuthStatus(): void {
  const hasId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  const hasSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
  if (hasId && hasSecret) {
    console.log('[auth] Google OAuth configured');
    return;
  }
  console.warn(
    '[auth] Google sign-in disabled — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env',
  );
}

async function bootstrap() {
  logGoogleOAuthStatus();
  await connectPrisma();
  await verifyOAuthSchema();
  await seasonService.seedIfEmpty();
  await marketTypeConfigService.seedIfEmpty();
  await adminBootstrapService.ensureAdminAccount();
  await leaderboardService.syncAllUsersToActiveSeason();

  void betRepairService.repairClampedActiveBetOdds().catch((error) => {
    console.error('[bet-repair] Startup repair failed:', error);
  });

  const app = createApp();
  const port = Number(process.env.PORT ?? 3001);

  void betSettlementService.settlePendingBets().catch((error) => {
    console.error('[bet-settlement] Startup settlement failed:', error);
  });

  const settlementTimer = setInterval(() => {
    void betSettlementService.settlePendingBets().catch((error) => {
      console.error('[bet-settlement] Periodic settlement failed:', error);
    });
  }, SETTLEMENT_INTERVAL_MS);

  const server = app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });

  const shutdown = async () => {
    clearInterval(settlementTimer);
    server.close();
    await disconnectPrisma();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((error: NodeJS.ErrnoException & { errorCode?: string }) => {
  const port = process.env.PORT ?? 3001;

  if (error?.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${port} is already in use (another backend instance is probably still running).\n` +
        `Fix (recommended): npm run free-port   then   npm run start:dev\n` +
        `Git Bash manual fix:\n` +
        `  netstat -ano | grep :${port}\n` +
        `  taskkill //PID <pid> //F    (note double slashes in Git Bash)\n`,
    );
  } else if (error?.errorCode === 'P1001' || error?.name === 'PrismaClientInitializationError') {
    console.error(
      '\nCannot connect to PostgreSQL (DATABASE_URL).\n' +
        'Checks:\n' +
        '  1. Neon project is active (dashboard → wake database if paused)\n' +
        '  2. DATABASE_URL uses pooler host with ?sslmode=require (no channel_binding)\n' +
        '  3. Copy a fresh connection string from Neon dashboard\n' +
        '  4. Run: npm run prisma:deploy   (applies SocialAccount migration for Google login)\n',
    );
    console.error(error);
  } else {
    console.error('Failed to start application:', error);
  }
  process.exit(1);
});
