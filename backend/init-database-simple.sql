SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_id` (`user_id`) USING BTREE,
  UNIQUE KEY `uk_username` (`username`) USING BTREE,
  UNIQUE KEY `uk_email` (`email`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `status`) VALUES 
('user_001', 'admin', 'admin@poping.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxIh0Ca5gZb8Vaa', 'active'),
('user_002', 'testuser', 'test@poping.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxIh0Ca5gZb8Vaa', 'active');

-- ----------------------------
-- Table structure for agent_configs
-- ----------------------------
DROP TABLE IF EXISTS `agent_configs`;
CREATE TABLE `agent_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agent_config_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `session_config` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `dataset_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ext_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `is_public` tinyint(1) DEFAULT 0,
  `usage_count` int DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_agent_config_id` (`agent_config_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of agent_configs
-- ----------------------------
INSERT INTO `agent_configs` (`agent_config_id`, `user_id`, `name`, `description`, `status`, `is_public`, `usage_count`) VALUES 
('agent_001', 'user_001', '智能助手', '通用智能助手，可以回答各种问题', 'active', 1, 0),
('agent_002', 'user_001', '代码助手', '专业的编程助手，擅长代码生成和调试', 'active', 1, 0),
('agent_003', 'user_002', '写作助手', '专业的写作助手，帮助改进文章质量', 'active', 1, 0);

SET FOREIGN_KEY_CHECKS = 1;