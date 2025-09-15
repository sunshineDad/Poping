# 智能体服务层接口设计文档

## 1. 模块概述

智能体服务层是平台的核心业务模块，负责智能体配置管理、会话管理、AI对话交互等核心功能。本模块作为业务层，调用外部AIGents API提供AI能力。

### 关联数据库表
- `agent_configs` - 智能体配置表
- `api_keys` - API Key表
- `user_mcp_tool_configs` - 用户MCP工具配置表
- `api_call_logs` - API调用日志表
- `chat_sessions` - 会话表（本地业务会话）
- `chat_messages` - 消息表（本地业务消息）

### 数据模型

#### AgentConfig 智能体配置
```json
{
  "agent_config_id": "string",
  "user_id": "string", 
  "name": "string",
  "description": "string",
  "session_config": {
    "features": {
      "memories": true,
      "events": true,
      "docs": true,
      "texts": true,
      "images": true,
      "retrieval": false
    },
    "custom_mcp_servers": {},
    "system": {
      "system_prompt": "string"
    }
  },
  "dataset_id": "string",
  "status": "active|inactive",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### ChatSession 会话
```json
{
  "session_id": "string",
  "external_session_id": "string",
  "user_id": "string",
  "agent_config_id": "string",
  "title": "string",
  "status": "active|archived|deleted",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### ChatMessage 消息
```json
{
  "message_id": "string",
  "session_id": "string",
  "role": "user|assistant|system",
  "content": "string",
  "metadata": {},
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 核心设计理念

每个智能体配置对应外部API的一个session配置。智能体不再是"实例"概念，而是一套可复用的配置模板，包括：
- MCP工具配置
- 数据集配置  
- 记忆功能配置
- 系统提示词配置

## 2. Overview管理接口

### 2.1 获取用户概览信息

**接口路径**: `GET /api/overview/dashboard`

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
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "testuser",
      "subscriptionPlan": "专业版",
      "subscriptionStatus": "active"
    },
    "statistics": {
      "totalApiCalls": 2500,
      "monthlyApiCalls": 850,
      "totalAgentConfigs": 5,
      "activeAgentConfigs": 3,
      "totalDatasets": 8,
      "totalSessions": 125
    },
    "usage": {
      "apiCallsUsed": 2500,
      "apiCallsLimit": 10000,
      "agentConfigsUsed": 5,
      "agentConfigsLimit": 20,
      "datasetsUsed": 8,
      "datasetsLimit": 50
    },
    "recentActivity": [
      {
        "type": "api_call",
        "description": "AI对话调用成功",
        "timestamp": "2024-01-20T16:30:00Z",
        "agentConfigName": "客服助手配置"
      },
      {
        "type": "agent_config_created",
        "description": "创建新智能体配置",
        "timestamp": "2024-01-20T15:45:00Z",
        "agentConfigName": "数据分析师配置"
      }
    ]
  }
}
```

### 2.2 获取API Key列表

**接口路径**: `GET /api/overview/api-keys`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "apiKeyId": "ak-550e8400-e29b-41d4-a716-446655440000",
      "name": "生产环境密钥",
      "apiKeySecret": "sk-proj-abc123...xyz789",
      "permissions": {
        "allowedEndpoints": ["chat", "agents"],
        "rateLimit": 1000
      },
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-07-15T10:30:00Z",
      "lastUsedAt": "2024-01-20T16:25:00Z"
    }
  ]
}
```

## 3. 智能体配置管理接口

### 3.1 获取智能体配置列表

**接口路径**: `GET /api/agent-configs`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认10 | 10 |
| status | String | 否 | 状态筛选：active/inactive | active |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 5,
    "page": 1,
    "size": 10,
    "items": [
      {
        "agentConfigId": "config-550e8400-e29b-41d4-a716-446655440000",
        "name": "客服助手配置",
        "description": "专业的客户服务智能体配置",
        "status": "active",
        "sessionConfig": {
          "features": {
            "memories": true,
            "events": true,
            "docs": true,
            "texts": true,
            "images": true,
            "retrieval": false
          },
          "custom_mcp_servers": {
            "file_system": {
              "command": "python",
              "args": ["/path/to/file_server.py"]
            }
          },
          "system": {
            "system_prompt": "你是一个专业的客服助手"
          }
        },
        "dataset": {
          "datasetId": "dataset-001",
          "name": "客服知识库"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T15:45:00Z"
      }
    ]
  }
}
```

### 3.2 创建智能体配置

