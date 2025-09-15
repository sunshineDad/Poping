# 系统管理层接口设计文档

## 1. 模块概述

系统管理层负责平台的后台管理功能，包括用户管理、供应商管理、订阅计划管理、系统配置、数据统计等。这些接口仅供管理员使用，需要最高级别的权限验证。

### 关联数据库表
- `users` - 用户表
- `user_roles` - 用户角色表
- `user_role_assignments` - 用户角色关联表
- `subscription_plans` - 订阅计划表
- `user_subscriptions` - 用户订阅表
- `orders` - 订单表
- `providers` - 供应商表
- `provider_configs` - 供应商配置表
- `api_call_logs` - API调用日志表
- `event_logs` - 事件日志表

## 2. 用户管理接口

### 2.1 获取用户列表

**接口路径**: `GET /api/admin/users`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| keyword | String | 否 | 搜索关键词（用户名、邮箱、手机号） | 张三 |
| status | String | 否 | 用户状态：active/inactive/suspended | active |
| role | String | 否 | 角色筛选：user/premium_user/admin | user |
| registrationDate | String | 否 | 注册日期范围：7d/30d/90d/custom | 30d |
| subscriptionStatus | String | 否 | 订阅状态：subscribed/expired/none | subscribed |
| sortBy | String | 否 | 排序字段：created_at/last_login/usage_count | created_at |
| sortOrder | String | 否 | 排序顺序：asc/desc，默认desc | desc |
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认20 | 20 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 1250,
    "page": 1,
    "size": 20,
    "statistics": {
      "totalUsers": 1250,
      "activeUsers": 1100,
      "suspendedUsers": 15,
      "newUsersThisMonth": 85,
      "subscribedUsers": 320
    },
    "items": [
      {
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "username": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "avatar": "/images/avatars/user001.jpg",
        "status": "active",
        "roles": [
          {
            "roleId": "role-002",
            "roleName": "premium_user",
            "displayName": "高级用户"
          }
        ],
        "subscription": {
          "planId": "plan-pro-001",
          "planName": "专业版",
          "status": "active",
          "expiresAt": "2024-12-31T23:59:59Z"
        },
        "statistics": {
          "totalApiCalls": 15420,
          "totalSpent": 156.78,
          "lastLoginAt": "2024-01-20T15:30:00Z",
          "loginCount": 89
        },
        "createdAt": "2023-08-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z"
      }
    ]
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 400 | 参数错误 |
| 500 | 服务器内部错误 |

### 2.2 获取用户详情

