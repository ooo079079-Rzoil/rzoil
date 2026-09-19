-- =======================================================
-- RZ Oil Jordan - InfinityFree MySQL Database Schema & Seed
-- متجر رزويل الأردن - قاعدة البيانات الرسمية
-- =======================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+03:00";

-- 1. جدول المنتجات (Products Table)
CREATE TABLE IF NOT EXISTS `rzoil_products` (
  `id` varchar(64) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `original_price` decimal(10,2) DEFAULT NULL,
  `origin_badge` varchar(100) DEFAULT 'ألماني أصلي DE',
  `brand` varchar(100) DEFAULT 'RZ Oil Germany',
  `category` varchar(100) DEFAULT 'اضافات الوقود',
  `image` mediumtext DEFAULT NULL,
  `description` text DEFAULT NULL,
  `volume` varchar(64) DEFAULT '300 مل',
  `in_stock` tinyint(1) DEFAULT '1',
  `features` text DEFAULT NULL,
  `usage_guide` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول الطلبات والمبيعات (Orders Table)
CREATE TABLE IF NOT EXISTS `rzoil_orders` (
  `id` varchar(64) NOT NULL,
  `order_number` varchar(64) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `phone` varchar(64) NOT NULL,
  `city` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `notes` text DEFAULT NULL,
  `items_json` mediumtext NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shipping_cost` decimal(10,2) NOT NULL DEFAULT '3.00',
  `grand_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','processing','delivered','cancelled') DEFAULT 'pending',
  `created_at` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول الموزعين ونقاط البيع في الأردن (Distributors Table)
CREATE TABLE IF NOT EXISTS `rzoil_distributors` (
  `id` varchar(64) NOT NULL,
  `city` varchar(100) NOT NULL,
  `area` varchar(255) NOT NULL,
  `phone` varchar(64) NOT NULL,
  `address` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. بيانات الموزعين الأولية في محافظات الأردن
INSERT INTO `rzoil_distributors` (`id`, `city`, `area`, `phone`, `address`) VALUES
('dist_amman', 'عمان', 'خلدا، شارع مكة، وبيادر وادي السير', '0791000001', 'مركز خدمة وتوزيع رزويل المعتمد'),
('dist_irbid', 'إربد', 'شارع الهاشمي والحي الشرقي', '0791000002', 'موزع معتمد - محطات خدمة وصيانة'),
('dist_zarqa', 'الزرقاء', 'الزرقاء الجديدة والمنطقة الحرفية', '0791000003', 'مركز قطع غيار وزيوت المحركات الألمانية'),
('dist_aqaba', 'العقبة', 'المنطقة التجارية والمنطقة الاقتصادية الخاصة', '0791000004', 'موزع إقليمي معتمد لجنوب المملكة')
ON DUPLICATE KEY UPDATE `city` = VALUES(`city`);

-- 5. جدول إعدادات المتجر (Store Settings Table)
CREATE TABLE IF NOT EXISTS `rzoil_settings` (
  `key_name` varchar(64) NOT NULL,
  `value_text` text NOT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rzoil_settings` (`key_name`, `value_text`) VALUES
('store_name', 'متجر رزويل الأردن - RZ Oil Jordan'),
('currency', 'دينار أردني (JOD / د.أ)'),
('shipping_cost', '3.00'),
('support_phone', '0791000001'),
('whatsapp_phone', '0791000001'),
('working_hours', 'يومياً من 9:00 صباحاً حتى 9:00 مساءً ما عدا الجمعة'),
('admin_username', 'admin'),
('admin_password', '123')
ON DUPLICATE KEY UPDATE `value_text` = VALUES(`value_text`);

-- 6. جدول مدراء ومسؤولي النظام (Admins Table)
CREATE TABLE IF NOT EXISTS `rzoil_admins` (
  `id` varchar(64) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rzoil_admins` (`id`, `username`, `password`, `role`) VALUES
('admin_main', 'admin', '123', 'admin')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);
