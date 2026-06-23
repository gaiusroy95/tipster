-- Migration: Add oddsType column to sports_bets table
-- Date: 2025-10-21
-- Description: Adds oddsType column to track the format of odds (decimal, normalizedImplied, american)

-- Add the oddsType column
ALTER TABLE `sports_bets` 
ADD COLUMN `oddsType` ENUM('decimal', 'normalizedImplied', 'american') NOT NULL DEFAULT 'normalizedImplied' 
AFTER `odds`;

-- Update existing rows to have 'normalizedImplied' as the default (for backward compatibility)
UPDATE `sports_bets` 
SET `oddsType` = 'normalizedImplied' 
WHERE `oddsType` IS NULL;

-- Note: If you have existing bets with incorrect potentialPayout calculations,
-- you may need to recalculate them using the formula:
-- For normalizedImplied: potentialPayout = amount / odds
-- For decimal: potentialPayout = amount * odds  
-- For american (positive): potentialPayout = amount * (1 + odds/100)
-- For american (negative): potentialPayout = amount * (1 + 100/ABS(odds))