**接口路径**: `POST /api/agent-configs`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:
```json
{
  "name": "数据分析师配置",
  "description": "专业的数据分析智能体配置",
  "sessionConfig": {
    "features": {
      "memories": true,
      "events": true,
      "docs": true,
      "texts": true,
      "images": false,
      "retrieval": true
    },
    "custom_mcp_servers": {
      "data_analysis": {
        "command": "python",
        "args": ["/path/to/analysis_server.py"]
      }
    },
    "system": {
      "system_prompt": "你是一个专业的数据分析师"
    }
  },
  "datasetId": "dataset-002"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 是 | 智能体配置名称 | 数据分析师配置 |
| description | String | 否 | 智能体配置描述 | 专业的数据分析智能体配置 |
| sessionConfig | Object | 是 | 会话配置，对应外部API的session配置 | 见上方示例 |
| datasetId | String | 否 | 数据集ID | dataset-002 |

**响应结果**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "agentConfigId": "config-660f9511-f3ac-52e5-b827-557766551111",
    "name": "数据分析师配置",
    "description": "专业的数据分析智能体配置",
    "status": "active",
    "sessionConfig": {
      "features": {
        "memories": true,
        "events": true,
        "docs": true,
        "texts": true,
        "images": false,
        "retrieval": true
      },
      "custom_mcp_servers": {
        "data_analysis": {
          "command": "python",
          "args": ["/path/to/analysis_server.py"]
        }
      },
      "system": {
        "system_prompt": "你是一个专业的数据分析师"
      }
    },
    "dataset": {
      "datasetId": "dataset-002",
      "name": "销售数据集"
    },
    "createdAt": "2024-01-20T17:00:00Z"
  }
}
```

### 3.3 获取智能体配置详情

**接口路径**: `GET /api/agent-configs/{agentConfigId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| agentConfigId | String | 是 | 智能体配置ID | config-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "agentConfigId": "config-550e8400-e29b-41d4-a716-446655440000",
    "name": "客服助手配置",
    "description": "专业的客户服务智能体配置",
    "status": "active",
    "sessionConfig": {
      "features": {
        "memories": true,
        "events": true,
        "docs": true,
        "texts": true,
        "images": true,
        "retrieval": false
      },
      "custom_mcp_servers": {
        "file_system": {
          "command": "python",
          "args": ["/path/to/file_server.py"]
        }
      },
      "system": {
        "system_prompt": "你是一个专业的客服助手"
      }
    },
    "dataset": {
      "datasetId": "dataset-001",
      "name": "客服知识库",
      "status": "processed",
      "size": "2.5MB"
    },
    "statistics": {
      "totalSessions": 45,
      "totalMessages": 890,
      "avgResponseTime": 1200,
      "lastUsedAt": "2024-01-20T16:30:00Z"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}
```

### 3.4 更新智能体配置

