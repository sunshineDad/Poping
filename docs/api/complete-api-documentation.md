# Poping 智能体服务平台 - 完整接口文档

## 文档概述

本文档包含 Poping 智能体服务平台的完整接口设计，涵盖六大服务层的所有接口定义。

### 系统架构

```
用户请求 → 门户展示层 → 用户服务层 → 智能体服务层 ← 数据管理层
                                    ↓
                              市场交易层
                                    ↓
                              系统管理层
```

### 服务层划分

1. **用户服务层** - 用户认证、账户管理、订阅管理
2. **智能体服务层** - Overview管理、模型配置、会话管理
3. **门户展示层** - 文档中心、订阅展示、公告新闻
4. **市场交易层** - MCP市场、供应商管理、用户配置
5. **系统管理层** - 用户管理、供应商管理、系统统计
6. **数据管理层** - 数据集管理、处理记录、数据统计

---

## 数据库表关联说明

### 核心表结构

| 表名 | 用途 | 关联服务层 |
|------|------|------------|
| `users` | 用户基础信息 | 用户服务层、系统管理层 |
| `subscription_plans` | 订阅计划 | 用户服务层、门户展示层、系统管理层 |
| `user_subscriptions` | 用户订阅记录 | 用户服务层、系统管理层 |
| `orders` | 订单记录 | 用户服务层、系统管理层 |
| `api_keys` | API密钥管理 | 用户服务层、智能体服务层 |
| `agent_overviews` | 智能体概览 | 智能体服务层 |
| `agent_instances` | 智能体实例 | 智能体服务层 |
| `mcp_tools` | MCP工具配置 | 智能体服务层、市场交易层 |
| `model_providers` | 模型供应商信息 | 市场交易层、系统管理层 |
| `model_provider_configs` | 模型供应商配置 | 市场交易层 |
| `user_mcp_tool_configs` | 用户MCP工具配置 | 市场交易层 |
| `datasets` | 数据集管理 | 数据管理层 |
| `dataset_processing_records` | 数据处理记录 | 数据管理层 |
| `api_call_logs` | API调用日志 | 系统管理层 |
| `portal_content` | 门户内容 | 门户展示层 |
| `event_logs` | 事件日志 | 系统管理层 |
| `chat_sessions` | 聊天会话 | 智能体服务层 |
| `chat_messages` | 聊天消息 | 智能体服务层 |

### 表关联关系

```
users (1) ←→ (N) user_subscriptions ←→ (1) subscription_plans
users (1) ←→ (N) orders
users (1) ←→ (N) api_keys
users (1) ←→ (N) user_mcp_tool_configs ←→ (1) mcp_tools
users (1) ←→ (N) datasets
users (1) ←→ (N) chat_sessions ←→ (N) chat_messages

model_providers (1) ←→ (N) model_provider_configs
model_providers (1) ←→ (N) mcp_tools

agent_overviews (1) ←→ (N) agent_instances
```

---

## 接口文档索引

### 1. 用户服务层接口

**文档位置**: `docs/api/user-service-apis.md`

**关联数据库表**: `users`, `subscription_plans`, `user_subscriptions`, `orders`, `api_keys` (单个key模式)

**核心功能**:
- 用户认证（登录、注册、密码重置）
- 账户管理（个人信息、单个API密钥管理）
- 订阅管理（订阅、续费、取消）

