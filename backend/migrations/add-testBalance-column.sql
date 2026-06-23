-- Migration: Add testBalance column to user table
-- Date: 2025-10-23
-- Description: Split balance into realBalance (mainnet) and testBalance (testnet)
-- Database: MySQL

-- Add testBalance column with default value of 0
ALTER TABLE `user` 
ADD COLUMN `testBalance` DOUBLE NOT NULL DEFAULT 0;

-- Add comment to the column (MySQL syntax)
ALTER TABLE `user` 
MODIFY COLUMN `testBalance` DOUBLE NOT NULL DEFAULT 0 COMMENT 'User balance for testnet chains (Sepolia, Goerli, etc.)';

ALTER TABLE `user` 
MODIFY COLUMN `realBalance` DOUBLE NOT NULL DEFAULT 0 COMMENT 'User balance for mainnet chains (Ethereum, Optimism, Arbitrum, Base, etc.)';

-- Create index for performance (optional but recommended)
CREATE INDEX `IDX_user_testBalance` ON `user` (`testBalance`);