**接口路径**: `PUT /api/agent-configs/{agentConfigId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| agentConfigId | String | 是 | 智能体配置ID | config-550e8400-e29b-41d4-a716-446655440000 |

**请求参数**:
```json
{
  "name": "高级客服助手配置",
  "description": "升级版的客户服务智能体配置",
  "sessionConfig": {
    "features": {
      "memories": true,
      "events": true,
      "docs": true,
      "texts": true,
      "images": true,
      "retrieval": true
    },
    "system": {
      "system_prompt": "你是一个高级客服助手，具备深度学习能力"
    }
  },
  "datasetId": "dataset-003",
  "status": "active"
}
```

### 3.5 删除智能体配置

**接口路径**: `DELETE /api/agent-configs/{agentConfigId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| agentConfigId | String | 是 | 智能体配置ID | config-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

## 4. Playground接口

### 4.1 创建AI会话

**接口路径**: `POST /api/playground/sessions`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:
```json
{
  "agentConfigId": "config-550e8400-e29b-41d4-a716-446655440000",
  "title": "客服咨询测试"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| agentConfigId | String | 是 | 智能体配置ID | config-550e8400-e29b-41d4-a716-446655440000 |
| title | String | 否 | 会话标题 | 客服咨询测试 |

**响应结果**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "sessionId": "session-660f9511-f3ac-52e5-b827-557766551111",
    "externalSessionId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "客服咨询测试",
    "agentConfigId": "config-550e8400-e29b-41d4-a716-446655440000",
    "agentConfigName": "客服助手配置",
    "status": "active",
    "createdAt": "2024-01-20T18:00:00Z"
  }
}
```

### 4.2 发送消息（SSE流式响应）

**接口路径**: `POST /api/playground/sessions/{sessionId}/messages`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: text/event-stream
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| sessionId | String | 是 | 会话ID | session-660f9511-f3ac-52e5-b827-557766551111 |

**请求参数**:
```json
{
  "message": "你好，我想咨询产品相关问题",
  "context": {
    "additional_info": "用户是VIP客户"
  }
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| message | String | 是 | 用户消息内容 | 你好，我想咨询产品相关问题 |
| context | Object | 否 | 额外上下文信息 | {"additional_info": "用户是VIP客户"} |

**SSE响应流**:
```
data: {"type": "start", "data": {"query_id": "query123"}, "timestamp": "2024-01-20T18:00:00Z"}

data: {"type": "message", "data": {"content": "您好！我是客服助手，很高兴为您服务..."}, "timestamp": "2024-01-20T18:00:01Z"}

data: {"type": "tool_use", "data": {"tool": "search_knowledge", "args": {"query": "产品相关问题"}}, "timestamp": "2024-01-20T18:00:02Z"}

data: {"type": "result", "data": {"content": "根据您的问题，我为您找到了相关信息..."}, "timestamp": "2024-01-20T18:00:05Z"}

data: {"type": "complete", "data": {}, "timestamp": "2024-01-20T18:00:06Z"}
```

### 4.3 获取会话消息历史

**接口路径**: `GET /api/playground/sessions/{sessionId}/messages`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| sessionId | String | 是 | 会话ID | session-660f9511-f3ac-52e5-b827-557766551111 |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认20 | 20 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 15,
    "page": 1,
    "size": 20,
    "items": [
      {
        "messageId": "msg-001",
        "role": "user",
        "content": "你好，我想咨询产品相关问题",
        "timestamp": "2024-01-20T18:00:00Z"
      },
      {
        "messageId": "msg-002",
        "role": "assistant",
        "content": "您好！我是客服助手，很高兴为您服务...",
        "timestamp": "2024-01-20T18:00:05Z"
      }
    ]
  }
}
```

### 4.4 中断AI处理

**接口路径**: `POST /api/playground/sessions/{sessionId}/interrupt`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| sessionId | String | 是 | 会话ID | session-660f9511-f3ac-52e5-b827-557766551111 |

**响应结果**:
```json
{
  "code": 200,
  "message": "中断成功",
  "data": null
}
```

## 5. 会话管理接口

### 5.1 获取会话列表

**接口路径**: `GET /api/sessions`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| agentConfigId | String | 否 | 智能体配置ID筛选 | config-550e8400-e29b-41d4-a716-446655440000 |
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
        "sessionId": "session-550e8400-e29b-41d4-a716-446655440000",
        "externalSessionId": "ext-550e8400-e29b-41d4-a716-446655440000",
        "title": "客服咨询-产品问题",
        "agentConfigId": "config-550e8400-e29b-41d4-a716-446655440000",
        "agentConfigName": "客服助手配置",
        "status": "active",
        "messageCount": 15,
        "lastMessageAt": "2024-01-20T16:30:00Z",
        "createdAt": "2024-01-20T15:00:00Z"
      }
    ]
  }
}
```

### 5.2 获取会话详情

**接口路径**: `GET /api/sessions/{sessionId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| sessionId | String | 是 | 会话ID | session-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "sessionId": "session-550e8400-e29b-41d4-a716-446655440000",
    "externalSessionId": "ext-550e8400-e29b-41d4-a716-446655440000",
    "title": "客服咨询-产品问题",
    "agentConfigId": "config-550e8400-e29b-41d4-a716-446655440000",
    "agentConfigName": "客服助手配置",
    "status": "active",
    "createdAt": "2024-01-20T15:00:00Z",
    "updatedAt": "2024-01-20T16:30:00Z"
  }
}
```

### 5.3 删除会话

**接口路径**: `DELETE /api/sessions/{sessionId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| sessionId | String | 是 | 会话ID | session-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

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

## 7. 认证与权限

### 认证机制
- 所有接口都需要JWT Token认证
- Token通过`Authorization: Bearer {token}`头部传递

### 权限控制
- 用户只能访问自己创建的智能体配置、会话等资源
- 不同订阅等级有不同的资源配额限制
- 管理员拥有所有资源的访问权限

## 8. 外部API集成

### 8.1 AIGents API调用流程

1. **创建会话时**：调用外部API `POST /api/sessions`，传入智能体配置的sessionConfig
2. **发送消息时**：调用外部API `POST /api/sessions/{external_session_id}/query`，进行流式对话
3. **中断处理时**：调用外部API `POST /api/sessions/{external_session_id}/interrupt`
4. **删除会话时**：调用外部API `DELETE /api/sessions/{external_session_id}`

### 8.2 错误处理

- 外部API调用失败时，返回统一错误格式
- 超时处理：设置30秒超时时间
- 重试机制：关键操作支持3次重试

### 8.3 数据同步

- 本地会话状态与外部session状态保持同步
- 消息记录同时保存在本地数据库和外部API
- 定期同步外部session的统计数据