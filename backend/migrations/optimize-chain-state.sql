-- Migration: Optimize chain_state table performance
-- Date: 2025-10-23
-- Issue: Slow query on chain_state table (5+ seconds)
-- Solution: Ensure proper indexing and optimize table
-- Database: MySQL

-- Ensure the primary key exists (chain should already be primary key)
-- ALTER TABLE `chain_state` ADD PRIMARY KEY (`chain`);

-- Create additional index if not exists (for safety)
CREATE INDEX `IDX_chain_state_chain` ON `chain_state` (`chain`);

-- Optimize table to rebuild indexes and update statistics
OPTIMIZE TABLE `chain_state`;

-- Analyze table to update statistics
ANALYZE TABLE `chain_state`;

-- Verify indexes exist
SHOW INDEX FROM `chain_state`;

