-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserSettings" ADD COLUMN "twoFactorMethod" TEXT;
ALTER TABLE "UserSettings" ADD COLUMN "twoFactorSecret" TEXT;
ALTER TABLE "UserSettings" ADD COLUMN "twoFactorPendingSecret" TEXT;
ALTER TABLE "UserSettings" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "UserSettings" ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TwoFactorTrustedDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorTrustedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactorPhoneCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorPhoneCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorTrustedDevice_tokenHash_key" ON "TwoFactorTrustedDevice"("tokenHash");

-- CreateIndex
CREATE INDEX "TwoFactorTrustedDevice_userId_expiresAt_idx" ON "TwoFactorTrustedDevice"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "TwoFactorPhoneCode_userId_purpose_expiresAt_idx" ON "TwoFactorPhoneCode"("userId", "purpose", "expiresAt");

-- AddForeignKey
ALTER TABLE "TwoFactorTrustedDevice" ADD CONSTRAINT "TwoFactorTrustedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorPhoneCode" ADD CONSTRAINT "TwoFactorPhoneCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
