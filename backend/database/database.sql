-- ====================================================================
-- TRƯỜNG PHÁT REAL - HỆ THỐNG QUẢN LÝ BẤT ĐỘNG SẢN NỘI BỘ
-- Database Schema for MariaDB 10.6+ / MySQL 8.0+
-- Charset: utf8mb4, Collation: utf8mb4_unicode_ci, Engine: InnoDB
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- 1. BẢNG PHÂN QUYỀN & VAI TRÒ
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `user_permissions`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_system` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `module` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `code` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_perm_module` (`module`),
  INDEX `idx_perm_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. BẢNG NHÓM & NHÂN SỰ
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `teams` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `leader_id` INT UNSIGNED NULL,
  `description` TEXT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  INDEX `idx_team_status` (`status`),
  INDEX `idx_team_leader` (`leader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `avatar_url` VARCHAR(255) NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `team_id` INT UNSIGNED NULL,
  `title` VARCHAR(100) NULL,
  `status` ENUM('active', 'locked', 'inactive') NOT NULL DEFAULT 'active',
  `require_password_change` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` DATETIME NULL,
  `last_login_ip` VARCHAR(45) NULL,
  `failed_login_attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` DATETIME NULL,
  `notes` TEXT NULL,
  `created_by` INT UNSIGNED NULL,
  `updated_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  INDEX `idx_user_phone` (`phone`),
  INDEX `idx_user_status` (`status`),
  INDEX `idx_user_role` (`role_id`),
  INDEX `idx_user_team` (`team_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_user_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `teams` ADD CONSTRAINT `fk_team_leader` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

CREATE TABLE `team_members` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `team_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` DATETIME NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY `uk_team_user_active` (`team_id`, `user_id`, `is_active`),
  CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_permissions` (
  `user_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  `is_granted` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = grant override, 0 = revoke override',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `permission_id`),
  CONSTRAINT `fk_up_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_up_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. BẢNG XÁC THỰC, PHIÊN & BẢO MẬT
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `login_attempts`;

CREATE TABLE `password_resets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL,
  `token` VARCHAR(128) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `used_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pres_email` (`email`),
  INDEX `idx_pres_token` (`token`),
  INDEX `idx_pres_th` (`token_hash`),
  INDEX `idx_pres_user` (`user_id`),
  INDEX `idx_pres_exp` (`expires_at`),
  CONSTRAINT `fk_pres_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_sessions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `session_token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL,
  `last_activity` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sess_user` (`user_id`),
  INDEX `idx_sess_expires` (`expires_at`),
  INDEX `idx_sess_revoked` (`is_revoked`),
  CONSTRAINT `fk_sess_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `used_at` DATETIME NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_prt_user` (`user_id`),
  INDEX `idx_prt_expires` (`expires_at`),
  CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `login_attempts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL,
  `is_success` TINYINT(1) NOT NULL DEFAULT 0,
  `failure_reason` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_la_email` (`email`),
  INDEX `idx_la_ip` (`ip_address`),
  INDEX `idx_la_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. BẢNG ĐỊA CHÍNH (LOCATIONS) & CÀI ĐẶT
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `settings`;

CREATE TABLE `locations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `province` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `ward` VARCHAR(100) NULL,
  `code` VARCHAR(20) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  INDEX `idx_loc_province` (`province`),
  INDEX `idx_loc_district` (`district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key_name` VARCHAR(100) NOT NULL UNIQUE,
  `value_text` LONGTEXT NULL,
  `description` VARCHAR(255) NULL,
  `updated_by` INT UNSIGNED NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. BẢNG NGUỒN HÀNG (PROPERTIES) & LIÊN QUAN
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `property_assignments`;
DROP TABLE IF EXISTS `property_price_history`;
DROP TABLE IF EXISTS `property_images`;
DROP TABLE IF EXISTS `public_share_tokens`;
DROP TABLE IF EXISTS `properties`;

CREATE TABLE `properties` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `transaction_type` ENUM('sale', 'rent', 'transfer') NOT NULL,
  `property_type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `price_sale` DECIMAL(18, 2) NULL,
  `price_rent` DECIMAL(18, 2) NULL,
  `price_transfer` DECIMAL(18, 2) NULL,
  `price_unit` VARCHAR(20) NOT NULL DEFAULT 'VND',
  `area_land` DECIMAL(10, 2) NULL,
  `area_usable` DECIMAL(10, 2) NULL,
  `width` DECIMAL(6, 2) NULL,
  `length` DECIMAL(6, 2) NULL,
  `floors` INT UNSIGNED NULL,
  `bedrooms` INT UNSIGNED NULL,
  `bathrooms` INT UNSIGNED NULL,
  `direction` VARCHAR(30) NULL,
  `legal_status` VARCHAR(100) NULL,
  `address` VARCHAR(255) NOT NULL,
  `province` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `ward` VARCHAR(100) NULL,
  `street` VARCHAR(150) NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `owner_name` VARCHAR(150) NOT NULL,
  `owner_phone` VARCHAR(20) NOT NULL,
  `internal_notes` LONGTEXT NULL,
  `assigned_to` INT UNSIGNED NULL,
  `team_id` INT UNSIGNED NULL,
  `source` VARCHAR(100) NULL,
  `status` ENUM('new', 'verifying', 'selling', 'renting', 'deposited', 'sold', 'rented', 'paused', 'expired') NOT NULL DEFAULT 'new',
  `expired_at` DATE NULL,
  `created_by` INT UNSIGNED NULL,
  `updated_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  INDEX `idx_prop_trans_type` (`transaction_type`),
  INDEX `idx_prop_status` (`status`),
  INDEX `idx_prop_owner_phone` (`owner_phone`),
  INDEX `idx_prop_assigned` (`assigned_to`),
  INDEX `idx_prop_team` (`team_id`),
  INDEX `idx_prop_created` (`created_at`),
  INDEX `idx_prop_location` (`province`, `district`),
  FULLTEXT KEY `ft_prop_search` (`title`, `description`, `address`, `street`),
  CONSTRAINT `fk_prop_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prop_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `property_images` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `property_id` INT UNSIGNED NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `thumbnail_path` VARCHAR(255) NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(50) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pimg_prop` (`property_id`),
  CONSTRAINT `fk_pimg_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `property_price_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `property_id` INT UNSIGNED NOT NULL,
  `old_price` DECIMAL(18, 2) NULL,
  `new_price` DECIMAL(18, 2) NOT NULL,
  `price_type` ENUM('sale', 'rent', 'transfer') NOT NULL,
  `reason` VARCHAR(255) NULL,
  `changed_by` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pph_prop` (`property_id`),
  CONSTRAINT `fk_pph_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pph_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `property_assignments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `property_id` INT UNSIGNED NOT NULL,
  `from_user_id` INT UNSIGNED NULL,
  `to_user_id` INT UNSIGNED NOT NULL,
  `assigned_by` INT UNSIGNED NOT NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pass_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pass_to` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `public_share_tokens` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `property_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(64) NOT NULL UNIQUE,
  `created_by` INT UNSIGNED NOT NULL,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `expires_at` DATETIME NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pst_token` (`token`),
  CONSTRAINT `fk_pst_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. BẢNG KHÁCH HÀNG (CUSTOMERS) & LIÊN QUAN
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `customer_assignments`;
DROP TABLE IF EXISTS `customer_interactions`;
DROP TABLE IF EXISTS `property_matches`;
DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `phone_secondary` VARCHAR(20) NULL,
  `email` VARCHAR(191) NULL,
  `source` VARCHAR(100) NULL,
  `demand_type` ENUM('buy', 'rent', 'invest', 'transfer') NOT NULL DEFAULT 'buy',
  `property_type` VARCHAR(50) NULL,
  `budget_min` DECIMAL(18, 2) NULL,
  `budget_max` DECIMAL(18, 2) NULL,
  `target_locations` TEXT NULL,
  `desired_area_min` DECIMAL(10, 2) NULL,
  `desired_area_max` DECIMAL(10, 2) NULL,
  `legal_requirements` VARCHAR(255) NULL,
  `special_requirements` TEXT NULL,
  `potential_level` ENUM('high', 'medium', 'low', 'unqualified') NOT NULL DEFAULT 'medium',
  `status` ENUM('new', 'contacted', 'consulting', 'negotiating', 'deal_closed', 'lost', 'paused') NOT NULL DEFAULT 'new',
  `assigned_to` INT UNSIGNED NULL,
  `team_id` INT UNSIGNED NULL,
  `next_care_date` DATE NULL,
  `notes` LONGTEXT NULL,
  `created_by` INT UNSIGNED NULL,
  `updated_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  INDEX `idx_cust_phone` (`phone`),
  INDEX `idx_cust_status` (`status`),
  INDEX `idx_cust_potential` (`potential_level`),
  INDEX `idx_cust_assigned` (`assigned_to`),
  INDEX `idx_cust_next_care` (`next_care_date`),
  CONSTRAINT `fk_cust_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cust_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customer_interactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `type` ENUM('call', 'sms', 'meeting', 'view_house', 'note') NOT NULL,
  `content` LONGTEXT NOT NULL,
  `result` VARCHAR(255) NULL,
  `next_action` VARCHAR(255) NULL,
  `next_action_date` DATE NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ci_cust` (`customer_id`),
  CONSTRAINT `fk_ci_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customer_assignments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `from_user_id` INT UNSIGNED NULL,
  `to_user_id` INT UNSIGNED NOT NULL,
  `assigned_by` INT UNSIGNED NOT NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cass_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cass_to` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `property_matches` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `property_id` INT UNSIGNED NOT NULL,
  `match_score` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0 - 100',
  `match_reasons` TEXT NULL,
  `mismatch_reasons` TEXT NULL,
  `sent_to_customer` TINYINT(1) NOT NULL DEFAULT 0,
  `sent_at` DATETIME NULL,
  `customer_feedback` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pm_cust` (`customer_id`),
  INDEX `idx_pm_prop` (`property_id`),
  CONSTRAINT `fk_pm_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pm_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. BẢNG LỊCH HẸN (APPOINTMENTS)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;

CREATE TABLE `appointments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('call', 'meet', 'view_house', 'deposit_sign', 'contract_sign') NOT NULL,
  `customer_id` INT UNSIGNED NULL,
  `property_id` INT UNSIGNED NULL,
  `transaction_id` INT UNSIGNED NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `location` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `result` TEXT NULL,
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `cancellation_reason` VARCHAR(255) NULL,
  `created_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_app_user` (`user_id`),
  INDEX `idx_app_cust` (`customer_id`),
  INDEX `idx_app_prop` (`property_id`),
  INDEX `idx_app_start` (`start_time`),
  INDEX `idx_app_status` (`status`),
  CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_app_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_app_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. GIAO DỊCH BÁN, CHO THUÊ & HỢP ĐỒNG
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `contract_renewals`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `contracts`;
DROP TABLE IF EXISTS `rental_deals`;
DROP TABLE IF EXISTS `transaction_history`;
DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `type` ENUM('sale', 'transfer', 'rent') NOT NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `property_id` INT UNSIGNED NOT NULL,
  `listing_price` DECIMAL(18, 2) NOT NULL,
  `final_price` DECIMAL(18, 2) NOT NULL,
  `deposit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0,
  `deposit_date` DATE NULL,
  `expected_closing_date` DATE NULL,
  `lead_agent_id` INT UNSIGNED NOT NULL,
  `co_agent_id` INT UNSIGNED NULL,
  `referrer_name` VARCHAR(150) NULL,
  `status` ENUM('new', 'consulting', 'viewed', 'negotiating', 'deposited', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'new',
  `failure_reason` VARCHAR(255) NULL,
  `notes` LONGTEXT NULL,
  `created_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  INDEX `idx_tx_code` (`code`),
  INDEX `idx_tx_cust` (`customer_id`),
  INDEX `idx_tx_prop` (`property_id`),
  INDEX `idx_tx_agent` (`lead_agent_id`),
  INDEX `idx_tx_status` (`status`),
  CONSTRAINT `fk_tx_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_tx_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`),
  CONSTRAINT `fk_tx_lead_agent` FOREIGN KEY (`lead_agent_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `transaction_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` INT UNSIGNED NOT NULL,
  `from_status` VARCHAR(50) NULL,
  `to_status` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `notes` TEXT NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_txh_tx` (`transaction_id`),
  CONSTRAINT `fk_txh_tx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rental_deals` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` INT UNSIGNED NOT NULL,
  `property_id` INT UNSIGNED NOT NULL,
  `transaction_id` INT UNSIGNED NULL,
  `rent_price_monthly` DECIMAL(18, 2) NOT NULL,
  `deposit_amount` DECIMAL(18, 2) NOT NULL,
  `handover_date` DATE NOT NULL,
  `rental_start_date` DATE NOT NULL,
  `rental_end_date` DATE NOT NULL,
  `agent_id` INT UNSIGNED NOT NULL,
  `status` ENUM('active', 'terminated', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_rd_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_rd_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`),
  CONSTRAINT `fk_rd_agent` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contracts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `type` ENUM('sale', 'rental', 'brokerage') NOT NULL,
  `transaction_id` INT UNSIGNED NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `property_id` INT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `rent_price` DECIMAL(18, 2) NULL,
  `deposit_amount` DECIMAL(18, 2) NULL,
  `payment_cycle_months` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `terms` LONGTEXT NULL,
  `status` ENUM('draft', 'active', 'expired', 'terminated', 'cancelled') NOT NULL DEFAULT 'draft',
  `file_url` VARCHAR(255) NULL,
  `created_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_contract_cust` (`customer_id`),
  INDEX `idx_contract_prop` (`property_id`),
  INDEX `idx_contract_status` (`status`),
  CONSTRAINT `fk_ct_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_ct_prop` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contract_renewals` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `contract_id` INT UNSIGNED NOT NULL,
  `old_end_date` DATE NOT NULL,
  `new_end_date` DATE NOT NULL,
  `new_price` DECIMAL(18, 2) NULL,
  `notes` TEXT NULL,
  `renewed_by` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cr_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `contract_id` INT UNSIGNED NULL,
  `transaction_id` INT UNSIGNED NULL,
  `billing_period` VARCHAR(50) NULL,
  `amount_due` DECIMAL(18, 2) NOT NULL,
  `amount_paid` DECIMAL(18, 2) NOT NULL DEFAULT 0,
  `due_date` DATE NOT NULL,
  `payment_date` DATE NULL,
  `payment_method` ENUM('cash', 'bank_transfer', 'other') NOT NULL DEFAULT 'bank_transfer',
  `status` ENUM('unpaid', 'partial', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'unpaid',
  `confirmed_by` INT UNSIGNED NULL,
  `receipt_file_url` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pmt_status` (`status`),
  INDEX `idx_pmt_due` (`due_date`),
  CONSTRAINT `fk_pmt_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. HOA HỒNG (COMMISSIONS)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `commission_payments`;
DROP TABLE IF EXISTS `commission_splits`;
DROP TABLE IF EXISTS `commissions`;

CREATE TABLE `commissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `transaction_id` INT UNSIGNED NOT NULL UNIQUE,
  `gross_amount` DECIMAL(18, 2) NOT NULL,
  `deductions` DECIMAL(18, 2) NOT NULL DEFAULT 0,
  `net_amount` DECIMAL(18, 2) NOT NULL,
  `status` ENUM('draft', 'pending_approval', 'approved', 'partially_paid', 'paid', 'cancelled') NOT NULL DEFAULT 'draft',
  `approved_by` INT UNSIGNED NULL,
  `approved_at` DATETIME NULL,
  `notes` TEXT NULL,
  `created_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_comm_tx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`),
  CONSTRAINT `fk_comm_appr` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `commission_splits` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `commission_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `role_in_deal` VARCHAR(50) NOT NULL,
  `split_percentage` DECIMAL(5, 2) NOT NULL,
  `split_amount` DECIMAL(18, 2) NOT NULL,
  `amount_paid` DECIMAL(18, 2) NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'approved', 'partially_paid', 'paid') NOT NULL DEFAULT 'pending',
  `notes` VARCHAR(255) NULL,
  INDEX `idx_cs_comm` (`commission_id`),
  INDEX `idx_cs_user` (`user_id`),
  CONSTRAINT `fk_cs_comm` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `commission_payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `split_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(18, 2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_method` ENUM('cash', 'bank_transfer') NOT NULL,
  `receipt_url` VARCHAR(255) NULL,
  `paid_by` INT UNSIGNED NOT NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cp_split` FOREIGN KEY (`split_id`) REFERENCES `commission_splits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 10. THÔNG BÁO & NHẬT KÝ KIỂM TOÁN (AUDIT LOGS)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `audit_logs`;

CREATE TABLE `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `link_url` VARCHAR(255) NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_user` (`user_id`),
  INDEX `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `record_id` INT UNSIGNED NULL,
  `old_values` LONGTEXT NULL,
  `new_values` LONGTEXT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL,
  `is_success` TINYINT(1) NOT NULL DEFAULT 1,
  `error_message` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_module` (`module`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
