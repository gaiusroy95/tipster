-- Migration: Add reward column to leaderboard table
-- Date: 2025-02-07
-- Description: Add reward column to store profit-based rewards for leaderboard entries

ALTER TABLE `leaderboard` 
ADD COLUMN `reward` DECIMAL(18, 2) DEFAULT 0 NOT NULL AFTER `totalWinAmount`;

-- Verify the change
-- SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME = 'leaderboard' 
-- AND COLUMN_NAME = 'reward';
