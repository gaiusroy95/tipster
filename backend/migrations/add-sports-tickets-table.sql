-- Migration: Create sports_tickets table (one ticket per selection; single = 1 ticket, parlay/SGP = N tickets)
-- Date: 2025-03-01
-- Description: Ticket-based model so each leg has a stable id. New bets use tickets; legacy parlaySelections still supported.

CREATE TABLE IF NOT EXISTS `sports_tickets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `betId` INT NOT NULL,
  `gameId` VARCHAR(255) NULL,
  `sportId` INT NULL,
  `typeId` INT NULL,
  `maturity` BIGINT NULL,
  `line` FLOAT NULL,
  `playerId` INT NULL,
  `playerName` VARCHAR(255) NULL,
  `position` INT NULL,
  `homeTeam` VARCHAR(255) NULL,
  `awayTeam` VARCHAR(255) NULL,
  `tournamentName` VARCHAR(255) NULL,
  `positionLabel` VARCHAR(255) NULL,
  `marketType` VARCHAR(255) NULL,
  `odds` DECIMAL(18,8) NOT NULL,
  `oddsType` VARCHAR(32) NOT NULL DEFAULT 'normalizedImplied',
  PRIMARY KEY (`id`),
  INDEX `IDX_sports_tickets_betId` (`betId`),
  CONSTRAINT `FK_sports_tickets_bet` FOREIGN KEY (`betId`) REFERENCES `sports_bets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
