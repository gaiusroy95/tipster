-- Migration: Add playerName column to sports_bets table
-- Date: 2025-02-07
-- Description: Add playerName column to store player names for player props markets (e.g., ASSISTS)

-- Add playerName column
ALTER TABLE `sports_bets` 
ADD COLUMN `playerName` VARCHAR(255) NULL 
AFTER `playerId`;

-- Note: Existing bets will have NULL playerName values
-- New bets placed after this migration will include playerName for player props markets
