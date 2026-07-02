-- Add human-readable ticket reference (username + date + time) for bet tracking
ALTER TABLE "Bet" ADD COLUMN "ticketReference" TEXT;

UPDATE "Bet" AS b
SET "ticketReference" = (
  'TA-' ||
  UPPER(
    COALESCE(
      NULLIF(SUBSTRING(REGEXP_REPLACE(COALESCE(u."username", 'player'), '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 16), ''),
      'PLAYER'
    )
  ) ||
  '-' ||
  TO_CHAR(b."placedAt" AT TIME ZONE 'UTC', 'YYYYMMDD') ||
  '-' ||
  TO_CHAR(b."placedAt" AT TIME ZONE 'UTC', 'HH24MI') ||
  '-' ||
  UPPER(RIGHT(REPLACE(b."id", '-', ''), 10))
)
FROM "User" AS u
WHERE b."userId" = u."id";

ALTER TABLE "Bet" ALTER COLUMN "ticketReference" SET NOT NULL;
CREATE UNIQUE INDEX "Bet_ticketReference_key" ON "Bet"("ticketReference");
