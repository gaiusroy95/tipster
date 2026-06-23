-- Migration: Add 'sgp' (Single Game Parlay) bet type to sports_bets table
-- Date: 2025-02-07
-- Description: Add 'sgp' option to the betType enum to support Single Game Parlay bets

-- Note: MySQL/MariaDB doesn't support ALTER TYPE for ENUM, so we need to modify the column
-- This migration assumes the table exists and has the current enum values

-- For MySQL/MariaDB, we need to alter the column to include the new enum value
ALTER TABLE `sports_bets` 
MODIFY COLUMN `betType` ENUM('single', 'parlay', 'sgp') DEFAULT 'single' NOT NULL;

-- Verify the change
-- SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME = 'sports_bets' 
-- AND COLUMN_NAME = 'betType';
