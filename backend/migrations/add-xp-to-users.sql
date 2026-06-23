-- Add XP column to users table
ALTER TABLE `user` 
ADD COLUMN `xp` DECIMAL(18, 2) NOT NULL DEFAULT '0.00' AFTER `level`;

-- Update existing users' level based on XP (if they have any wagering history)
-- This is optional and can be run separately if needed
