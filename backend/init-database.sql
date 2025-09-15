-- 智能体服务平台数据库初始化脚本
-- 执行前请确保MySQL服务已启动

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `poping_platform` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `poping_platform`;

-- 1. 用户表 (users)
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `user_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT '用户邮箱',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希值',
  `username` VARCHAR(255) DEFAULT NULL COMMENT '用户名',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '用户状态：active, inactive, banned',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- 2. 用户角色表 (user_roles)
CREATE TABLE `user_roles` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `role_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `role_name` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称：unlogged, registered, paid, admin',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户角色表';

-- 3. 用户-角色关联表 (user_user_roles)
CREATE TABLE `user_user_roles` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
  `role_id` VARCHAR(36) NOT NULL COMMENT '角色业务主键',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_role_unique` (`user_id`, `role_id`),
  KEY `fk_user_user_roles_user_id` (`user_id`),
  KEY `fk_user_user_roles_role_id` (`role_id`),
  CONSTRAINT `fk_user_user_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户-角色关联表';

-- 4. 订阅计划表 (subscription_plans)
CREATE TABLE `subscription_plans` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `plan_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `plan_name` VARCHAR(255) NOT NULL UNIQUE COMMENT '计划名称',
  `description` TEXT DEFAULT NULL COMMENT '计划描述',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '价格',
  `duration_days` INT NOT NULL COMMENT '订阅时长（天）',
  `features` JSON DEFAULT NULL COMMENT '计划包含的功能和额度',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '计划状态：active, inactive',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_plan_id` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订阅计划表';

-- 5. 用户订阅表 (user_subscriptions)
CREATE TABLE `user_subscriptions` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `subscription_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
  `plan_id` VARCHAR(36) NOT NULL COMMENT '订阅计划业务主键',
  `start_date` DATETIME NOT NULL COMMENT '订阅开始时间',
  `end_date` DATETIME NOT NULL COMMENT '订阅结束时间',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '订阅状态：active, expired, cancelled',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_subscription_id` (`subscription_id`),
  KEY `fk_user_subscriptions_user_id` (`user_id`),
  KEY `fk_user_subscriptions_plan_id` (`plan_id`),
  CONSTRAINT `fk_user_subscriptions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_subscriptions_plan_id` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`plan_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户订阅表';

-- 插入基础角色数据
INSERT INTO `user_roles` (`role_id`, `role_name`, `description`) VALUES
('role-unlogged', 'unlogged', '未登录用户'),
('role-registered', 'registered', '已注册用户'),
('role-paid', 'paid', '付费用户'),
('role-admin', 'admin', '管理员');

-- 插入基础订阅计划
INSERT INTO `subscription_plans` (`plan_id`, `plan_name`, `description`, `price`, `duration_days`, `features`) VALUES
('plan-free', '免费计划', '基础功能，有限额度', 0.00, 365, '{"api_calls": 1000, "storage": "1GB", "agents": 3}'),
('plan-pro', '专业计划', '专业功能，更多额度', 99.00, 30, '{"api_calls": 10000, "storage": "10GB", "agents": 10}'),
('plan-enterprise', '企业计划', '企业级功能，无限额度', 299.00, 30, '{"api_calls": -1, "storage": "100GB", "agents": -1}');

SET FOREIGN_KEY_CHECKS = 1;

-- 数据库初始化完成
SELECT 'Database initialization completed successfully!' as message;