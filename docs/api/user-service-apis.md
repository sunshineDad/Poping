# 用户服务层接口设计文档

## 1. 模块概述

用户服务层负责处理用户认证、账户管理、订阅服务等核心用户功能。

### 关联数据库表
- `users` - 用户基础信息表
- `user_roles` - 用户角色表
- `user_user_roles` - 用户角色关联表
- `subscription_plans` - 订阅计划表
- `user_subscriptions` - 用户订阅表
- `orders` - 订单表
- `api_keys` - API密钥表

## 2. 用户认证接口

### 2.1 用户注册

**接口路径**: `POST /api/auth/register`

**请求参数**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "testuser"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| email | String | 是 | 用户邮箱，唯一标识 | user@example.com |
| password | String | 是 | 用户密码，最少8位 | password123 |
| username | String | 否 | 用户名，可为空 | testuser |

**响应结果**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "testuser",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误（邮箱格式错误、密码长度不足等） |
| 409 | 邮箱已存在 |
| 500 | 服务器内部错误 |

### 2.2 用户登录

**接口路径**: `POST /api/auth/login`

**请求参数**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| email | String | 是 | 用户邮箱 | user@example.com |
| password | String | 是 | 用户密码 | password123 |

**响应结果**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "testuser",
      "avatarUrl": null,
      "roles": ["registered"]
    }
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 邮箱或密码错误 |
| 403 | 账户被禁用 |
| 500 | 服务器内部错误 |

### 2.3 刷新Token

**接口路径**: `POST /api/auth/refresh`

**请求参数**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| refreshToken | String | 是 | 刷新令牌 | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |

**响应结果**:
```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 刷新令牌无效或过期 |
| 500 | 服务器内部错误 |

### 2.4 用户登出

**接口路径**: `POST /api/auth/logout`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应结果**:
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

## 3. 账户管理接口

### 3.1 获取用户信息

**接口路径**: `GET /api/user/profile`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "testuser",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": "active",
    "roles": ["registered", "paid"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

### 3.2 更新用户信息

**接口路径**: `PUT /api/user/profile`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:
```json
{
  "username": "newusername",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| username | String | 否 | 用户名 | newusername |
| avatarUrl | String | 否 | 头像URL | https://example.com/new-avatar.jpg |

**响应结果**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "newusername",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "updatedAt": "2024-01-20T16:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

### 3.3 修改密码

**接口路径**: `PUT /api/user/password`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| currentPassword | String | 是 | 当前密码 | oldpassword123 |
| newPassword | String | 是 | 新密码，最少8位 | newpassword456 |

**响应结果**:
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误（密码长度不足等） |
| 401 | 未授权访问或当前密码错误 |
| 500 | 服务器内部错误 |

## 4. 订阅管理接口

### 4.1 获取订阅计划列表

**接口路径**: `GET /api/subscription/plans`

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "planId": "plan-basic-001",
      "planName": "基础版",
      "description": "适合个人用户的基础功能",
      "price": 99.00,
      "durationDays": 30,
      "features": {
        "apiCallsPerMonth": 1000,
        "datasetLimit": 5,
        "agentLimit": 3
      },
      "status": "active"
    },
    {
      "planId": "plan-pro-001",
      "planName": "专业版",
      "description": "适合企业用户的专业功能",
      "price": 299.00,
      "durationDays": 30,
      "features": {
        "apiCallsPerMonth": 10000,
        "datasetLimit": 50,
        "agentLimit": 20
      },
      "status": "active"
    }
  ]
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

### 4.2 获取用户订阅状态

**接口路径**: `GET /api/subscription/status`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "hasActiveSubscription": true,
    "currentSubscription": {
      "subscriptionId": "sub-550e8400-e29b-41d4-a716-446655440000",
      "planId": "plan-pro-001",
      "planName": "专业版",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-02-14T23:59:59Z",
      "status": "active",
      "remainingDays": 15
    },
    "usage": {
      "apiCallsUsed": 2500,
      "apiCallsLimit": 10000,
      "datasetsUsed": 8,
      "datasetsLimit": 50,
      "agentsUsed": 5,
      "agentsLimit": 20
    }
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

### 4.3 创建订阅订单

**接口路径**: `POST /api/subscription/orders`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:
```json
{
  "planId": "plan-pro-001"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| planId | String | 是 | 订阅计划ID | plan-pro-001 |

**响应结果**:
```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderId": "order-550e8400-e29b-41d4-a716-446655440000",
    "planId": "plan-pro-001",
    "planName": "专业版",
    "amount": 299.00,
    "currency": "CNY",
    "status": "pending",
    "paymentUrl": "https://payment.example.com/pay/order-550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-20T16:30:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误（计划不存在等） |
