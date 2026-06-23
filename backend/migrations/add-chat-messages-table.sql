-- Migration: Create chat_messages table for global live chat (multi-language threads)
-- Date: 2025-03-01

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `username` VARCHAR(32) NOT NULL,
  `thread` VARCHAR(16) NOT NULL,
  `content` TEXT NOT NULL,
  `vipLevel` SMALLINT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_chat_messages_thread_created` (`thread`, `createdAt`),
  CONSTRAINT `FK_chat_messages_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
