-- Migration: Add balanceType column to sports_bets table
-- Date: 2025-10-23
-- Description: Track whether bet was placed with realBalance or testBalance

-- Add balanceType column with default value 'realBalance'
ALTER TABLE sports_bets 
ADD COLUMN balanceType ENUM('realBalance', 'testBalance') DEFAULT 'realBalance' NOT NULL
AFTER networkId;

-- Update existing rows to set balanceType based on networkId
-- Testnet chains (networkId 11155111, 11155420, 421614, 84532) use testBalance
-- Mainnet chains (networkId 1, 10, 42161, 8453) use realBalance
UPDATE sports_bets 
SET balanceType = CASE 
  WHEN networkId IN (11155111, 11155420, 421614, 84532) THEN 'testBalance'
  ELSE 'realBalance'
END;

-- Note: This migration assumes existing bets followed the same pattern
-- where testnet networkIds used testBalance and mainnet used realBalance

