# MCP工具市场接口设计文档

## 1. 模块概述

MCP工具市场负责MCP工具的查看和配置管理，包括公开MCP工具展示、用户私有MCP工具配置等功能。用户可以通过这些接口查看可用的MCP工具，配置自己的私有MCP工具，以便在智能体配置时选择使用。

### 关联数据库表
- `mcp_tools` - MCP工具表
- `user_mcp_tool_configs` - 用户MCP工具配置表
- `users` - 用户表
- `subscription_plans` - 订阅计划表
- `user_subscriptions` - 用户订阅表

## 2. MCP工具查看接口

### 2.1 获取可用MCP工具列表

**接口路径**: `GET /api/market/mcp-tools`

**请求头**:
```
# 可选认证，用于个性化展示
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (可选)
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| category | String | 否 | 工具分类：search/database/file/api/other | search |
| status | String | 否 | 状态筛选：active/inactive | active |
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认12 | 12 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 18,
    "page": 1,
    "size": 12,
    "categories": [
      {
        "category": "search",
        "name": "搜索工具",
        "count": 6
      },
      {
        "category": "database",
        "name": "数据库工具",
        "count": 4
      },
      {
        "category": "file",
        "name": "文件工具",
        "count": 5
      },
      {
        "category": "api",
        "name": "API工具",
        "count": 3
      }
    ],
    "items": [
      {
        "toolId": "mcp-web-search-001",
        "name": "Web Search",
        "displayName": "网络搜索工具",
        "description": "提供实时网络搜索功能，支持多种搜索引擎",
        "logo": "/images/tools/web-search-logo.png",
        "category": "search",
        "status": "active",
        "isPublic": true,
        "configRequired": false,
        "capabilities": ["实时搜索", "多引擎支持", "结果过滤"],
        "lastUpdated": "2024-01-20T10:00:00Z"
      },
      {
        "toolId": "mcp-database-001",
        "name": "Database Query",
        "displayName": "数据库查询工具",
        "description": "连接和查询各种数据库系统",
        "logo": "/images/tools/database-logo.png",
        "category": "database",
        "status": "active",
        "isPublic": false,
        "configRequired": true,
        "capabilities": ["SQL查询", "多数据库支持", "安全连接"],
        "lastUpdated": "2024-01-19T15:30:00Z"
      }
    ]
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 500 | 服务器内部错误 |

### 2.2 获取MCP工具详情

**接口路径**: `GET /api/market/mcp-tools/{toolId}`

**请求头**:
```
# 可选认证，用于个性化展示
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (可选)
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| toolId | String | 是 | MCP工具ID | mcp-web-search-001 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "toolId": "mcp-web-search-001",
    "name": "Web Search",
    "displayName": "网络搜索工具",
    "description": "提供实时网络搜索功能，支持多种搜索引擎。",
    "longDescription": "网络搜索工具是一个强大的MCP工具，支持多种搜索引擎的实时搜索功能。通过简单的配置，用户可以在智能体中集成网络搜索能力，获取最新的信息和数据。\n\n## 核心功能\n\n- **多引擎支持**: 支持Google、Bing、DuckDuckGo等主流搜索引擎\n- **实时搜索**: 获取最新的网络信息\n- **结果过滤**: 支持按时间、类型、语言等条件过滤搜索结果\n- **安全可靠**: 内置防滥用机制和速率限制",
    "logo": "/images/tools/web-search-logo.png",
    "banner": "/images/tools/web-search-banner.jpg",
    "category": "search",
    "status": "active",
    "isPublic": true,
    "configRequired": false,
    "verified": true,
    "featured": true,
    "rating": 4.7,
    "reviewCount": 850,
    "usageCount": 12500,
    "author": {
      "name": "MCP官方",
      "avatar": "/images/authors/mcp-official.png",
      "verified": true
    },
    "version": "1.2.0",
    "lastUpdated": "2024-01-20T10:00:00Z",
    "capabilities": ["实时搜索", "多引擎支持", "结果过滤", "安全防护"],
    "tags": ["搜索", "网络", "信息获取", "实时"],
    "supportedLanguages": ["中文", "英文", "日文", "韩文"],
    "useCases": [
      {
        "title": "信息查询",
        "description": "快速获取最新的新闻、资讯和知识信息"
      },
      {
        "title": "市场调研",
        "description": "搜索行业动态、竞品信息和市场趋势"
      },
      {
        "title": "学术研究",
        "description": "查找学术论文、研究报告和专业资料"
      }
    ],
    "configSchema": {},
    "documentation": {
      "quickStart": "https://docs.mcp.com/tools/web-search/quick-start",
      "apiReference": "https://docs.mcp.com/tools/web-search/api",
      "examples": "https://docs.mcp.com/tools/web-search/examples"
    },
    "statistics": {
      "totalUsers": 2500,
      "monthlyActiveUsers": 1800,
      "totalCalls": 500000,
      "averageLatency": 650
    }
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 404 | MCP工具不存在 |
| 500 | 服务器内部错误 |

