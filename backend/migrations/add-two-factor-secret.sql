-- Add twoFactorSecret column for 2FA TOTP setup
ALTER TABLE `user`
ADD COLUMN `twoFactorSecret` VARCHAR(255) NULL DEFAULT NULL AFTER `twoFactorEnabled`;
