-- Migration: Remove redundant selection columns from sports_bets (data lives in sports_tickets)
-- Date: 2025-03-01
-- 1) Backfill tickets for legacy single bets that don't have any tickets yet
-- 2) Drop gameId, sportId, typeId, maturity, line, playerId, playerName, position,
--    homeTeam, awayTeam, tournamentName, positionLabel, marketType from sports_bets

-- Step 1: Backfill one ticket per legacy single bet (where no tickets exist)
INSERT INTO sports_tickets (betId, gameId, sportId, typeId, maturity, line, playerId, playerName, position, homeTeam, awayTeam, tournamentName, positionLabel, marketType, odds, oddsType)
SELECT b.id, b.gameId, b.sportId, b.typeId, b.maturity, b.line, b.playerId, b.playerName, b.position, b.homeTeam, b.awayTeam, b.tournamentName, b.positionLabel, b.marketType, b.odds, b.oddsType
FROM sports_bets b
WHERE b.betType = 'single'
  AND NOT EXISTS (SELECT 1 FROM sports_tickets t WHERE t.betId = b.id)
  AND b.gameId IS NOT NULL;

-- Step 2: Drop selection columns from sports_bets (all in one ALTER)
ALTER TABLE sports_bets
  DROP COLUMN gameId,
  DROP COLUMN sportId,
  DROP COLUMN typeId,
  DROP COLUMN maturity,
  DROP COLUMN line,
  DROP COLUMN playerId,
  DROP COLUMN playerName,
  DROP COLUMN position,
  DROP COLUMN homeTeam,
  DROP COLUMN awayTeam,
  DROP COLUMN tournamentName,
  DROP COLUMN positionLabel,
  DROP COLUMN marketType;
