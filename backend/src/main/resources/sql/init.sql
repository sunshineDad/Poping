-- 智能体服务平台数据库初始化脚本
-- 创建时间: 2024
-- 数据库: MySQL 8.0

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS poping_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE poping_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `avatar` VARCHAR(500) COMMENT '头像URL',
    `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
    `role` ENUM('user', 'admin') DEFAULT 'user' COMMENT '用户角色',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 智能体表
CREATE TABLE IF NOT EXISTS `agent` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '智能体ID',
    `name` VARCHAR(100) NOT NULL COMMENT '智能体名称',
    `description` TEXT COMMENT '智能体描述',
    `avatar` VARCHAR(500) COMMENT '智能体头像URL',
    `system_prompt` TEXT COMMENT '系统提示词',
    `config` JSON COMMENT '智能体配置（JSON格式）',
    `creator_user_id` BIGINT NOT NULL COMMENT '创建者用户ID',
    `is_public` BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    `status` ENUM('active', 'inactive', 'deleted') DEFAULT 'active' COMMENT '状态',
    `usage_count` BIGINT DEFAULT 0 COMMENT '使用次数',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_creator` (`creator_user_id`),
    INDEX `idx_public_status` (`is_public`, `status`),
    INDEX `idx_usage_count` (`usage_count` DESC),
    INDEX `idx_name` (`name`),
    FOREIGN KEY (`creator_user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智能体表';

-- 会话表
CREATE TABLE IF NOT EXISTS `session` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '会话ID',
    `aigents_session_id` VARCHAR(100) COMMENT 'AIGents系统会话ID',
    `title` VARCHAR(200) COMMENT '会话标题',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `agent_id` BIGINT NOT NULL COMMENT '智能体ID',
    `status` ENUM('active', 'archived', 'deleted') DEFAULT 'active' COMMENT '会话状态',
    `message_count` INT DEFAULT 0 COMMENT '消息数量',
    `last_activity` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后活动时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_user_agent` (`user_id`, `agent_id`),
    INDEX `idx_aigents_session` (`aigents_session_id`),
    INDEX `idx_last_activity` (`last_activity` DESC),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话表';

-- 消息表
CREATE TABLE IF NOT EXISTS `message` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '消息ID',
    `session_id` BIGINT NOT NULL COMMENT '会话ID',
    `type` ENUM('user', 'assistant', 'system') NOT NULL COMMENT '消息类型',
    `content` TEXT NOT NULL COMMENT '消息内容',
    `metadata` JSON COMMENT '消息元数据（JSON格式）',
    `sequence_number` INT NOT NULL COMMENT '消息序号',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_session_sequence` (`session_id`, `sequence_number`),
    INDEX `idx_session_time` (`session_id`, `create_time` DESC),
    INDEX `idx_type` (`type`),
    FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- 数据集表
CREATE TABLE IF NOT EXISTS `dataset` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '数据集ID',
    `name` VARCHAR(100) NOT NULL COMMENT '数据集名称',
    `description` TEXT COMMENT '数据集描述',
    `type` ENUM('text', 'image', 'audio', 'video', 'mixed') NOT NULL COMMENT '数据类型',
    `format` VARCHAR(50) COMMENT '数据格式',
    `size` BIGINT DEFAULT 0 COMMENT '数据大小（字节）',
    `record_count` BIGINT DEFAULT 0 COMMENT '记录数量',
    `file_path` VARCHAR(500) COMMENT '文件路径',
    `creator_user_id` BIGINT NOT NULL COMMENT '创建者用户ID',
    `is_public` BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    `status` ENUM('processing', 'ready', 'error', 'deleted') DEFAULT 'processing' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_creator` (`creator_user_id`),
    INDEX `idx_public_status` (`is_public`, `status`),
    INDEX `idx_type` (`type`),
    INDEX `idx_name` (`name`),
    FOREIGN KEY (`creator_user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据集表';

-- 订阅计划表
CREATE TABLE IF NOT EXISTS `subscription_plan` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '订阅计划ID',
    `name` VARCHAR(50) NOT NULL COMMENT '计划名称',
    `description` TEXT COMMENT '计划描述',
    `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
    `duration_days` INT NOT NULL COMMENT '有效期（天）',
    `features` JSON COMMENT '功能特性（JSON格式）',
    `limits` JSON COMMENT '使用限制（JSON格式）',
    `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_active_sort` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅计划表';

-- 用户订阅表
CREATE TABLE IF NOT EXISTS `user_subscription` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户订阅ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `plan_id` BIGINT NOT NULL COMMENT '订阅计划ID',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `end_time` DATETIME NOT NULL COMMENT '结束时间',
    `status` ENUM('active', 'expired', 'cancelled') DEFAULT 'active' COMMENT '订阅状态',
    `payment_amount` DECIMAL(10,2) COMMENT '支付金额',
    `payment_method` VARCHAR(50) COMMENT '支付方式',
    `payment_time` DATETIME COMMENT '支付时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_user_status` (`user_id`, `status`),
    INDEX `idx_end_time` (`end_time`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`plan_id`) REFERENCES `subscription_plan`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户订阅表';

-- 插入默认数据

-- 默认管理员用户
INSERT INTO `user` (`username`, `email`, `password`, `nickname`, `role`, `status`) VALUES 
('admin', 'admin@poping.ai', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8ioctKcn5c1jvGKEJKS0.k8gKKJbG', '系统管理员', 'admin', 'active');

-- 默认订阅计划
INSERT INTO `subscription_plan` (`name`, `description`, `price`, `duration_days`, `features`, `limits`, `sort_order`) VALUES 
('免费版', '基础功能，适合个人用户体验', 0.00, 30, 
 '{"agents": 3, "sessions": 10, "messages_per_day": 100, "dataset_size": "100MB"}', 
 '{"max_agents": 3, "max_sessions": 10, "daily_messages": 100, "dataset_size_mb": 100}', 1),
('专业版', '完整功能，适合专业用户', 99.00, 30, 
 '{"agents": 50, "sessions": 100, "messages_per_day": 1000, "dataset_size": "1GB", "priority_support": true}', 
 '{"max_agents": 50, "max_sessions": 100, "daily_messages": 1000, "dataset_size_mb": 1024}', 2),
('企业版', '无限制功能，适合企业用户', 299.00, 30, 
 '{"agents": "unlimited", "sessions": "unlimited", "messages_per_day": "unlimited", "dataset_size": "unlimited", "priority_support": true, "custom_models": true}', 
 '{"max_agents": -1, "max_sessions": -1, "daily_messages": -1, "dataset_size_mb": -1}', 3);

-- 示例智能体
INSERT INTO `agent` (`name`, `description`, `avatar`, `system_prompt`, `config`, `creator_user_id`, `is_public`, `status`) VALUES 
('通用助手', '一个友好的AI助手，可以帮助您解答各种问题', '/avatars/assistant.png', 
 '你是一个友好、专业的AI助手。请用简洁、准确的语言回答用户的问题，并尽可能提供有用的建议。', 
 '{"temperature": 0.7, "max_tokens": 2000, "model": "gpt-3.5-turbo"}', 
 1, TRUE, 'active'),
('代码助手', '专业的编程助手，擅长各种编程语言和技术问题', '/avatars/coder.png', 
 '你是一个专业的编程助手，精通各种编程语言和开发技术。请提供清晰、可执行的代码示例和技术解决方案。', 
 '{"temperature": 0.3, "max_tokens": 3000, "model": "gpt-4"}', 
 1, TRUE, 'active'),
('写作助手', '创意写作专家，帮助您创作各种文本内容', '/avatars/writer.png', 
 '你是一个创意写作专家，擅长各种文体的创作。请根据用户需求提供高质量的文本内容，注意语言的流畅性和创意性。', 
 '{"temperature": 0.8, "max_tokens": 2500, "model": "gpt-3.5-turbo"}', 
 1, TRUE, 'active');

-- 创建索引优化查询性能
CREATE INDEX `idx_message_session_create_time` ON `message` (`session_id`, `create_time` DESC);
CREATE INDEX `idx_session_user_last_activity` ON `session` (`user_id`, `last_activity` DESC);
CREATE INDEX `idx_agent_public_usage` ON `agent` (`is_public`, `usage_count` DESC, `status`);

-- 设置自动更新时间戳
ALTER TABLE `user` MODIFY COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `agent` MODIFY COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `session` MODIFY COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `dataset` MODIFY COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `subscription_plan` MODIFY COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `user_subscription` MODIFY COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

COMMIT;