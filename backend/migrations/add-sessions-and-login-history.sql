-- Run this if Active Sessions and Login History don't appear after login.
-- Creates user_sessions and login_history.
-- Use your actual database name, e.g.: USE your_db_name;

-- 1. Create user_sessions table (MySQL)
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `device` varchar(255) NOT NULL DEFAULT 'Unknown',
  `ip` varchar(45) NOT NULL DEFAULT '',
  `userAgent` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_user_sessions_userId` (`userId`),
  CONSTRAINT `FK_user_sessions_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create login_history table (MySQL)
CREATE TABLE IF NOT EXISTS `login_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `device` varchar(255) NOT NULL DEFAULT 'Unknown',
  `ip` varchar(45) NOT NULL DEFAULT '',
  `status` varchar(20) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_login_history_userId` (`userId`),
  CONSTRAINT `FK_login_history_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
