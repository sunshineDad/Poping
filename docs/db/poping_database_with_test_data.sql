SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `poping` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `poping`;

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

-- 6. 订单表 (orders)
CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `order_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
  `subscription_id` VARCHAR(36) DEFAULT NULL COMMENT '订阅业务主键，可为空',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '订单金额',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT '货币类型',
  `payment_method` VARCHAR(50) DEFAULT NULL COMMENT '支付方式',
  `transaction_id` VARCHAR(255) DEFAULT NULL COMMENT '支付系统交易ID',
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT '订单状态：pending, completed, failed',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order_id` (`order_id`),
  KEY `fk_orders_user_id` (`user_id`),
  KEY `fk_orders_subscription_id` (`subscription_id`),
  CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_subscription_id` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`subscription_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单表';

-- 7. API Key表 (api_keys)
CREATE TABLE `api_keys` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `api_key_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
  `api_key_secret` VARCHAR(255) NOT NULL UNIQUE COMMENT 'API Key密文，加密存储',
  `name` VARCHAR(255) DEFAULT NULL COMMENT 'API Key名称',
  `permissions` JSON DEFAULT NULL COMMENT 'API Key的权限配置',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT 'API Key状态：active, inactive, revoked',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `expires_at` DATETIME DEFAULT NULL COMMENT '过期时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_api_key_id` (`api_key_id`),
  KEY `fk_api_keys_user_id` (`user_id`),
  CONSTRAINT `fk_api_keys_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='API Key表';

-- 8. 供应商表 (providers)
CREATE TABLE `providers` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `provider_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `name` VARCHAR(255) NOT NULL UNIQUE COMMENT '供应商名称',
  `description` TEXT DEFAULT NULL COMMENT '供应商描述',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '供应商状态：active, inactive',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_provider_id` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='供应商表';

-- 9. 供应商配置表 (provider_configs)
CREATE TABLE `provider_configs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `config_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `provider_id` VARCHAR(36) NOT NULL COMMENT '供应商业务主键',
  `config_name` VARCHAR(255) NOT NULL COMMENT '配置名称',
  `api_base_url` VARCHAR(255) DEFAULT NULL COMMENT 'API基础URL',
  `api_token` VARCHAR(255) DEFAULT NULL COMMENT 'API Token，加密存储',
  `other_configs` JSON DEFAULT NULL COMMENT '其他配置参数，如模型列表、默认参数等',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '配置状态：active, inactive',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_id` (`config_id`),
  KEY `fk_provider_configs_provider_id` (`provider_id`),
  CONSTRAINT `fk_provider_configs_provider_id` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`provider_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='供应商配置表';

-- 10. 用户MCP配置表 (user_mcp_configs)
CREATE TABLE `user_mcp_configs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `user_mcp_config_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
  `provider_config_id` VARCHAR(36) NOT NULL COMMENT '供应商配置业务主键',
  `agent_id` VARCHAR(36) DEFAULT NULL COMMENT '关联的智能体业务主键',
  `config_name` VARCHAR(255) DEFAULT NULL COMMENT '用户自定义配置名称',
  `parameters` JSON DEFAULT NULL COMMENT '模型参数',
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为用户默认配置',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_mcp_config_id` (`user_mcp_config_id`),
  KEY `fk_user_mcp_configs_user_id` (`user_id`),
  KEY `fk_user_mcp_configs_provider_config_id` (`provider_config_id`),
  KEY `fk_user_mcp_configs_agent_id` (`agent_id`),
  CONSTRAINT `fk_user_mcp_configs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_mcp_configs_provider_config_id` FOREIGN KEY (`provider_config_id`) REFERENCES `provider_configs` (`config_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_mcp_configs_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `agent_configs` (`agent_config_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户MCP配置表';

-- 11. 数据集表 (datasets)
CREATE TABLE `datasets` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `dataset_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
  `name` VARCHAR(255) NOT NULL COMMENT '数据集名称',
  `description` TEXT DEFAULT NULL COMMENT '数据集描述',
  `file_path` VARCHAR(255) DEFAULT NULL COMMENT '原始文件存储路径',
  `processed_data_path` VARCHAR(255) DEFAULT NULL COMMENT '处理后数据存储路径',
  `status` VARCHAR(50) NOT NULL DEFAULT 'uploaded' COMMENT '数据集状态：uploaded, processing, processed, failed',
  `format` VARCHAR(50) DEFAULT NULL COMMENT '文件格式：csv, json, txt, pdf',
  `size_bytes` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_dataset_id` (`dataset_id`),
  KEY `fk_datasets_user_id` (`user_id`),
  CONSTRAINT `fk_datasets_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据集表';

-- 12. 数据集处理记录表 (dataset_processing_logs)
CREATE TABLE `dataset_processing_logs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `log_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `dataset_id` VARCHAR(36) NOT NULL COMMENT '数据集业务主键',
  `processor_name` VARCHAR(255) DEFAULT NULL COMMENT '处理引擎名称',
  `start_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '处理开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '处理结束时间',
  `status` VARCHAR(50) NOT NULL DEFAULT 'running' COMMENT '处理状态：success, failed, running',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `details` JSON DEFAULT NULL COMMENT '处理详情',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_log_id` (`log_id`),
  KEY `fk_dataset_processing_logs_dataset_id` (`dataset_id`),
  CONSTRAINT `fk_dataset_processing_logs_dataset_id` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`dataset_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据集处理记录表';

-- 13. API调用日志表 (api_call_logs)
CREATE TABLE `api_call_logs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `log_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `api_key_id` VARCHAR(36) NOT NULL COMMENT 'API Key业务主键',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
  `provider_config_id` VARCHAR(36) DEFAULT NULL COMMENT '供应商配置业务主键，可为空',
  `agent_id` VARCHAR(36) DEFAULT NULL COMMENT '关联的智能体业务主键',
  `endpoint` VARCHAR(255) NOT NULL COMMENT '调用的API端点',
  `request_payload` TEXT DEFAULT NULL COMMENT '请求体',
  `response_payload` TEXT DEFAULT NULL COMMENT '响应体',
  `status_code` INT DEFAULT NULL COMMENT 'HTTP状态码',
  `latency_ms` INT DEFAULT NULL COMMENT '延迟（毫秒）',
  `token_count` INT DEFAULT NULL COMMENT '消耗的token数量',
  `cost` DECIMAL(10, 4) DEFAULT NULL COMMENT '本次调用产生的费用',
  `called_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '调用时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_api_call_log_id` (`log_id`),
  KEY `fk_api_call_logs_api_key_id` (`api_key_id`),
  KEY `fk_api_call_logs_user_id` (`user_id`),
  KEY `fk_api_call_logs_provider_config_id` (`provider_config_id`),
  KEY `fk_api_call_logs_agent_id` (`agent_id`),
  CONSTRAINT `fk_api_call_logs_api_key_id` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys` (`api_key_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_api_call_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_api_call_logs_provider_config_id` FOREIGN KEY (`provider_config_id`) REFERENCES `provider_configs` (`config_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_api_call_logs_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `agent_configs` (`agent_config_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='API调用日志表';

-- 14. 门户内容管理表 (portal_contents)
CREATE TABLE `portal_contents` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `content_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `content_type` VARCHAR(50) NOT NULL COMMENT '内容类型：document, subscription_page, tutorial',
  `title` VARCHAR(255) NOT NULL COMMENT '标题',
  `slug` VARCHAR(255) UNIQUE DEFAULT NULL COMMENT 'URL友好名称',
  `content_markdown` LONGTEXT DEFAULT NULL COMMENT 'Markdown格式内容',
  `author_id` VARCHAR(36) DEFAULT NULL COMMENT '作者业务主键',
  `status` VARCHAR(50) NOT NULL DEFAULT 'draft' COMMENT '状态：draft, published, archived',
  `published_at` DATETIME DEFAULT NULL COMMENT '发布时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_content_id` (`content_id`),
  KEY `fk_portal_contents_author_id` (`author_id`),
  CONSTRAINT `fk_portal_contents_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='门户内容管理表';

-- 15. 智能体配置管理表 (agent_configs)
CREATE TABLE `agent_configs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `agent_config_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
  `name` VARCHAR(255) NOT NULL COMMENT '智能体配置名称',
  `description` TEXT DEFAULT NULL COMMENT '智能体配置描述',
  `session_config` JSON NOT NULL COMMENT '会话配置信息，对应外部API的session配置',
  `dataset_id` VARCHAR(36) DEFAULT NULL COMMENT '关联数据集业务主键',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '状态：active, inactive, deleted',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_agent_config_id` (`agent_config_id`),
  KEY `fk_agent_configs_user_id` (`user_id`),
  KEY `fk_agent_configs_dataset_id` (`dataset_id`),
  CONSTRAINT `fk_agent_configs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_agent_configs_dataset_id` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`dataset_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='智能体配置管理表';

-- 16. 事件日志表 (event_logs)
CREATE TABLE `event_logs` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `event_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `user_id` VARCHAR(36) DEFAULT NULL COMMENT '用户业务主键，可为空',
  `event_type` VARCHAR(255) NOT NULL COMMENT '事件类型',
  `event_details` JSON DEFAULT NULL COMMENT '事件详细信息',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_event_id` (`event_id`),
  KEY `fk_event_logs_user_id` (`user_id`),
  CONSTRAINT `fk_event_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='事件日志表';



-- 17. 会话表 (chat_sessions)
CREATE TABLE `chat_sessions` (
   `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
   `session_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
   `external_session_id` VARCHAR(36) DEFAULT NULL COMMENT '外部API会话ID',
   `user_id` VARCHAR(36) NOT NULL COMMENT '用户业务主键',
   `agent_config_id` VARCHAR(36) DEFAULT NULL COMMENT '智能体配置业务主键',
   `title` VARCHAR(255) DEFAULT NULL COMMENT '会话标题',
   `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '状态：active, archived, deleted',
   `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
   PRIMARY KEY (`id`),
   UNIQUE KEY `idx_session_id` (`session_id`),
   UNIQUE KEY `idx_external_session_id` (`external_session_id`),
   KEY `fk_chat_sessions_user_id` (`user_id`),
   KEY `fk_chat_sessions_agent_config_id` (`agent_config_id`),
   CONSTRAINT `fk_chat_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
   CONSTRAINT `fk_chat_sessions_agent_config_id` FOREIGN KEY (`agent_config_id`) REFERENCES `agent_configs` (`agent_config_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='聊天会话表';

-- 18. 消息表 (chat_messages)
CREATE TABLE `chat_messages` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
  `message_id` VARCHAR(36) NOT NULL COMMENT '业务主键，UUID',
  `session_id` VARCHAR(36) NOT NULL COMMENT '会话业务主键',
  `role` VARCHAR(20) NOT NULL COMMENT '消息角色：user, assistant, system',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `metadata` JSON DEFAULT NULL COMMENT '消息元数据，如token数量、模型参数等',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `ext_info` JSON DEFAULT NULL COMMENT '扩展字段',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_message_id` (`message_id`),
  KEY `fk_chat_messages_session_id` (`session_id`),
  CONSTRAINT `fk_chat_messages_session_id` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='聊天消息表';

SET FOREIGN_KEY_CHECKS = 1;