**接口路径**: `GET /api/admin/users/{userId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| userId | String | 是 | 用户ID | 550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "avatar": "/images/avatars/user001.jpg",
    "realName": "张三",
    "company": "科技有限公司",
    "status": "active",
    "emailVerified": true,
    "phoneVerified": true,
    "roles": [
      {
        "roleId": "role-002",
        "roleName": "premium_user",
        "displayName": "高级用户",
        "assignedAt": "2023-10-15T10:00:00Z"
      }
    ],
    "subscription": {
      "userSubscriptionId": "sub-550e8400-e29b-41d4-a716-446655440001",
      "planId": "plan-pro-001",
      "planName": "专业版",
      "status": "active",
      "startDate": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-12-31T23:59:59Z",
      "autoRenew": true,
      "paymentMethod": "credit_card"
    },
    "apiKeys": [
      {
        "apiKeyId": "key-550e8400-e29b-41d4-a716-446655440002",
        "keyName": "生产环境密钥",
        "keyPrefix": "pk_live_****",
        "status": "active",
        "lastUsedAt": "2024-01-20T15:30:00Z",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "mcpConfigs": [
      {
        "userMcpConfigId": "mcp-550e8400-e29b-41d4-a716-446655440003",
        "configName": "我的GPT-4配置",
        "provider": "OpenAI",
        "model": "gpt-4",
        "isDefault": true,
        "usageCount": 125,
        "lastUsedAt": "2024-01-20T16:30:00Z"
      }
    ],
    "statistics": {
      "totalApiCalls": 15420,
      "successfulCalls": 15200,
      "failedCalls": 220,
      "totalTokensUsed": 2450000,
      "totalSpent": 156.78,
      "averageCallsPerDay": 85,
      "lastLoginAt": "2024-01-20T15:30:00Z",
      "loginCount": 89,
      "deviceCount": 3
    },
    "recentActivity": [
      {
        "activityType": "api_call",
        "description": "调用GPT-4模型",
        "timestamp": "2024-01-20T16:30:00Z",
        "metadata": {
          "provider": "OpenAI",
          "model": "gpt-4",
          "tokens": 1250
        }
      },
      {
        "activityType": "login",
        "description": "用户登录",
        "timestamp": "2024-01-20T15:30:00Z",
        "metadata": {
          "ip": "192.168.1.100",
          "device": "Chrome/Windows"
        }
      }
    ],
    "createdAt": "2023-08-15T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

### 2.3 更新用户状态

**接口路径**: `PUT /api/admin/users/{userId}/status`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| userId | String | 是 | 用户ID | 550e8400-e29b-41d4-a716-446655440000 |

**请求参数**:
```json
{
  "status": "suspended",
  "reason": "违反使用条款",
  "suspensionDuration": 30,
  "notifyUser": true
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| status | String | 是 | 新状态：active/suspended/inactive | suspended |
| reason | String | 否 | 状态变更原因 | 违反使用条款 |
| suspensionDuration | Integer | 否 | 暂停天数（仅status为suspended时） | 30 |
| notifyUser | Boolean | 否 | 是否通知用户，默认true | true |

**响应结果**:
```json
{
  "code": 200,
  "message": "用户状态更新成功",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "oldStatus": "active",
    "newStatus": "suspended",
    "reason": "违反使用条款",
    "suspensionUntil": "2024-02-19T23:59:59Z",
    "updatedAt": "2024-01-20T18:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或状态转换无效 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

### 2.4 分配用户角色

**接口路径**: `POST /api/admin/users/{userId}/roles`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| userId | String | 是 | 用户ID | 550e8400-e29b-41d4-a716-446655440000 |

**请求参数**:
```json
{
  "roleIds": ["role-002", "role-003"],
  "replaceExisting": true,
  "reason": "升级为高级用户"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| roleIds | Array | 是 | 角色ID列表 | ["role-002", "role-003"] |
| replaceExisting | Boolean | 否 | 是否替换现有角色，默认false | true |
| reason | String | 否 | 分配原因 | 升级为高级用户 |

**响应结果**:
```json
{
  "code": 200,
  "message": "角色分配成功",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "assignedRoles": [
      {
        "roleId": "role-002",
        "roleName": "premium_user",
        "displayName": "高级用户",
        "assignedAt": "2024-01-20T18:00:00Z"
      },
      {
        "roleId": "role-003",
        "roleName": "beta_tester",
        "displayName": "测试用户",
        "assignedAt": "2024-01-20T18:00:00Z"
      }
    ],
    "removedRoles": [
      {
        "roleId": "role-001",
        "roleName": "user",
        "displayName": "普通用户"
      }
    ]
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或角色不存在 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

## 3. 供应商管理接口

### 3.1 获取供应商列表

**接口路径**: `GET /api/admin/providers`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: admin
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| keyword | String | 否 | 搜索关键词（供应商名称、描述） | OpenAI |
| status | String | 否 | 状态筛选：active/inactive/pending | active |
| category | String | 否 | 分类筛选：llm/embedding/image/audio | llm |
| featured | Boolean | 否 | 是否推荐供应商 | true |
| sortBy | String | 否 | 排序字段：created_at/updated_at/usage_count | created_at |
| sortOrder | String | 否 | 排序顺序：asc/desc，默认desc | desc |
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认20 | 20 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 25,
    "page": 1,
    "size": 20,
    "statistics": {
      "totalProviders": 25,
      "activeProviders": 20,
      "pendingProviders": 3,
      "inactiveProviders": 2
    },
    "items": [
      {
        "providerId": "provider-openai-001",
        "name": "OpenAI",
        "displayName": "OpenAI",
        "description": "领先的AI研究公司，提供GPT系列大语言模型",
        "logo": "/images/providers/openai-logo.png",
        "website": "https://openai.com",
        "category": "llm",
        "status": "active",
        "featured": true,
        "configCount": 8,
        "userCount": 1250,
        "totalApiCalls": 5000000,
        "revenue": 125000.50,
        "rating": 4.8,
        "reviewCount": 1250,
        "lastUpdated": "2024-01-20T10:00:00Z",
        "createdAt": "2023-06-15T00:00:00Z"
      }
    ]
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 400 | 参数错误 |
| 500 | 服务器内部错误 |

### 3.2 创建供应商

**接口路径**: `POST /api/admin/providers`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**请求参数**:
```json
{
  "name": "Anthropic",
  "displayName": "Anthropic",
  "description": "专注于AI安全的公司，提供Claude系列模型",
  "longDescription": "Anthropic是一家专注于AI安全研究的公司...",
  "logo": "/images/providers/anthropic-logo.png",
  "banner": "/images/providers/anthropic-banner.jpg",
  "website": "https://anthropic.com",
  "category": "llm",
  "status": "active",
  "featured": true,
  "contact": {
    "email": "support@anthropic.com",
    "documentation": "https://docs.anthropic.com"
  },
  "features": ["长上下文支持", "安全可靠", "逻辑推理"],
  "tags": ["Claude", "长文本", "安全", "分析"],
  "supportedLanguages": ["中文", "英文"]
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 是 | 供应商名称（唯一） | Anthropic |
| displayName | String | 是 | 显示名称 | Anthropic |
| description | String | 是 | 简短描述 | 专注于AI安全的公司... |
| longDescription | String | 否 | 详细描述 | Anthropic是一家专注于... |
| logo | String | 是 | Logo图片路径 | /images/providers/anthropic-logo.png |
| banner | String | 否 | 横幅图片路径 | /images/providers/anthropic-banner.jpg |
| website | String | 否 | 官方网站 | https://anthropic.com |
| category | String | 是 | 分类：llm/embedding/image/audio | llm |
| status | String | 否 | 状态，默认pending | active |
| featured | Boolean | 否 | 是否推荐，默认false | true |
| contact | Object | 否 | 联系信息 | {"email": "support@anthropic.com"} |
| features | Array | 否 | 特性列表 | ["长上下文支持", "安全可靠"] |
| tags | Array | 否 | 标签列表 | ["Claude", "长文本"] |
| supportedLanguages | Array | 否 | 支持语言 | ["中文", "英文"] |

**响应结果**:
```json
{
  "code": 200,
  "message": "供应商创建成功",
  "data": {
    "providerId": "provider-anthropic-001",
    "name": "Anthropic",
    "displayName": "Anthropic",
    "status": "active",
    "createdAt": "2024-01-20T18:30:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或供应商名称已存在 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 500 | 服务器内部错误 |

### 3.3 更新供应商信息

**接口路径**: `PUT /api/admin/providers/{providerId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: admin
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| providerId | String | 是 | 供应商ID | provider-anthropic-001 |

**请求参数**:
```json
{
  "displayName": "Anthropic AI",
  "description": "专注于AI安全的领先公司，提供Claude系列先进模型",
  "featured": false,
  "status": "active"
}
```

**响应结果**:
```json
{
  "code": 200,
  "message": "供应商信息更新成功",
  "data": {
    "providerId": "provider-anthropic-001",
    "updatedFields": ["displayName", "description", "featured"],
    "updatedAt": "2024-01-20T19:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 供应商不存在 |
| 500 | 服务器内部错误 |

### 3.4 删除供应商

**接口路径**: `DELETE /api/admin/providers/{providerId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| providerId | String | 是 | 供应商ID | provider-anthropic-001 |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| force | Boolean | 否 | 是否强制删除（即使有关联数据），默认false | false |

**响应结果**:
```json
{
  "code": 200,
  "message": "供应商删除成功",
  "data": {
    "providerId": "provider-anthropic-001",
    "deletedAt": "2024-01-20T19:30:00Z",
    "affectedConfigs": 5,
    "affectedUsers": 120
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 供应商有关联数据，无法删除 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 供应商不存在 |
| 409 | 供应商正在使用中，无法删除 |
| 500 | 服务器内部错误 |

## 4. 订阅计划管理接口

### 4.1 获取订阅计划列表

**接口路径**: `GET /api/admin/subscription-plans`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: admin
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| status | String | 否 | 状态筛选：active/inactive/draft | active |
| sortBy | String | 否 | 排序字段：price/created_at/subscriber_count | price |
| sortOrder | String | 否 | 排序顺序：asc/desc，默认asc | asc |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 4,
    "statistics": {
      "totalPlans": 4,
      "activePlans": 3,
      "totalSubscribers": 1250,
      "monthlyRevenue": 45600.00
    },
    "items": [
      {
        "planId": "plan-free-001",
        "name": "免费版",
        "description": "适合个人用户和小型项目",
        "price": 0.00,
        "currency": "CNY",
        "billingCycle": "monthly",
        "status": "active",
        "features": {
          "apiCallsPerMonth": 1000,
          "maxApiKeys": 1,
          "maxMcpConfigs": 3,
          "supportLevel": "community",
          "customModels": false
        },
        "subscriberCount": 850,
        "revenue": 0.00,
        "conversionRate": 0.15,
        "createdAt": "2023-06-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      },
      {
        "planId": "plan-pro-001",
        "name": "专业版",
        "description": "适合中小企业和专业开发者",
        "price": 99.00,
        "currency": "CNY",
        "billingCycle": "monthly",
        "status": "active",
        "features": {
          "apiCallsPerMonth": 50000,
          "maxApiKeys": 5,
          "maxMcpConfigs": 20,
          "supportLevel": "email",
          "customModels": true
        },
        "subscriberCount": 320,
        "revenue": 31680.00,
        "conversionRate": 0.08,
        "createdAt": "2023-06-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 500 | 服务器内部错误 |

### 4.2 创建订阅计划

**接口路径**: `POST /api/admin/subscription-plans`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**请求参数**:
```json
{
  "name": "企业版",
  "description": "适合大型企业和高频使用场景",
  "price": 299.00,
  "currency": "CNY",
  "billingCycle": "monthly",
  "status": "active",
  "features": {
    "apiCallsPerMonth": 200000,
    "maxApiKeys": 20,
    "maxMcpConfigs": 100,
    "supportLevel": "priority",
    "customModels": true,
    "dedicatedSupport": true,
    "sla": "99.9%"
  },
  "displayOrder": 3
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 是 | 计划名称 | 企业版 |
| description | String | 是 | 计划描述 | 适合大型企业... |
| price | Decimal | 是 | 价格 | 299.00 |
| currency | String | 是 | 货币代码 | CNY |
| billingCycle | String | 是 | 计费周期：monthly/yearly | monthly |
| status | String | 否 | 状态，默认draft | active |
| features | Object | 是 | 功能特性配置 | {"apiCallsPerMonth": 200000} |
| displayOrder | Integer | 否 | 显示顺序 | 3 |

**响应结果**:
```json
{
  "code": 200,
  "message": "订阅计划创建成功",
  "data": {
    "planId": "plan-enterprise-001",
    "name": "企业版",
    "price": 299.00,
    "status": "active",
    "createdAt": "2024-01-20T20:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或计划名称已存在 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 500 | 服务器内部错误 |

## 5. 系统统计接口

### 5.1 获取系统概览统计

**接口路径**: `GET /api/admin/statistics/overview`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: admin
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| period | String | 否 | 统计周期：7d/30d/90d/1y，默认30d | 30d |
| timezone | String | 否 | 时区，默认Asia/Shanghai | Asia/Shanghai |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "period": "30d",
    "generatedAt": "2024-01-20T20:30:00Z",
    "users": {
      "total": 1250,
      "active": 1100,
      "new": 85,
      "growth": 0.073,
      "retention": 0.88
    },
    "subscriptions": {
      "total": 320,
      "active": 315,
      "new": 25,
      "churned": 8,
      "revenue": 45600.00,
      "mrr": 45600.00,
      "arr": 547200.00
    },
    "apiUsage": {
      "totalCalls": 5000000,
      "successfulCalls": 4950000,
      "failedCalls": 50000,
      "averageLatency": 850,
      "totalTokens": 750000000,
      "topProviders": [
        {
          "providerId": "provider-openai-001",
          "name": "OpenAI",
          "calls": 3000000,
          "percentage": 0.6
        },
        {
          "providerId": "provider-anthropic-001",
          "name": "Anthropic",
          "calls": 1500000,
          "percentage": 0.3
        }
      ]
    },
    "providers": {
      "total": 25,
      "active": 20,
      "new": 2
    },
    "system": {
      "uptime": "99.95%",
      "errorRate": "0.05%",
      "averageResponseTime": 120,
      "storageUsed": "2.5TB",
      "bandwidthUsed": "15.2TB"
    },
    "trends": {
      "userGrowth": [
        {
          "date": "2024-01-01",
          "newUsers": 12,
          "totalUsers": 1165
        },
        {
          "date": "2024-01-02",
          "newUsers": 8,
          "totalUsers": 1173
        }
      ],
      "revenueGrowth": [
        {
          "date": "2024-01-01",
          "revenue": 1520.00,
          "totalRevenue": 43080.00
        },
        {
          "date": "2024-01-02",
          "revenue": 1680.00,
          "totalRevenue": 44760.00
        }
      ],
      "apiUsageGrowth": [
        {
          "date": "2024-01-01",
          "calls": 165000,
          "tokens": 24750000
        },
        {
          "date": "2024-01-02",
          "calls": 172000,
          "tokens": 25800000
        }
      ]
    }
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 500 | 服务器内部错误 |

### 5.2 获取API调用统计

**接口路径**: `GET /api/admin/statistics/api-usage`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: admin
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| startDate | String | 否 | 开始日期，默认30天前 | 2024-01-01 |
| endDate | String | 否 | 结束日期，默认今天 | 2024-01-20 |
| providerId | String | 否 | 供应商ID筛选 | provider-openai-001 |
| groupBy | String | 否 | 分组方式：hour/day/week/month，默认day | day |
| metrics | String | 否 | 指标类型：calls/tokens/latency/errors，默认calls | calls |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-20",
      "groupBy": "day"
    },
    "summary": {
      "totalCalls": 5000000,
      "successfulCalls": 4950000,
      "failedCalls": 50000,
      "successRate": 0.99,
      "averageLatency": 850,
      "totalTokens": 750000000,
      "totalCost": 15750.00
    },
    "chartData": {
      "xAxis": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"],
      "series": [
        {
          "name": "API调用量",
          "type": "line",
          "data": [165000, 172000, 158000, 180000, 175000]
        },
        {
          "name": "成功调用",
          "type": "line",
          "data": [163350, 170280, 156420, 178200, 173250]
        },
        {
          "name": "失败调用",
          "type": "line",
          "data": [1650, 1720, 1580, 1800, 1750]
        }
      ]
    },
    "timeSeries": [
      {
        "date": "2024-01-01",
        "calls": 165000,
        "successfulCalls": 163350,
        "failedCalls": 1650,
        "averageLatency": 820,
        "tokens": 24750000,
        "cost": 525.00
      },
      {
        "date": "2024-01-02",
        "calls": 172000,
        "successfulCalls": 170280,
        "failedCalls": 1720,
        "averageLatency": 835,
        "tokens": 25800000,
        "cost": 548.00
      }
    ],
    "providerBreakdown": [
      {
        "providerId": "provider-openai-001",
        "name": "OpenAI",
        "calls": 3000000,
        "percentage": 0.6,
        "cost": 9450.00,
        "averageLatency": 820
      },
      {
        "providerId": "provider-anthropic-001",
        "name": "Anthropic",
        "calls": 1500000,
        "percentage": 0.3,
        "cost": 4725.00,
        "averageLatency": 890
      }
    ],
    "topUsers": [
      {
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "username": "张三",
        "calls": 125000,
        "tokens": 18750000,
        "cost": 393.75
      }
    ],
    "errorAnalysis": {
      "totalErrors": 50000,
      "errorTypes": [
        {
          "type": "rate_limit",
          "count": 25000,
          "percentage": 0.5
        },
        {
          "type": "timeout",
          "count": 15000,
          "percentage": 0.3
        },
        {
          "type": "invalid_request",
          "count": 10000,
          "percentage": 0.2
        }
      ]
    }
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或日期范围无效 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 500 | 服务器内部错误 |

## 6. 系统配置接口

### 6.1 获取系统配置

**接口路径**: `GET /api/admin/system/config`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| category | String | 否 | 配置分类：security/limits/features/billing | security |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "security": {
      "jwtExpirationTime": 86400,
      "maxLoginAttempts": 5,
      "passwordMinLength": 8,
      "requireEmailVerification": true,
      "enableTwoFactor": false
    },
    "limits": {
      "maxApiKeysPerUser": 10,
      "maxMcpConfigsPerUser": 50,
      "rateLimitPerMinute": 1000,
      "maxRequestSize": 10485760,
      "maxResponseSize": 52428800
    },
    "features": {
      "enableUserRegistration": true,
      "enableProviderReviews": true,
      "enableApiKeyRotation": true,
      "enableUsageAnalytics": true,
      "maintenanceMode": false
    },
    "billing": {
      "defaultCurrency": "CNY",
      "taxRate": 0.13,
      "invoicePrefix": "INV",
      "paymentMethods": ["alipay", "wechat", "credit_card"]
    },
    "notifications": {
      "emailEnabled": true,
      "smsEnabled": false,
      "webhookEnabled": true,
      "adminAlerts": {
        "systemErrors": true,
        "highUsage": true,
        "securityEvents": true
      }
    }
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 500 | 服务器内部错误 |

### 6.2 更新系统配置

**接口路径**: `PUT /api/admin/system/config`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

**请求参数**:
```json
{
  "security": {
    "maxLoginAttempts": 3,
    "enableTwoFactor": true
  },
  "limits": {
    "rateLimitPerMinute": 1500
  },
  "features": {
    "maintenanceMode": true
  }
}
```

**响应结果**:
```json
{
  "code": 200,
  "message": "系统配置更新成功",
  "data": {
    "updatedCategories": ["security", "limits", "features"],
    "updatedFields": [
      "security.maxLoginAttempts",
      "security.enableTwoFactor",
      "limits.rateLimitPerMinute",
      "features.maintenanceMode"
    ],
    "updatedAt": "2024-01-20T21:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或配置值无效 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 500 | 服务器内部错误 |

## 7. 通用响应格式

所有接口均采用统一的响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-20T21:30:00Z"
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 状态码，200表示成功 |
| message | String | 响应消息 |
| data | Object/Array/null | 响应数据 |
| timestamp | String | 响应时间戳 |

## 8. 认证与权限

### 认证机制
- 所有管理接口都需要JWT Token认证
- Token通过`Authorization: Bearer {token}`头部传递
- 需要额外的`X-Admin-Role`头部标识管理员角色

### 权限等级
- `admin`: 普通管理员，可访问大部分管理功能
- `super_admin`: 超级管理员，可访问所有管理功能
- 不同接口需要不同的权限等级

### 操作审计
- 所有管理操作都会记录到`event_logs`表
- 包含操作者、操作类型、操作对象、操作时间等信息
- 敏感操作（如删除、状态变更）会发送通知给其他管理员

### 限流规则
- 管理员用户：1000次/分钟
- 超级管理员：2000次/分钟
- 批量操作接口有额外的限制