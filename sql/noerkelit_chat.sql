-- --------------------------------------------------------
-- Host:                         demo.noerkelit.online
-- Server-Version:               10.11.2-MariaDB-1:10.11.2+maria~ubu2204 - mariadb.org binary distribution
-- Server-Betriebssystem:        debian-linux-gnu
-- HeidiSQL Version:             12.4.0.6659
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Exportiere Datenbank-Struktur für noerkelit_chat
CREATE DATABASE IF NOT EXISTS `noerkelit_chat` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `noerkelit_chat`;

-- Exportiere Struktur von Tabelle noerkelit_chat.chat_pictures
CREATE TABLE IF NOT EXISTS `chat_pictures` (
  `id` int(11) NOT NULL,
  `filename` varchar(50) DEFAULT NULL,
  `content_type` varchar(50) DEFAULT NULL,
  `chat_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_chat_pictures_rooms` (`chat_id`),
  CONSTRAINT `FK_chat_pictures_rooms` FOREIGN KEY (`chat_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.chat_pictures: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.delete_user
CREATE TABLE IF NOT EXISTS `delete_user` (
  `user_id` int(11) NOT NULL,
  `url` varchar(100) DEFAULT NULL,
  `uuid` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `FK_delete_user_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.delete_user: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.message_status
CREATE TABLE IF NOT EXISTS `message_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `was_read` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__room_messages` (`message_id`),
  KEY `FK_message_status_users` (`user_id`),
  CONSTRAINT `FK__room_messages` FOREIGN KEY (`message_id`) REFERENCES `room_messages` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_message_status_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=327 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.message_status: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.rooms
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `is_group` int(11) NOT NULL DEFAULT 0,
  `picture` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_rooms_chat_pictures` (`picture`),
  CONSTRAINT `FK_rooms_chat_pictures` FOREIGN KEY (`picture`) REFERENCES `chat_pictures` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.rooms: ~3 rows (ungefähr)
INSERT INTO `rooms` (`id`, `name`, `is_group`, `picture`) VALUES
	(1, 'Males', 1, NULL),
	(2, 'Females', 1, NULL),
	(5, 'All', 1, NULL);

-- Exportiere Struktur von Tabelle noerkelit_chat.room_members
CREATE TABLE IF NOT EXISTS `room_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `in_call` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_room_members_rooms` (`room_id`),
  KEY `FK_room_members_users` (`user_id`),
  CONSTRAINT `FK_room_members_rooms` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_room_members_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=163 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.room_members: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.room_messages
CREATE TABLE IF NOT EXISTS `room_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `send_at` varchar(50) NOT NULL,
  `chat_message` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `file` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__users` (`user_id`),
  KEY `FK__rooms` (`room_id`),
  KEY `FK_room_messages_room_messages_files` (`file`),
  CONSTRAINT `FK__rooms` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK__users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_room_messages_room_messages_files` FOREIGN KEY (`file`) REFERENCES `room_messages_files` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=567 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.room_messages: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.room_messages_files
CREATE TABLE IF NOT EXISTS `room_messages_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `display_name` varchar(50) NOT NULL DEFAULT '0',
  `real_name` varchar(100) NOT NULL DEFAULT '0',
  `user_id` int(11) DEFAULT NULL,
  `msg_id` int(11) DEFAULT NULL,
  `content_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_room_messages_files_users` (`user_id`),
  KEY `FK_room_messages_files_room_messages` (`msg_id`),
  CONSTRAINT `FK_room_messages_files_room_messages` FOREIGN KEY (`msg_id`) REFERENCES `room_messages` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_room_messages_files_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.room_messages_files: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.statu
CREATE TABLE IF NOT EXISTS `statu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '0',
  `color` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.statu: ~4 rows (ungefähr)
INSERT INTO `statu` (`id`, `name`, `color`) VALUES
	(1, 'online', '#98FB98'),
	(2, 'absent', '#FFD700'),
	(3, 'employs', '#B22222'),
	(4, 'offline', '0');

-- Exportiere Struktur von Tabelle noerkelit_chat.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `about_information` varchar(250) DEFAULT NULL,
  `picture` int(11) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `website` varchar(50) DEFAULT NULL,
  `socket_id` varchar(50) DEFAULT NULL,
  `peer_id` varchar(50) DEFAULT NULL,
  `keycloak` int(11) DEFAULT 0,
  `verify` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `FK_users_users_pictures` (`picture`),
  KEY `FK_users_statu` (`status`),
  CONSTRAINT `FK_users_statu` FOREIGN KEY (`status`) REFERENCES `statu` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_users_users_pictures` FOREIGN KEY (`picture`) REFERENCES `users_pictures` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.users: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.users_pictures
CREATE TABLE IF NOT EXISTS `users_pictures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(50) DEFAULT NULL,
  `content_type` varchar(50) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_users_pictures_users` (`user_id`),
  CONSTRAINT `FK_users_pictures_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.users_pictures: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.user_credentials
CREATE TABLE IF NOT EXISTS `user_credentials` (
  `user_id` int(11) DEFAULT NULL,
  `password` varchar(500) DEFAULT NULL,
  `first_logon` int(11) DEFAULT 1,
  KEY `FK_user_credentials_users` (`user_id`),
  CONSTRAINT `FK_user_credentials_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.user_credentials: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.user_location
CREATE TABLE IF NOT EXISTS `user_location` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `zip` varchar(50) DEFAULT NULL,
  `street` varchar(50) DEFAULT NULL,
  `street_nr` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`location_id`) USING BTREE,
  KEY `FK_user_location_users` (`user_id`) USING BTREE,
  CONSTRAINT `FK_user_location_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.user_location: ~0 rows (ungefähr)

-- Exportiere Struktur von Tabelle noerkelit_chat.user_otp
CREATE TABLE IF NOT EXISTS `user_otp` (
  `user_id` int(11) DEFAULT NULL,
  `secret` blob DEFAULT NULL,
  `qrCode` longblob DEFAULT NULL,
  `ascii` longblob DEFAULT NULL,
  `wanted` int(11) NOT NULL DEFAULT 0,
  KEY `FK_user_otp_users` (`user_id`),
  CONSTRAINT `FK_user_otp_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Exportiere Daten aus Tabelle noerkelit_chat.user_otp: ~0 rows (ungefähr)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;


