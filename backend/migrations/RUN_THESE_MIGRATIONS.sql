-- =============================================================================
-- SPINFOX DATABASE MIGRATIONS
-- Date: 2025-10-23
-- Run these in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or CLI)
-- =============================================================================

USE spinfox;

-- -----------------------------------------------------------------------------
-- MIGRATION 1: Add testBalance Column
-- -----------------------------------------------------------------------------
SELECT '🔧 Adding testBalance column...' AS Status;

ALTER TABLE `user` 
ADD COLUMN `testBalance` DOUBLE NOT NULL DEFAULT 0;

ALTER TABLE `user` 
MODIFY COLUMN `testBalance` DOUBLE NOT NULL DEFAULT 0 COMMENT 'User balance for testnet chains';

ALTER TABLE `user` 
MODIFY COLUMN `realBalance` DOUBLE NOT NULL DEFAULT 0 COMMENT 'User balance for mainnet chains';

CREATE INDEX `IDX_user_testBalance` ON `user` (`testBalance`);

SELECT '✅ testBalance column added!' AS Status;

-- -----------------------------------------------------------------------------
-- MIGRATION 2: Optimize chain_state Table
-- -----------------------------------------------------------------------------
SELECT '🔧 Optimizing chain_state table...' AS Status;

-- Create index if not exists
CREATE INDEX `IDX_chain_state_chain` ON `chain_state` (`chain`);

-- Optimize and analyze
OPTIMIZE TABLE `chain_state`;
ANALYZE TABLE `chain_state`;

SELECT '✅ chain_state optimized!' AS Status;

-- -----------------------------------------------------------------------------
-- VERIFICATION
-- -----------------------------------------------------------------------------
SELECT '📊 Verifying changes...' AS Status;

-- Check testBalance column
SHOW COLUMNS FROM `user` LIKE 'testBalance';

-- Check chain_state indexes
SHOW INDEX FROM `chain_state`;

-- Check testBalance values
SELECT 
  COUNT(*) as total_users,
  SUM(realBalance) as total_real_balance,
  SUM(testBalance) as total_test_balance
FROM `user`;

SELECT '✅ All migrations completed successfully!' AS Status;