**主要接口**:
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/user/profile` - 获取用户信息
- `GET /api/user/subscription` - 获取订阅信息
- `POST /api/user/subscribe` - 创建订阅
- `GET /api/user/api-key` - 获取API密钥
- `POST /api/user/api-key/regenerate` - 重新生成API密钥

---

### 2. 智能体服务层接口

**文档位置**: `docs/api/agent-service-apis.md`

**关联数据库表**: `agent_overviews`, `agent_instances`, `mcp_tools`, `user_mcp_tool_configs`, `api_keys`, `chat_sessions`, `chat_messages`, `api_call_logs`

**核心功能**:
- Overview管理（智能体概览配置）
- 智能体实例管理（创建、配置、部署）
- MCP工具配置（工具选择、JSON配置）
- 会话管理（聊天会话、消息记录）
- API调用统计（ECharts兼容格式）

**主要接口**:
- `GET /api/agent/overviews` - 获取智能体概览列表
- `POST /api/agent/overviews` - 创建智能体概览
- `GET /api/agent/instances` - 获取智能体实例列表
- `POST /api/agent/instances` - 创建智能体实例
- `GET /api/mcp/tools/providers` - 获取可用工具供应商列表
- `GET /api/mcp/tools/configs` - 获取用户MCP工具配置列表
- `GET /api/overview/api-statistics` - 获取API调用统计（ECharts格式）
- `GET /api/agent/sessions` - 获取会话列表

---

### 3. 门户展示层接口

**文档位置**: `docs/api/portal-service-apis.md`

**关联数据库表**: `portal_content`, `subscription_plans`, `users`, `suppliers`

**核心功能**:
- 首页内容展示（产品特性、功能介绍）
- 订阅计划展示（计划对比、价格展示）
- 文档中心（文档分类、内容管理）
- 公告和新闻（系统公告、产品更新）

**主要接口**:
- `GET /api/portal/home` - 获取首页内容
- `GET /api/portal/subscription-plans` - 获取订阅计划列表
- `GET /api/portal/docs/categories` - 获取文档分类
- `GET /api/portal/docs` - 获取文档列表
- `GET /api/portal/announcements` - 获取公告列表

---

### 4. 市场交易层接口

**文档位置**: `docs/api/market-service-apis.md`

**关联数据库表**: `model_providers`, `model_provider_configs`, `mcp_tools`, `user_mcp_tool_configs`, `users`, `api_call_logs`

**核心功能**:
- 模型供应商配置（供应商展示、模型浏览）
- 用户供应商配置管理（API-key和URL配置）
- 配置测试和验证（连接测试、配置验证）

**主要接口**:
- `GET /api/market/model-providers` - 获取模型供应商列表
- `GET /api/market/model-providers/{providerId}` - 获取模型供应商详情
- `GET /api/market/user-provider-configs` - 获取用户供应商配置列表
- `POST /api/market/user-provider-configs/test` - 测试用户供应商配置连接

---

### 5. 系统管理层接口

**文档位置**: `docs/api/system-admin-apis.md`

**关联数据库表**: `users`, `model_providers`, `subscription_plans`, `user_subscriptions`, `orders`, `api_call_logs`, `event_logs`, `datasets`, `agent_instances`, `portal_content`

**核心功能**:
- 用户管理（用户列表、状态管理、角色分配）
- 模型供应商管理（供应商审核、配置管理）
- 订阅计划管理（计划创建、价格设置）
- 系统统计（用户统计、API调用统计ECharts格式）
- 系统配置（全局设置、参数配置）

**主要接口**:
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/{id}/status` - 更新用户状态
- `GET /api/admin/model-providers` - 获取模型供应商列表
- `POST /api/admin/model-providers` - 创建模型供应商
- `GET /api/admin/statistics/overview` - 获取系统概览统计
- `GET /api/admin/statistics/api-usage` - 获取API调用统计（ECharts兼容格式）

---

### 6. 数据管理层接口

**文档位置**: `docs/api/data-management-apis.md`

**关联数据库表**: `datasets`, `dataset_processing_records`, `users`

**核心功能**:
- 数据集管理（创建、更新、删除、下载）
- 数据集处理记录（处理状态、重试、取消）
- 数据统计（存储统计、处理统计）

**主要接口**:
- `GET /api/data/datasets` - 获取数据集列表
- `POST /api/data/datasets` - 创建数据集
- `GET /api/data/datasets/{id}` - 获取数据集详情
- `GET /api/data/processing-records` - 获取处理记录列表
- `GET /api/data/stats` - 获取数据统计

---

## 通用规范

### 认证机制

所有接口（除公开接口外）都需要在请求头中携带认证信息：

```http
Authorization: Bearer <JWT_TOKEN>
```

### 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 错误码规范

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 分页规范

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

## 开发指南

### 接口实现优先级

1. **高优先级**: 用户服务层、智能体服务层
2. **中优先级**: 门户展示层、市场交易层
3. **低优先级**: 系统管理层、数据管理层

### 数据库设计原则

- **单一数据库实例** - 无读写分离
- **简单表结构** - 无复杂继承
- **直接关系** - 外键约束，避免连接表
- **性能优先** - 适当冗余，减少复杂查询

### 技术实现要点

- **Spring Boot 2.7** + Java 8 单体架构
- **MyBatis-Plus** 简化CRUD操作
- **Spring Security** 统一认证授权
- **MySQL 8.0** 高性能数据存储
- **Redis** 缓存AI结果和会话数据

---

## 文档维护

本文档应与代码实现保持同步，任何接口变更都需要及时更新相应的文档文件。

**最后更新**: 2024-01-15
**版本**: v1.0.0
**维护者**: 开发团队