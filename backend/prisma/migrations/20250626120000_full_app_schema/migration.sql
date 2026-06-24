-- User profile fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signature" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signatureLink" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signatureMode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "postCount" INTEGER NOT NULL DEFAULT 0;

-- UserSettings
CREATE TABLE IF NOT EXISTS "UserSettings" (
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "showProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

DO $$ BEGIN
  ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Bet
CREATE TABLE IF NOT EXISTS "Bet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "marketType" TEXT NOT NULL,
    "selectionId" TEXT NOT NULL,
    "selectionLabel" TEXT NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "stake" INTEGER NOT NULL,
    "potentialReturn" INTEGER NOT NULL,
    "betSize" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "profitLoss" INTEGER,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "homeTeamName" TEXT NOT NULL,
    "awayTeamName" TEXT NOT NULL,
    "leagueName" TEXT,
    "matchStartTime" TIMESTAMP(3),
    "sportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Bet_userId_placedAt_idx" ON "Bet"("userId", "placedAt");
CREATE INDEX IF NOT EXISTS "Bet_userId_status_idx" ON "Bet"("userId", "status");
CREATE INDEX IF NOT EXISTS "Bet_matchId_idx" ON "Bet"("matchId");
CREATE INDEX IF NOT EXISTS "Bet_status_matchId_idx" ON "Bet"("status", "matchId");

DO $$ BEGIN
  ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- DailyBetUsage
CREATE TABLE IF NOT EXISTS "DailyBetUsage" (
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DailyBetUsage_pkey" PRIMARY KEY ("userId", "date")
);

DO $$ BEGIN
  ALTER TABLE "DailyBetUsage" ADD CONSTRAINT "DailyBetUsage_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- WalletTransaction.betId
ALTER TABLE "WalletTransaction" ADD COLUMN IF NOT EXISTS "betId" TEXT;
CREATE INDEX IF NOT EXISTS "WalletTransaction_betId_idx" ON "WalletTransaction"("betId");

DO $$ BEGIN
  ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_betId_fkey"
    FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Season
CREATE TABLE IF NOT EXISTS "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Season_isActive_idx" ON "Season"("isActive");
CREATE INDEX IF NOT EXISTS "Season_status_idx" ON "Season"("status");

-- PrizeTier
CREATE TABLE IF NOT EXISTS "PrizeTier" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "rankFrom" INTEGER NOT NULL,
    "rankTo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    CONSTRAINT "PrizeTier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PrizeTier_seasonId_idx" ON "PrizeTier"("seasonId");

DO $$ BEGIN
  ALTER TABLE "PrizeTier" ADD CONSTRAINT "PrizeTier_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- SeasonParticipant
CREATE TABLE IF NOT EXISTS "SeasonParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitLoss" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalBets" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "voids" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "form" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SeasonParticipant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SeasonParticipant_userId_seasonId_key" ON "SeasonParticipant"("userId", "seasonId");
CREATE INDEX IF NOT EXISTS "SeasonParticipant_seasonId_points_idx" ON "SeasonParticipant"("seasonId", "points");
CREATE INDEX IF NOT EXISTS "SeasonParticipant_seasonId_rank_idx" ON "SeasonParticipant"("seasonId", "rank");

DO $$ BEGIN
  ALTER TABLE "SeasonParticipant" ADD CONSTRAINT "SeasonParticipant_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "SeasonParticipant" ADD CONSTRAINT "SeasonParticipant_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");

DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- UserAchievement
CREATE TABLE IF NOT EXISTS "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId", "achievementId")
);

CREATE INDEX IF NOT EXISTS "UserAchievement_userId_idx" ON "UserAchievement"("userId");

DO $$ BEGIN
  ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
