/*
 Navicat Premium Data Transfer

 Source Server         : ai-contract
 Source Server Type    : MySQL
 Source Server Version : 80200
 Source Host           : localhost:3306
 Source Schema         : poping

 Target Server Type    : MySQL
 Target Server Version : 80200
 File Encoding         : 65001

 Date: 15/09/2025 21:06:14
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for agent_configs
-- ----------------------------
DROP TABLE IF EXISTS `agent_configs`;
CREATE TABLE `agent_configs`  (
                                  `id` bigint NOT NULL AUTO_INCREMENT,
                                  `agent_config_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
                                  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
                                  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
                                  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
                                  `session_config` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
                                  `dataset_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
                                  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'active',
                                  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
                                  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                  `ext_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
                                  `is_public` tinyint(1) NULL DEFAULT 0,
                                  `usage_count` int NULL DEFAULT 0,
                                  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                                  PRIMARY KEY (`id`) USING BTREE,
                                  UNIQUE INDEX `uk_agent_config_id`(`agent_config_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of agent_configs
-- ----------------------------
INSERT INTO `agent_configs` VALUES (1, 'agent_001', 'user_001', '智能助手', '通用智能助手，可以回答各种问题', NULL, NULL, 'active', '2025-09-15 11:47:55', '2025-09-15 11:55:38', NULL, 1, 0, '2025-09-15 11:55:27');
INSERT INTO `agent_configs` VALUES (2, 'agent_002', 'user_001', '代码助手', '专业的编程助手，擅长代码生成和调试', NULL, NULL, 'active', '2025-09-15 11:47:55', '2025-09-15 11:55:38', NULL, 1, 0, '2025-09-15 11:55:27');
INSERT INTO `agent_configs` VALUES (3, 'agent_003', 'user_002', '写作助手', '专业的写作助手，帮助改进文章质量', NULL, NULL, 'active', '2025-09-15 11:47:55', '2025-09-15 11:55:38', NULL, 1, 0, '2025-09-15 11:55:27');

-- ----------------------------
-- Table structure for api_call_logs
-- ----------------------------
DROP TABLE IF EXISTS `api_call_logs`;
CREATE TABLE `api_call_logs`  (
                                  `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                  `log_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                  `api_key_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'API Key业务主键',
                                  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户业务主键',
                                  `provider_config_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '供应商配置业务主键，可为空',
                                  `agent_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '关联的智能体业务主键',
                                  `endpoint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '调用的API端点',
                                  `request_payload` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '请求体',
                                  `response_payload` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '响应体',
                                  `status_code` int NULL DEFAULT NULL COMMENT 'HTTP状态码',
                                  `latency_ms` int NULL DEFAULT NULL COMMENT '延迟（毫秒）',
                                  `token_count` int NULL DEFAULT NULL COMMENT '消耗的token数量',
                                  `cost` decimal(10, 4) NULL DEFAULT NULL COMMENT '本次调用产生的费用',
                                  `called_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '调用时间',
                                  `ext_info` json NULL COMMENT '扩展字段',
                                  PRIMARY KEY (`id`) USING BTREE,
                                  UNIQUE INDEX `idx_api_call_log_id`(`log_id` ASC) USING BTREE,
                                  INDEX `fk_api_call_logs_api_key_id`(`api_key_id` ASC) USING BTREE,
                                  INDEX `fk_api_call_logs_user_id`(`user_id` ASC) USING BTREE,
                                  INDEX `fk_api_call_logs_provider_config_id`(`provider_config_id` ASC) USING BTREE,
                                  INDEX `fk_api_call_logs_agent_id`(`agent_id` ASC) USING BTREE,
                                  CONSTRAINT `fk_api_call_logs_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `agent_configs` (`agent_config_id`) ON DELETE SET NULL ON UPDATE CASCADE,
                                  CONSTRAINT `fk_api_call_logs_api_key_id` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys` (`api_key_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                  CONSTRAINT `fk_api_call_logs_provider_config_id` FOREIGN KEY (`provider_config_id`) REFERENCES `provider_configs` (`config_id`) ON DELETE SET NULL ON UPDATE CASCADE,
                                  CONSTRAINT `fk_api_call_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'API调用日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of api_call_logs
-- ----------------------------

-- ----------------------------
-- Table structure for api_keys
-- ----------------------------
DROP TABLE IF EXISTS `api_keys`;
CREATE TABLE `api_keys`  (
                             `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                             `api_key_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                             `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户业务主键',
                             `api_key_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'API Key密文，加密存储',
                             `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'API Key名称',
                             `permissions` json NULL COMMENT 'API Key的权限配置',
                             `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active' COMMENT 'API Key状态：active, inactive, revoked',
                             `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                             `expires_at` datetime NULL DEFAULT NULL COMMENT '过期时间',
                             `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                             `ext_info` json NULL COMMENT '扩展字段',
                             PRIMARY KEY (`id`) USING BTREE,
                             UNIQUE INDEX `api_key_secret`(`api_key_secret` ASC) USING BTREE,
                             UNIQUE INDEX `idx_api_key_id`(`api_key_id` ASC) USING BTREE,
                             INDEX `fk_api_keys_user_id`(`user_id` ASC) USING BTREE,
                             CONSTRAINT `fk_api_keys_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'API Key表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of api_keys
-- ----------------------------

-- ----------------------------
-- Table structure for chat_messages
-- ----------------------------
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages`  (
                                  `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                  `message_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                  `session_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '会话业务主键',
                                  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '消息角色：user, assistant, system',
                                  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '消息内容',
                                  `metadata` json NULL COMMENT '消息元数据，如token数量、模型参数等',
                                  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                  `ext_info` json NULL COMMENT '扩展字段',
                                  PRIMARY KEY (`id`) USING BTREE,
                                  UNIQUE INDEX `idx_message_id`(`message_id` ASC) USING BTREE,
                                  INDEX `fk_chat_messages_session_id`(`session_id` ASC) USING BTREE,
                                  CONSTRAINT `fk_chat_messages_session_id` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '聊天消息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of chat_messages
-- ----------------------------

-- ----------------------------
-- Table structure for chat_sessions
-- ----------------------------
DROP TABLE IF EXISTS `chat_sessions`;
CREATE TABLE `chat_sessions`  (
                                  `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                  `session_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                  `external_session_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '外部API会话ID',
                                  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户业务主键',
                                  `agent_config_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '智能体配置业务主键',
                                  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '会话标题',
                                  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active' COMMENT '状态：active, archived, deleted',
                                  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                  `ext_info` json NULL COMMENT '扩展字段',
                                  PRIMARY KEY (`id`) USING BTREE,
                                  UNIQUE INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
                                  UNIQUE INDEX `idx_external_session_id`(`external_session_id` ASC) USING BTREE,
                                  INDEX `fk_chat_sessions_user_id`(`user_id` ASC) USING BTREE,
                                  INDEX `fk_chat_sessions_agent_config_id`(`agent_config_id` ASC) USING BTREE,
                                  CONSTRAINT `fk_chat_sessions_agent_config_id` FOREIGN KEY (`agent_config_id`) REFERENCES `agent_configs` (`agent_config_id`) ON DELETE SET NULL ON UPDATE CASCADE,
                                  CONSTRAINT `fk_chat_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '聊天会话表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of chat_sessions
-- ----------------------------

-- ----------------------------
-- Table structure for dataset_processing_logs
-- ----------------------------
DROP TABLE IF EXISTS `dataset_processing_logs`;
CREATE TABLE `dataset_processing_logs`  (
                                            `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                            `log_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                            `dataset_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '数据集业务主键',
                                            `processor_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '处理引擎名称',
                                            `start_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '处理开始时间',
                                            `end_time` datetime NULL DEFAULT NULL COMMENT '处理结束时间',
                                            `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'running' COMMENT '处理状态：success, failed, running',
                                            `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '错误信息',
                                            `details` json NULL COMMENT '处理详情',
                                            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                            `ext_info` json NULL COMMENT '扩展字段',
                                            PRIMARY KEY (`id`) USING BTREE,
                                            UNIQUE INDEX `idx_log_id`(`log_id` ASC) USING BTREE,
                                            INDEX `fk_dataset_processing_logs_dataset_id`(`dataset_id` ASC) USING BTREE,
                                            CONSTRAINT `fk_dataset_processing_logs_dataset_id` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`dataset_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '数据集处理记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dataset_processing_logs
-- ----------------------------

-- 6. 数据集表 (datasets)
CREATE TABLE `datasets` (
                            `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                            `dataset_id` VARCHAR(36) NOT NULL COMMENT '数据集业务主键',
                            `owner_id` VARCHAR(36) NOT NULL COMMENT '所属用户业务主键',
                            `title` VARCHAR(255) NOT NULL COMMENT '数据集标题',
                            `description` TEXT DEFAULT NULL COMMENT '数据集描述',
                            `dataset_type` VARCHAR(50) NOT NULL COMMENT '数据集类型',
                            `tags` JSON DEFAULT NULL COMMENT '标签',
                            `status` VARCHAR(32) NOT NULL DEFAULT 'PROCESSING' COMMENT '数据集状态',
                            `parse_progress` INT NOT NULL DEFAULT 0 COMMENT '解析进度百分比',
                            `record_count` INT NOT NULL DEFAULT 0 COMMENT '记录数量',
                            `file_count` INT NOT NULL DEFAULT 0 COMMENT '文件数量',
                            `total_size` BIGINT NOT NULL DEFAULT 0 COMMENT '文件总大小',
                            `error_message` VARCHAR(512) DEFAULT NULL COMMENT '错误信息',
                            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                            PRIMARY KEY (`id`),
                            UNIQUE KEY `idx_datasets_dataset_id` (`dataset_id`),
                            KEY `idx_datasets_owner_id` (`owner_id`),
                            CONSTRAINT `fk_datasets_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据集表';

-- 7. 数据集文件表 (dataset_files)
CREATE TABLE `dataset_files` (
                                 `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                 `file_id` VARCHAR(36) NOT NULL COMMENT '文件业务主键',
                                 `dataset_id` VARCHAR(36) NOT NULL COMMENT '关联数据集业务主键',
                                 `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
                                 `stored_name` VARCHAR(255) NOT NULL COMMENT '存储文件名',
                                 `file_type` VARCHAR(100) DEFAULT NULL COMMENT '文件类型',
                                 `file_size` BIGINT NOT NULL COMMENT '文件大小',
                                 `storage_path` VARCHAR(512) NOT NULL COMMENT '存储路径',
                                 `download_url` VARCHAR(512) DEFAULT NULL COMMENT '下载地址',
                                 `status` VARCHAR(32) NOT NULL DEFAULT 'UPLOADED' COMMENT '处理状态',
                                 `parse_result` TEXT DEFAULT NULL COMMENT '解析结果',
                                 `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                 PRIMARY KEY (`id`),
                                 UNIQUE KEY `idx_dataset_files_file_id` (`file_id`),
                                 KEY `idx_dataset_files_dataset_id` (`dataset_id`),
                                 CONSTRAINT `fk_dataset_files_dataset` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`dataset_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据集文件表';


-- ----------------------------
-- Table structure for event_logs
-- ----------------------------
DROP TABLE IF EXISTS `event_logs`;
CREATE TABLE `event_logs`  (
                               `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                               `event_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                               `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户业务主键，可为空',
                               `event_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '事件类型',
                               `event_details` json NULL COMMENT '事件详细信息',
                               `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'IP地址',
                               `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                               `ext_info` json NULL COMMENT '扩展字段',
                               PRIMARY KEY (`id`) USING BTREE,
                               UNIQUE INDEX `idx_event_id`(`event_id` ASC) USING BTREE,
                               INDEX `fk_event_logs_user_id`(`user_id` ASC) USING BTREE,
                               CONSTRAINT `fk_event_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '事件日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of event_logs
-- ----------------------------

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
                           `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                           `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                           `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户业务主键',
                           `subscription_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '订阅业务主键，可为空',
                           `amount` decimal(10, 2) NOT NULL COMMENT '订单金额',
                           `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'CNY' COMMENT '货币类型',
                           `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '支付方式',
                           `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '支付系统交易ID',
                           `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pending' COMMENT '订单状态：pending, completed, failed',
                           `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                           `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                           `ext_info` json NULL COMMENT '扩展字段',
                           PRIMARY KEY (`id`) USING BTREE,
                           UNIQUE INDEX `idx_order_id`(`order_id` ASC) USING BTREE,
                           INDEX `fk_orders_user_id`(`user_id` ASC) USING BTREE,
                           INDEX `fk_orders_subscription_id`(`subscription_id` ASC) USING BTREE,
                           CONSTRAINT `fk_orders_subscription_id` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`subscription_id`) ON DELETE SET NULL ON UPDATE CASCADE,
                           CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------

-- ----------------------------
-- Table structure for portal_contents
-- ----------------------------
DROP TABLE IF EXISTS `portal_contents`;
CREATE TABLE `portal_contents`  (
                                    `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                    `content_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                    `content_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '内容类型：document, subscription_page, tutorial',
                                    `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标题',
                                    `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'URL友好名称',
                                    `content_markdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Markdown格式内容',
                                    `author_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '作者业务主键',
                                    `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'draft' COMMENT '状态：draft, published, archived',
                                    `published_at` datetime NULL DEFAULT NULL COMMENT '发布时间',
                                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                    `ext_info` json NULL COMMENT '扩展字段',
                                    PRIMARY KEY (`id`) USING BTREE,
                                    UNIQUE INDEX `idx_content_id`(`content_id` ASC) USING BTREE,
                                    UNIQUE INDEX `slug`(`slug` ASC) USING BTREE,
                                    INDEX `fk_portal_contents_author_id`(`author_id` ASC) USING BTREE,
                                    CONSTRAINT `fk_portal_contents_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '门户内容管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of portal_contents
-- ----------------------------

-- ----------------------------
-- Table structure for provider_configs
-- ----------------------------
DROP TABLE IF EXISTS `provider_configs`;
CREATE TABLE `provider_configs`  (
                                     `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                     `config_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                     `provider_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '供应商业务主键',
                                     `config_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置名称',
                                     `api_base_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'API基础URL',
                                     `api_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'API Token，加密存储',
                                     `other_configs` json NULL COMMENT '其他配置参数，如模型列表、默认参数等',
                                     `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active' COMMENT '配置状态：active, inactive',
                                     `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                     `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                     `ext_info` json NULL COMMENT '扩展字段',
                                     PRIMARY KEY (`id`) USING BTREE,
                                     UNIQUE INDEX `idx_config_id`(`config_id` ASC) USING BTREE,
                                     INDEX `fk_provider_configs_provider_id`(`provider_id` ASC) USING BTREE,
                                     CONSTRAINT `fk_provider_configs_provider_id` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`provider_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '供应商配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of provider_configs
-- ----------------------------

-- ----------------------------
-- Table structure for providers
-- ----------------------------
DROP TABLE IF EXISTS `providers`;
CREATE TABLE `providers`  (
                              `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                              `provider_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                              `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '供应商名称',
                              `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '供应商描述',
                              `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active' COMMENT '供应商状态：active, inactive',
                              `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                              `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                              `ext_info` json NULL COMMENT '扩展字段',
                              PRIMARY KEY (`id`) USING BTREE,
                              UNIQUE INDEX `name`(`name` ASC) USING BTREE,
                              UNIQUE INDEX `idx_provider_id`(`provider_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '供应商表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of providers
-- ----------------------------

-- ----------------------------
-- Table structure for subscription_plans
-- ----------------------------
DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans`  (
                                       `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                       `plan_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                       `plan_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '计划名称',
                                       `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '计划描述',
                                       `price` decimal(10, 2) NOT NULL COMMENT '价格',
                                       `duration_days` int NOT NULL COMMENT '订阅时长（天）',
                                       `features` json NULL COMMENT '计划包含的功能和额度',
                                       `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active' COMMENT '计划状态：active, inactive',
                                       `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                       `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                       `ext_info` json NULL COMMENT '扩展字段',
                                       PRIMARY KEY (`id`) USING BTREE,
                                       UNIQUE INDEX `plan_name`(`plan_name` ASC) USING BTREE,
                                       UNIQUE INDEX `idx_plan_id`(`plan_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订阅计划表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of subscription_plans
-- ----------------------------

-- ----------------------------
-- Table structure for user_mcp_configs
-- ----------------------------
DROP TABLE IF EXISTS `user_mcp_configs`;
CREATE TABLE `user_mcp_configs`  (
                                     `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                     `user_mcp_config_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                     `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户业务主键',
                                     `provider_config_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '供应商配置业务主键',
                                     `agent_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '关联的智能体业务主键',
                                     `config_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户自定义配置名称',
                                     `parameters` json NULL COMMENT '模型参数',
                                     `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否为用户默认配置',
                                     `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                     `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                     `ext_info` json NULL COMMENT '扩展字段',
                                     PRIMARY KEY (`id`) USING BTREE,
                                     UNIQUE INDEX `idx_user_mcp_config_id`(`user_mcp_config_id` ASC) USING BTREE,
                                     INDEX `fk_user_mcp_configs_user_id`(`user_id` ASC) USING BTREE,
                                     INDEX `fk_user_mcp_configs_provider_config_id`(`provider_config_id` ASC) USING BTREE,
                                     INDEX `fk_user_mcp_configs_agent_id`(`agent_id` ASC) USING BTREE,
                                     CONSTRAINT `fk_user_mcp_configs_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `agent_configs` (`agent_config_id`) ON DELETE SET NULL ON UPDATE CASCADE,
                                     CONSTRAINT `fk_user_mcp_configs_provider_config_id` FOREIGN KEY (`provider_config_id`) REFERENCES `provider_configs` (`config_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                     CONSTRAINT `fk_user_mcp_configs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户MCP配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_mcp_configs
-- ----------------------------

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles`  (
                               `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                               `role_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                               `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色名称：unlogged, registered, paid, admin',
                               `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '角色描述',
                               `ext_info` json NULL COMMENT '扩展字段',
                               PRIMARY KEY (`id`) USING BTREE,
                               UNIQUE INDEX `role_name`(`role_name` ASC) USING BTREE,
                               UNIQUE INDEX `idx_role_id`(`role_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_roles
-- ----------------------------

-- ----------------------------
-- Table structure for user_subscriptions
-- ----------------------------
DROP TABLE IF EXISTS `user_subscriptions`;
CREATE TABLE `user_subscriptions`  (
                                       `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                       `subscription_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                                       `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户业务主键',
                                       `plan_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '订阅计划业务主键',
                                       `start_date` datetime NOT NULL COMMENT '订阅开始时间',
                                       `end_date` datetime NOT NULL COMMENT '订阅结束时间',
                                       `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active' COMMENT '订阅状态：active, expired, cancelled',
                                       `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                       `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                       `ext_info` json NULL COMMENT '扩展字段',
                                       PRIMARY KEY (`id`) USING BTREE,
                                       UNIQUE INDEX `idx_subscription_id`(`subscription_id` ASC) USING BTREE,
                                       INDEX `fk_user_subscriptions_user_id`(`user_id` ASC) USING BTREE,
                                       INDEX `fk_user_subscriptions_plan_id`(`plan_id` ASC) USING BTREE,
                                       CONSTRAINT `fk_user_subscriptions_plan_id` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`plan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                       CONSTRAINT `fk_user_subscriptions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户订阅表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_subscriptions
-- ----------------------------

-- ----------------------------
-- Table structure for user_user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_user_roles`;
CREATE TABLE `user_user_roles`  (
                                    `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                                    `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户业务主键',
                                    `role_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色业务主键',
                                    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                    `ext_info` json NULL COMMENT '扩展字段',
                                    PRIMARY KEY (`id`) USING BTREE,
                                    UNIQUE INDEX `idx_user_role_unique`(`user_id` ASC, `role_id` ASC) USING BTREE,
                                    INDEX `fk_user_user_roles_user_id`(`user_id` ASC) USING BTREE,
                                    INDEX `fk_user_user_roles_role_id`(`role_id` ASC) USING BTREE,
                                    CONSTRAINT `fk_user_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                    CONSTRAINT `fk_user_user_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户-角色关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_user_roles
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
                          `id` int NOT NULL AUTO_INCREMENT COMMENT '物理主键',
                          `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务主键，UUID',
                          `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户邮箱',
                          `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码哈希值',
                          `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户名',
                          `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '头像URL',
                          `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'active' COMMENT '用户状态：active, inactive, banned',
                          `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                          `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                          `ext_info` json NULL COMMENT '扩展字段',
                          PRIMARY KEY (`id`) USING BTREE,
                          UNIQUE INDEX `email`(`email` ASC) USING BTREE,
                          UNIQUE INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, '991af8e6-b8a9-4c01-9bb9-c7e6c6d9e577', '1127693067@qq.com', '$2a$12$AX4XqjdLekEnMK/rGNls2eElbQ9NHp6HVRup84HVLygYE3pHmEYSq', 'admin', NULL, 'active', '2025-09-14 21:33:46', '2025-09-14 21:33:46', NULL);

SET FOREIGN_KEY_CHECKS = 1;
