# 数据管理层接口设计文档

## 1. 模块概述

数据管理层负责用户数据集的管理、处理记录跟踪等功能。用户可以上传原始数据，系统进行处理后生成可用的数据集，并提供完整的处理记录和状态跟踪。

### 关联数据库表
- `datasets` - 数据集表
- `dataset_processing_records` - 数据集处理记录表
- `users` - 用户表（关联用户信息）

## 2. 数据集管理接口

### 2.1 获取数据集列表

**接口路径**: `GET /api/data/datasets`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| keyword | String | 否 | 搜索关键词（数据集名称、描述） | 客户数据 |
| status | String | 否 | 状态筛选：processing/completed/failed/deleted | completed |
| dataType | String | 否 | 数据类型：text/image/audio/video/structured | text |
| sortBy | String | 否 | 排序字段：created_at/updated_at/size/name | created_at |
| sortOrder | String | 否 | 排序顺序：asc/desc，默认desc | desc |
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认20 | 20 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 45,
    "page": 1,
    "size": 20,
    "statistics": {
      "totalDatasets": 45,
      "processingDatasets": 3,
      "completedDatasets": 40,
      "failedDatasets": 2,
      "totalSize": "2.5GB",
      "totalRecords": 125000
    },
    "items": [
      {
        "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440000",
        "name": "客户服务对话数据集",
        "description": "包含客户服务对话记录，用于训练客服机器人",
        "dataType": "text",
        "status": "completed",
        "originalFileName": "customer_service_logs.csv",
        "originalFileSize": 52428800,
        "processedFileSize": 48234567,
        "recordCount": 15420,
        "validRecordCount": 15200,
        "invalidRecordCount": 220,
        "processingProgress": 100,
        "qualityScore": 0.92,
        "tags": ["客服", "对话", "中文"],
        "metadata": {
          "encoding": "UTF-8",
          "columns": ["timestamp", "customer_message", "agent_response", "satisfaction"],
          "language": "zh-CN",
          "avgMessageLength": 45
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T12:30:00Z",
        "completedAt": "2024-01-15T12:30:00Z"
      },
      {
        "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440001",
        "name": "产品评论数据集",
        "description": "电商平台产品评论数据，用于情感分析",
        "dataType": "text",
        "status": "processing",
        "originalFileName": "product_reviews.json",
        "originalFileSize": 104857600,
        "processedFileSize": 0,
        "recordCount": 0,
        "validRecordCount": 0,
        "invalidRecordCount": 0,
        "processingProgress": 35,
        "qualityScore": null,
        "tags": ["评论", "情感分析", "电商"],
        "metadata": {
          "encoding": "UTF-8",
          "estimatedRecords": 25000,
          "language": "zh-CN"
        },
        "createdAt": "2024-01-20T14:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z",
        "completedAt": null
      }
    ]
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 400 | 参数错误 |
| 500 | 服务器内部错误 |

### 2.2 获取数据集详情

**接口路径**: `GET /api/data/datasets/{datasetId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| datasetId | String | 是 | 数据集ID | dataset-550e8400-e29b-41d4-a716-446655440000 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440000",
    "name": "客户服务对话数据集",
    "description": "包含客户服务对话记录，用于训练客服机器人",
    "dataType": "text",
    "status": "completed",
    "originalFileName": "customer_service_logs.csv",
    "originalFileSize": 52428800,
    "originalFilePath": "/uploads/datasets/original/customer_service_logs_20240115.csv",
    "processedFilePath": "/uploads/datasets/processed/dataset-550e8400-e29b-41d4-a716-446655440000.jsonl",
    "processedFileSize": 48234567,
    "recordCount": 15420,
    "validRecordCount": 15200,
    "invalidRecordCount": 220,
    "processingProgress": 100,
    "qualityScore": 0.92,
    "tags": ["客服", "对话", "中文"],
    "metadata": {
      "encoding": "UTF-8",
      "columns": ["timestamp", "customer_message", "agent_response", "satisfaction"],
      "language": "zh-CN",
      "avgMessageLength": 45,
      "dataDistribution": {
        "satisfaction_1": 1520,
        "satisfaction_2": 2280,
        "satisfaction_3": 4560,
        "satisfaction_4": 4560,
        "satisfaction_5": 2280
      },
      "processingConfig": {
        "removeEmptyMessages": true,
        "minMessageLength": 5,
        "maxMessageLength": 500,
        "filterProfanity": true,
        "normalizeText": true
      }
    },
    "sampleData": [
      {
        "timestamp": "2024-01-10T09:15:00Z",
        "customer_message": "我的订单什么时候能到？",
        "agent_response": "您好，请提供您的订单号，我帮您查询物流信息。",
        "satisfaction": 4
      },
      {
        "timestamp": "2024-01-10T09:16:30Z",
        "customer_message": "订单号是202401100001",
        "agent_response": "您的订单已发货，预计明天下午送达，请保持手机畅通。",
        "satisfaction": 5
      }
    ],
    "processingHistory": [
      {
        "recordId": "record-550e8400-e29b-41d4-a716-446655440010",
        "step": "upload",
        "status": "completed",
        "message": "文件上传成功",
        "startTime": "2024-01-15T10:00:00Z",
        "endTime": "2024-01-15T10:02:00Z",
        "duration": 120
      },
      {
        "recordId": "record-550e8400-e29b-41d4-a716-446655440011",
        "step": "validation",
        "status": "completed",
        "message": "数据格式验证通过",
        "startTime": "2024-01-15T10:02:00Z",
        "endTime": "2024-01-15T10:05:00Z",
        "duration": 180
      },
      {
        "recordId": "record-550e8400-e29b-41d4-a716-446655440012",
        "step": "cleaning",
        "status": "completed",
        "message": "数据清洗完成，移除220条无效记录",
        "startTime": "2024-01-15T10:05:00Z",
        "endTime": "2024-01-15T12:00:00Z",
        "duration": 6900
      },
      {
        "recordId": "record-550e8400-e29b-41d4-a716-446655440013",
        "step": "quality_check",
        "status": "completed",
        "message": "质量评估完成，得分0.92",
        "startTime": "2024-01-15T12:00:00Z",
        "endTime": "2024-01-15T12:30:00Z",
        "duration": 1800
      }
    ],
    "usageStatistics": {
      "downloadCount": 15,
      "lastDownloadAt": "2024-01-20T14:30:00Z",
      "apiCallCount": 125,
      "lastApiCallAt": "2024-01-20T16:45:00Z"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T12:30:00Z",
    "completedAt": "2024-01-15T12:30:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 404 | 数据集不存在 |
| 403 | 无权限访问该数据集 |
| 500 | 服务器内部错误 |

### 2.3 创建数据集

**接口路径**: `POST /api/data/datasets`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| file | File | 是 | 数据文件 | customer_data.csv |
| name | String | 是 | 数据集名称 | 客户行为数据集 |
| description | String | 否 | 数据集描述 | 用于分析客户购买行为的数据集 |
| dataType | String | 是 | 数据类型：text/image/audio/video/structured | text |
| tags | String | 否 | 标签，逗号分隔 | 客户,行为,分析 |
| processingConfig | String | 否 | 处理配置JSON字符串 | {"removeEmptyRows":true} |

**响应结果**:
```json
{
  "code": 200,
  "message": "数据集创建成功，正在处理中",
  "data": {
    "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440002",
    "name": "客户行为数据集",
    "status": "processing",
    "originalFileName": "customer_data.csv",
    "originalFileSize": 10485760,
    "estimatedProcessingTime": 300,
    "createdAt": "2024-01-20T18:00:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误或文件格式不支持 |
| 401 | 未授权访问 |
| 413 | 文件大小超出限制 |
| 429 | 创建频率超出限制 |
| 500 | 服务器内部错误 |

### 2.4 更新数据集信息

**接口路径**: `PUT /api/data/datasets/{datasetId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| datasetId | String | 是 | 数据集ID | dataset-550e8400-e29b-41d4-a716-446655440000 |

**请求参数**:
```json
{
  "name": "客户服务对话数据集v2",
  "description": "更新后的客户服务对话记录，包含更多场景",
  "tags": ["客服", "对话", "中文", "多场景"]
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| name | String | 否 | 数据集名称 | 客户服务对话数据集v2 |
| description | String | 否 | 数据集描述 | 更新后的客户服务对话记录... |
| tags | Array | 否 | 标签列表 | ["客服", "对话", "中文"] |

**响应结果**:
```json
{
  "code": 200,
  "message": "数据集信息更新成功",
  "data": {
    "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440000",
    "updatedFields": ["name", "description", "tags"],
    "updatedAt": "2024-01-20T18:30:00Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权访问 |
| 403 | 无权限修改该数据集 |
| 404 | 数据集不存在 |
| 409 | 数据集正在处理中，无法修改 |
| 500 | 服务器内部错误 |

### 2.5 删除数据集

**接口路径**: `DELETE /api/data/datasets/{datasetId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| datasetId | String | 是 | 数据集ID | dataset-550e8400-e29b-41d4-a716-446655440000 |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| deleteFiles | Boolean | 否 | 是否删除关联文件，默认true | true |

**响应结果**:
```json
{
  "code": 200,
  "message": "数据集删除成功",
  "data": {
    "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440000",
    "deletedAt": "2024-01-20T19:00:00Z",
    "filesDeleted": true,
    "freedSpace": 48234567
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 403 | 无权限删除该数据集 |
| 404 | 数据集不存在 |
| 409 | 数据集正在使用中，无法删除 |
| 500 | 服务器内部错误 |

### 2.6 下载数据集

**接口路径**: `GET /api/data/datasets/{datasetId}/download`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| datasetId | String | 是 | 数据集ID | dataset-550e8400-e29b-41d4-a716-446655440000 |

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| format | String | 否 | 下载格式：original/processed，默认processed | processed |
| compress | Boolean | 否 | 是否压缩，默认false | false |

**响应结果**:
- 成功时返回文件流
- Content-Type: application/octet-stream
- Content-Disposition: attachment; filename="dataset-name.jsonl"

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 403 | 无权限下载该数据集 |
| 404 | 数据集不存在或文件不存在 |
| 409 | 数据集尚未处理完成 |
| 500 | 服务器内部错误 |

## 3. 数据集处理记录接口

### 3.1 获取处理记录列表

**接口路径**: `GET /api/data/processing-records`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| datasetId | String | 否 | 数据集ID筛选 | dataset-550e8400-e29b-41d4-a716-446655440000 |
| step | String | 否 | 处理步骤筛选：upload/validation/cleaning/quality_check | cleaning |
| status | String | 否 | 状态筛选：pending/running/completed/failed | completed |
| startDate | String | 否 | 开始日期筛选 | 2024-01-01 |
| endDate | String | 否 | 结束日期筛选 | 2024-01-20 |
| sortBy | String | 否 | 排序字段：start_time/end_time/duration | start_time |
| sortOrder | String | 否 | 排序顺序：asc/desc，默认desc | desc |
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页数量，默认20 | 20 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 156,
    "page": 1,
    "size": 20,
    "statistics": {
      "totalRecords": 156,
      "completedRecords": 140,
      "failedRecords": 8,
      "runningRecords": 6,
      "pendingRecords": 2,
      "averageProcessingTime": 1850
    },
    "items": [
      {
        "recordId": "record-550e8400-e29b-41d4-a716-446655440020",
        "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440002",
        "datasetName": "客户行为数据集",
        "step": "cleaning",
        "status": "running",
        "message": "正在清洗数据，已完成65%",
        "progress": 65,
        "startTime": "2024-01-20T18:05:00Z",
        "endTime": null,
        "duration": null,
        "inputRecords": 25000,
        "outputRecords": null,
        "errorCount": 0,
        "metadata": {
          "processedRows": 16250,
          "removedRows": 1250,
          "currentOperation": "removing_duplicates"
        }
      },
      {
        "recordId": "record-550e8400-e29b-41d4-a716-446655440019",
        "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440001",
        "datasetName": "产品评论数据集",
        "step": "validation",
        "status": "completed",
        "message": "数据格式验证通过",
        "progress": 100,
        "startTime": "2024-01-20T14:02:00Z",
        "endTime": "2024-01-20T14:05:00Z",
        "duration": 180,
        "inputRecords": 25000,
        "outputRecords": 24850,
        "errorCount": 150,
        "metadata": {
          "validationRules": ["required_fields", "data_types", "value_ranges"],
          "passedRules": 3,
          "failedRecords": 150
        }
      }
    ]
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 400 | 参数错误 |
| 500 | 服务器内部错误 |

### 3.2 获取处理记录详情

**接口路径**: `GET /api/data/processing-records/{recordId}`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| recordId | String | 是 | 处理记录ID | record-550e8400-e29b-41d4-a716-446655440020 |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "recordId": "record-550e8400-e29b-41d4-a716-446655440020",
    "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440002",
    "datasetName": "客户行为数据集",
    "step": "cleaning",
    "status": "running",
    "message": "正在清洗数据，已完成65%",
    "progress": 65,
    "startTime": "2024-01-20T18:05:00Z",
    "endTime": null,
    "duration": null,
    "inputRecords": 25000,
    "outputRecords": null,
    "errorCount": 0,
    "metadata": {
      "processedRows": 16250,
      "removedRows": 1250,
      "currentOperation": "removing_duplicates",
      "operationHistory": [
        {
          "operation": "validate_format",
          "startTime": "2024-01-20T18:05:00Z",
          "endTime": "2024-01-20T18:06:30Z",
          "duration": 90,
          "status": "completed",
          "recordsProcessed": 25000,
          "recordsRemoved": 0
        },
        {
          "operation": "remove_empty_rows",
          "startTime": "2024-01-20T18:06:30Z",
          "endTime": "2024-01-20T18:08:00Z",
          "duration": 90,
          "status": "completed",
          "recordsProcessed": 25000,
          "recordsRemoved": 500
        },
        {
          "operation": "removing_duplicates",
          "startTime": "2024-01-20T18:08:00Z",
          "endTime": null,
          "duration": null,
          "status": "running",
          "recordsProcessed": 16250,
          "recordsRemoved": 750
        }
      ],
      "configuration": {
        "removeEmptyRows": true,
        "removeDuplicates": true,
        "normalizeText": true,
        "filterOutliers": false
      },
      "resourceUsage": {
        "cpuUsage": 45.2,
        "memoryUsage": 512000000,
        "diskIO": 15.6
      }
    },
    "logs": [
      {
        "timestamp": "2024-01-20T18:05:00Z",
        "level": "INFO",
        "message": "开始数据清洗处理"
      },
      {
        "timestamp": "2024-01-20T18:06:30Z",
        "level": "INFO",
        "message": "格式验证完成，所有记录格式正确"
      },
      {
        "timestamp": "2024-01-20T18:08:00Z",
        "level": "INFO",
        "message": "移除空行完成，删除500条记录"
      },
      {
        "timestamp": "2024-01-20T18:15:30Z",
        "level": "INFO",
        "message": "去重处理进行中，已处理16250条记录"
      }
    ],
    "createdAt": "2024-01-20T18:05:00Z",
    "updatedAt": "2024-01-20T18:15:30Z"
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 404 | 处理记录不存在 |
| 403 | 无权限访问该处理记录 |
| 500 | 服务器内部错误 |

### 3.3 重试失败的处理记录

**接口路径**: `POST /api/data/processing-records/{recordId}/retry`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| recordId | String | 是 | 处理记录ID | record-550e8400-e29b-41d4-a716-446655440021 |

**请求参数**:
```json
{
  "resetConfiguration": false,
  "newConfiguration": {
    "timeout": 7200,
    "retryCount": 3
  }
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| resetConfiguration | Boolean | 否 | 是否重置配置，默认false | false |
| newConfiguration | Object | 否 | 新的处理配置 | {"timeout": 7200} |

**响应结果**:
```json
{
  "code": 200,
  "message": "处理记录重试成功",
  "data": {
    "recordId": "record-550e8400-e29b-41d4-a716-446655440021",
    "newRecordId": "record-550e8400-e29b-41d4-a716-446655440022",
    "status": "pending",
    "estimatedStartTime": "2024-01-20T19:30:00Z",
    "retryCount": 1
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 记录状态不允许重试 |
| 401 | 未授权访问 |
| 403 | 无权限操作该处理记录 |
| 404 | 处理记录不存在 |
| 429 | 重试次数超出限制 |
| 500 | 服务器内部错误 |

### 3.4 取消正在运行的处理记录

**接口路径**: `POST /api/data/processing-records/{recordId}/cancel`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| recordId | String | 是 | 处理记录ID | record-550e8400-e29b-41d4-a716-446655440020 |

**请求参数**:
```json
{
  "reason": "用户主动取消",
  "force": false
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| reason | String | 否 | 取消原因 | 用户主动取消 |
| force | Boolean | 否 | 是否强制取消，默认false | false |

**响应结果**:
```json
{
  "code": 200,
  "message": "处理记录取消成功",
  "data": {
    "recordId": "record-550e8400-e29b-41d4-a716-446655440020",
    "status": "cancelled",
    "cancelledAt": "2024-01-20T19:00:00Z",
    "reason": "用户主动取消",
    "partialResults": {
      "processedRecords": 16250,
      "completedOperations": ["validate_format", "remove_empty_rows"]
    }
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 400 | 记录状态不允许取消 |
| 401 | 未授权访问 |
| 403 | 无权限操作该处理记录 |
| 404 | 处理记录不存在 |
| 500 | 服务器内部错误 |

## 4. 数据统计接口

### 4.1 获取数据集统计信息

**接口路径**: `GET /api/data/statistics`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| period | String | 否 | 统计周期：7d/30d/90d/1y，默认30d | 30d |
| dataType | String | 否 | 数据类型筛选：text/image/audio/video/structured | text |

**响应结果**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "period": "30d",
    "generatedAt": "2024-01-20T20:00:00Z",
    "overview": {
      "totalDatasets": 45,
      "completedDatasets": 40,
      "processingDatasets": 3,
      "failedDatasets": 2,
      "totalSize": "2.5GB",
      "totalRecords": 125000,
      "averageQualityScore": 0.89
    },
    "dataTypeDistribution": [
      {
        "dataType": "text",
        "count": 30,
        "percentage": 0.67,
        "totalSize": "1.8GB",
        "totalRecords": 95000
      },
      {
        "dataType": "structured",
        "count": 10,
        "percentage": 0.22,
        "totalSize": "0.5GB",
        "totalRecords": 25000
      },
      {
        "dataType": "image",
        "count": 5,
        "percentage": 0.11,
        "totalSize": "0.2GB",
        "totalRecords": 5000
      }
    ],
    "processingStatistics": {
      "totalProcessingTime": 125400,
      "averageProcessingTime": 2786,
      "successRate": 0.93,
      "mostCommonFailures": [
        {
          "reason": "invalid_format",
          "count": 8,
          "percentage": 0.4
        },
        {
          "reason": "timeout",
          "count": 6,
          "percentage": 0.3
        }
      ]
    },
    "usageStatistics": {
      "totalDownloads": 450,
      "totalApiCalls": 12500,
      "mostPopularDatasets": [
        {
          "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440000",
          "name": "客户服务对话数据集",
          "downloadCount": 85,
          "apiCallCount": 2500
        },
        {
          "datasetId": "dataset-550e8400-e29b-41d4-a716-446655440003",
          "name": "产品描述数据集",
          "downloadCount": 72,
          "apiCallCount": 1800
        }
      ]
    },
    "trends": {
      "datasetCreation": [
        {
          "date": "2024-01-01",
          "count": 2,
          "totalSize": 104857600
        },
        {
          "date": "2024-01-02",
          "count": 1,
          "totalSize": 52428800
        }
      ],
      "processingVolume": [
        {
          "date": "2024-01-01",
          "recordsProcessed": 15000,
          "processingTime": 3600
        },
        {
          "date": "2024-01-02",
          "recordsProcessed": 12000,
          "processingTime": 2800
        }
      ]
    }
  }
}
```

**错误码**:
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权访问 |
| 400 | 参数错误 |
| 500 | 服务器内部错误 |

## 5. 通用响应格式

所有接口均采用统一的响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-20T20:30:00Z"
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 状态码，200表示成功 |
| message | String | 响应消息 |
| data | Object/Array/null | 响应数据 |
| timestamp | String | 响应时间戳 |

## 6. 认证与权限

### 认证机制
- 所有接口都需要JWT Token认证
- Token通过`Authorization: Bearer {token}`头部传递
- Token中包含用户ID和权限信息

### 权限控制
- 用户只能访问自己创建的数据集
- 管理员可以访问所有数据集
- 数据集的删除需要额外的权限验证

### 限流规则
- 普通用户：100次/分钟
- 高级用户：500次/分钟
- 文件上传：5次/分钟
- 下载操作：20次/分钟

### 文件限制
- 单个文件最大：100MB
- 支持格式：CSV, JSON, JSONL, TXT, XLSX
- 用户总存储限制：根据订阅计划确定