| 401 | 未授权访问 |
| 409 | 用户已有有效订阅 |
| 500 | 服务器内部错误 |

### 4.4 获取订单状态

**接口路径**: `GET /api/subscription/orders/{orderId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | String | 是 | 订单ID | order-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "orderId": "order-550e8400-e29b-41d4-a716-446655440000",
    "planId": "plan-pro-001",
    "planName": "专业版",
    "amount": 299.00,
    "currency": "CNY",
    "paymentMethod": "alipay",
    "transactionId": "2024012016300012345",
    "status": "completed",
    "createdAt": "2024-01-20T16:30:00Z",
    "updatedAt": "2024-01-20T16:35:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 404 | 订单不存在 |
| 403 | 无权限访问该订单 |
| 500 | 服务器内部错误 |

### 4.5 获取订阅历史

**接口路径**: `GET /api/subscription/history`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认10 | 10 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 25,
    "page": 1,
    "size": 10,
    "items": [
      {
        "subscriptionId": "sub-550e8400-e29b-41d4-a716-446655440000",
        "planName": "专业版",
        "startDate": "2024-01-15T00:00:00Z",
        "endDate": "2024-02-14T23:59:59Z",
        "status": "active",
        "orderId": "order-550e8400-e29b-41d4-a716-446655440000",
        "amount": 299.00
      }
    ]
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

## 5. API密钥管理接口

### 5.1 获取API密钥

**接口路径**: `GET /api/user/api-key`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "keyId": "key-550e8400-e29b-41d4-a716-446655440000",
    "keyName": "我的API密钥",
    "keyValue": "pk-1234567890abcdef1234567890abcdef",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastUsedAt": "2024-01-20T15:45:00Z",
    "usageCount": 1250
  }
}
```

**响应结果（无API密钥时）**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": null
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 500 | 服务器内部错误 |

### 5.2 创建或更换API密钥

**接口路径**: `POST /api/user/api-key`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:
```json
{
  "keyName": "我的新API密钥"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| keyName | String | 否 | API密钥名称，默认为"我的API密钥" | 我的新API密钥 |

**响应结果**:
```json
{
  "code": 200,
  "message": "API密钥创建成功",
  "data": {
    "keyId": "key-550e8400-e29b-41d4-a716-446655440000",
    "keyName": "我的新API密钥",
    "keyValue": "pk-abcdef1234567890abcdef1234567890",
    "status": "active",
    "createdAt": "2024-01-20T16:30:00Z",
    "lastUsedAt": null,
    "usageCount": 0
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足（需要付费订阅） |
| 500 | 服务器内部错误 |

**说明**:
- 每个用户只能拥有一个API密钥
- 如果用户已有API密钥，调用此接口将替换现有密钥
- 旧密钥将立即失效，所有使用旧密钥的API调用将返回401错误
- 建议在更换密钥前通知相关应用程序更新配置

### 5.3 获取API调用统计

**接口路径**: `GET /api/user/api-stats`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| days | Integer | 否 | 统计天数，默认30天 | 30 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalCalls": 1250,
    "successCalls": 1180,
    "errorCalls": 70,
    "dailyStats": [
      {
        "date": "2024-01-01",
        "calls": 45,
        "success": 42,
        "errors": 3
      },
      {
        "date": "2024-01-02",
        "calls": 52,
        "success": 50,
        "errors": 2
      }
    ],
    "chartData": {
      "xAxis": ["2024-01-01", "2024-01-02", "2024-01-03"],
      "series": [
        {
          "name": "总调用",
          "data": [45, 52, 38]
        },
        {
          "name": "成功调用",
          "data": [42, 50, 36]
        },
        {
          "name": "失败调用",
          "data": [3, 2, 2]
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
| 500 | 服务器内部错误 |

## 6. 通用响应格式

所有接口均采用统一的响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-20T16:30:00Z"
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 状态码，200表示成功 |
| message | String | 响应消息 |
| data | Object/Array/null | 响应数据 |
| timestamp | String | 响应时间戳 |

## 7. 认证机制

### JWT Token 认证
- 使用 JWT Token 进行用户认证
- Token 有效期为 1 小时
- 提供 Refresh Token 用于刷新访问令牌
- 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer {token}`

### 权限控制
- 基于角色的访问控制（RBAC）
- 角色类型：`unlogged`（未登录）、`registered`（注册用户）、`paid`（付费用户）、`admin`（管理员）
- 不同角色拥有不同的功能权限和使用配额