## 3. 用户MCP工具配置接口

### 3.1 获取用户MCP工具配置列表

**接口路径**: `GET /api/market/user-mcp-configs`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| toolId | String | 否 | MCP工具ID筛选 | mcp-database-001 |
| status | String | 否 | 状态筛选：active/inactive | active |
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认10 | 10 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 3,
    "page": 1,
    "size": 10,
    "items": [
      {
        "configId": "config-001",
        "toolId": "mcp-database-001",
        "toolName": "数据库查询工具",
        "configName": "我的MySQL配置",
        "description": "连接生产环境MySQL数据库",
        "status": "active",
        "isDefault": true,
        "config": {
          "host": "prod-mysql.example.com",
          "port": 3306,
          "username": "app_user",
          "password": "****"
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z",
        "lastUsed": "2024-01-22T09:15:00Z",
        "usageCount": 125
      },
      {
        "configId": "config-002",
        "toolId": "mcp-api-client-001",
        "toolName": "API客户端工具",
        "configName": "第三方API配置",
        "description": "调用外部REST API服务",
        "status": "active",
        "isDefault": false,
        "config": {
          "baseUrl": "https://api.example.com",
          "apiKey": "****",
          "timeout": 30000
        },
        "createdAt": "2024-01-18T14:20:00Z",
        "updatedAt": "2024-01-21T11:45:00Z",
        "lastUsed": "2024-01-21T16:30:00Z",
        "usageCount": 45
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

### 3.2 添加用户MCP工具配置

**接口路径**: `POST /api/market/user-mcp-configs`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:
```json
{
  "toolId": "mcp-database-001",
  "configName": "我的MySQL配置",
  "description": "连接生产环境MySQL数据库",
  "config": {
    "host": "prod-mysql.example.com",
    "port": 3306,
    "username": "app_user",
    "password": "secure_password_123"
  },
  "isDefault": false
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| toolId | String | 是 | MCP工具ID | mcp-database-001 |
| configName | String | 是 | 用户自定义配置名称 | 我的MySQL配置 |
| description | String | 否 | 配置描述 | 连接生产环境MySQL数据库 |
| config | Object | 是 | 工具配置信息 | {"host": "localhost", "port": 3306} |
| isDefault | Boolean | 否 | 是否设为默认配置，默认false | false |

**响应结果**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "configId": "config-550e8400-e29b-41d4-a716-446655440000",
    "toolId": "mcp-database-001",
    "toolName": "数据库查询工具",
    "configName": "我的MySQL配置",
    "description": "连接生产环境MySQL数据库",
    "status": "active",
    "isDefault": false,
    "config": {
      "host": "prod-mysql.example.com",
      "port": 3306,
      "username": "app_user",
      "password": "****"
    },
    "createdAt": "2024-01-20T17:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或配置信息无效 |
| 401 | 未授权访问 |
| 404 | MCP工具不存在 |
| 403 | 超出配置数量限制 |
| 500 | 服务器内部错误 |

### 3.3 获取用户MCP工具配置详情

**接口路径**: `GET /api/market/user-mcp-configs/{configId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| configId | String | 是 | 用户MCP工具配置ID | config-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "configId": "config-550e8400-e29b-41d4-a716-446655440000",
    "toolId": "mcp-database-001",
    "toolName": "数据库查询工具",
    "configName": "我的MySQL配置",
    "description": "连接生产环境MySQL数据库",
    "status": "active",
    "isDefault": false,
    "config": {
      "host": "prod-mysql.example.com",
      "port": 3306,
      "username": "app_user",
      "password": "secure_password_123"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z",
    "lastUsed": "2024-01-22T09:15:00Z",
    "usageCount": 125,
    "usageHistory": [
      {
        "date": "2024-01-22",
        "count": 15
      },
      {
        "date": "2024-01-21",
        "count": 23
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
| 404 | 用户MCP工具配置不存在 |
| 403 | 无权限访问该配置 |
| 500 | 服务器内部错误 |

### 3.4 更新用户MCP工具配置

**接口路径**: `PUT /api/market/user-mcp-configs/{configId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| configId | String | 是 | 用户MCP工具配置ID | config-550e8400-e29b-41d4-a716-446655440000 |

**请求参数**:
```json
{
  "configName": "更新的MySQL配置",
  "description": "连接新的生产环境MySQL数据库",
  "config": {
    "host": "new-prod-mysql.example.com",
    "port": 3306,
    "username": "new_app_user",
    "password": "new_secure_password_456"
  },
  "isDefault": true
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| configName | String | 否 | 用户自定义配置名称 | 更新的MySQL配置 |
| description | String | 否 | 配置描述 | 连接新的生产环境MySQL数据库 |
| config | Object | 否 | 工具配置信息 | {"host": "localhost", "port": 3306} |
| isDefault | Boolean | 否 | 是否设为默认配置 | true |

**响应结果**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "configId": "config-550e8400-e29b-41d4-a716-446655440000",
    "toolId": "mcp-database-001",
    "toolName": "数据库查询工具",
    "configName": "更新的MySQL配置",
    "description": "连接新的生产环境MySQL数据库",
    "status": "active",
    "isDefault": true,
    "config": {
      "host": "new-prod-mysql.example.com",
      "port": 3306,
      "username": "new_app_user",
      "password": "****"
    },
    "updatedAt": "2024-01-22T18:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或配置信息无效 |
| 401 | 未授权访问 |
| 404 | 用户MCP工具配置不存在 |
| 403 | 无权限修改该配置 |
| 500 | 服务器内部错误 |

### 3.5 删除用户MCP工具配置

**接口路径**: `DELETE /api/market/user-mcp-configs/{configId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| configId | String | 是 | 用户MCP工具配置ID | config-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "configId": "config-550e8400-e29b-41d4-a716-446655440000",
    "deletedAt": "2024-01-22T19:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权访问 |
| 404 | 用户MCP工具配置不存在 |
| 403 | 无权限删除该配置 |
| 409 | 配置正在使用中，无法删除 |
| 500 | 服务器内部错误 |

### 3.6 测试用户MCP工具配置连接

**接口路径**: `POST /api/market/user-mcp-configs/{configId}/test`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| configId | String | 是 | 用户MCP工具配置ID | config-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "连接测试成功",
  "data": {
    "configId": "config-550e8400-e29b-41d4-a716-446655440000",
    "testResult": {
      "success": true,
      "responseTime": 850,
      "testMessage": "数据库连接正常，权限验证通过"
    },
    "testedAt": "2024-01-22T10:30:00Z"
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "连接测试失败",
  "data": {
    "configId": "config-550e8400-e29b-41d4-a716-446655440000",
    "testResult": {
      "success": false,
      "error": "数据库连接超时",
      "errorCode": "CONNECTION_TIMEOUT",
      "testMessage": "请检查数据库地址和网络连接"
    },
    "testedAt": "2024-01-22T10:30:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 连接测试失败 |
| 401 | 未授权访问 |
| 404 | 用户MCP工具配置不存在 |
| 403 | 无权限测试该配置 |
| 500 | 服务器内部错误 |

## 4. 通用响应格式

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

## 5. 认证与权限

### 认证机制
- 浏览MCP工具信息可匿名访问
- 添加用户配置等操作需要JWT Token认证
- Token通过`Authorization: Bearer {token}`头部传递

### 权限控制
- 用户只能管理自己的MCP工具配置
- 不同订阅等级有不同的配置数量限制

### 限流规则
- 匿名用户：100次/分钟
- 已认证用户：500次/分钟
- 配置测试：每个配置每分钟限制5次