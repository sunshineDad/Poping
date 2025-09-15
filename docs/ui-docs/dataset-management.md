# 数据集管理技术规格文档

## 基础信息

### 页面目的

提供数据集的创建、管理、编辑和分享功能，支持多种数据格式的上传、预处理和版本控制。

### URL路由

`/datasets`

### 整体布局结构图

```
┌────────────────────────────────────────────────────────────────┐
│                        [Header]                                │
├────────────────────────────────────────────────────────────────┤
│                    [Filter Bar]                               │
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                             │
│   [Sidebar]      │            [Dataset Grid]                  │
│                  │                                             │
│                  │                                             │
│                  │                                             │
│                  │                                             │
└──────────────────┴─────────────────────────────────────────────┘
```

## 组件详细规格

### Header 页面标题

* **高度**: 64px

* **背景**: #FFFFFF

* **边框**: 底部 1px solid #E5E5E5

* **内边距**: 0 24px

* **布局**: 左右分布 (justify-between)

* **左侧内容**:

  * **标题**:

    * 字体大小: 24px

    * 字体粗细: 600

    * 颜色: #000000

    * 文本: "数据集管理"

  * **副标题**:

    * 字体大小: 14px

    * 颜色: #737373

    * 文本: "数据集创建、管理和版本控制"

    * 上边距: 2px

* **右侧操作区**:

  * **创建数据集按钮**:

    * 宽度: 120px

    * 高度: 36px

    * 背景: #000000

    * 颜色: #FFFFFF

    * 圆角: 6px

    * 字体大小: 14px

    * 字体粗细: 500

    * 图标: 加号，16px

    * 悬停状态: 背景 #333333

    * 左边距: 12px

  * **导入数据集按钮**:

    * 宽度: 100px

    * 高度: 36px

    * 背景: transparent

    * 颜色: #000000

    * 边框: 1px solid #E5E5E5

    * 圆角: 6px

    * 字体大小: 14px

    * 字体粗细: 500

    * 悬停状态: 背景 #F5F5F5

### Filter Bar 筛选栏

* **高度**: 60px

* **背景**: #FAFAFA

* **边框**: 底部 1px solid #E5E5E5

* **内边距**: 16px 24px

* **布局**: 水平排列，间距 16px

#### 搜索框

* **宽度**: 300px

* **高度**: 36px

* **背景**: #FFFFFF

* **边框**: 1px solid #E5E5E5

* **圆角**: 6px

* **内边距**: 0 12px 0 36px

* **字体大小**: 14px

* **占位符**: "搜索数据集名称或描述"

* **搜索图标**: 16px，位置左侧 12px

* **聚焦状态**: 边框 1px solid #000000，阴影 0 0 0 3px rgba(0,0,0,0.1)

#### 类型筛选

* **宽度**: 120px

* **高度**: 36px

* **选项**: 全部、文本、图像、音频、视频、表格

#### 状态筛选

* **宽度**: 100px

* **高度**: 36px

* **选项**: 全部、处理中、就绪、错误

#### 排序选择

* **宽度**: 140px

* **高度**: 36px

* **选项**: 最新创建、最近更新、名称A-Z、大小

### Sidebar 侧边栏

* **宽度**: 240px

* **背景**: #FAFAFA

* **边框**: 右侧 1px solid #E5E5E5

* **内边距**: 24px 16px

#### 统计信息

* **总数据集**:

  * 数值: 字体大小 24px，字体粗细 700，颜色 #000000

  * 标签: 字体大小 12px，颜色 #737373

* **总存储空间**:

  * 格式: "2.5 GB / 10 GB"

  * 进度条: 高度 4px，背景 #E5E5E5，填充 #000000

#### 快速筛选

* **我的数据集**: 显示当前用户创建的数据集

* **共享给我**: 显示其他用户分享的数据集

* **公开数据集**: 显示公开可用的数据集

* **最近使用**: 显示最近访问的数据集

#### 标签云

* **标签样式**:

  * 内边距: 4px 8px

  * 背景: #F3F4F6

  * 圆角: 12px

  * 字体大小: 11px

  * 颜色: #374151

  * 悬停背景: #E5E7EB

### Dataset Grid 数据集网格

* **背景**: #FFFFFF

* **内边距**: 24px

* **网格布局**: 响应式，最小卡片宽度 280px

* **间距**: 20px

#### 数据集卡片

* **宽度**: 280px

* **高度**: 320px

* **背景**: #FFFFFF

* **边框**: 1px solid #E5E5E5

* **圆角**: 8px

* **阴影**: 0 1px 3px rgba(0,0,0,0.1)

* **悬停阴影**: 0 4px 12px rgba(0,0,0,0.15)

* **过渡**: all 200ms ease

##### 卡片头部

* **高度**: 120px

* **背景**: 渐变或纯色，根据数据集类型

* **圆角**: 8px 8px 0 0

* **类型图标**:

  * 尺寸: 48px × 48px

  * 颜色: #FFFFFF

  * 位置: 居中

* **状态指示器**:

  * 位置: 右上角

  * 尺寸: 12px × 12px

  * 就绪: #22C55E

  * 处理中: #F59E0B

  * 错误: #EF4444

##### 卡片内容

* **内边距**: 16px

* **标题**:

  * 字体大小: 16px

  * 字体粗细: 600

  * 颜色: #000000

  * 最大行数: 2

  * 省略号截断

* **描述**:

  * 字体大小: 14px

  * 颜色: #737373

  * 最大行数: 2

  * 行高: 1.4

* **元数据**:

  * **大小**: 字体大小 12px，颜色 #A3A3A3

  * **记录数**: 格式 "1,234 条记录"

  * **更新时间**: 格式 "2天前"

##### 卡片底部

* **高度**: 48px

* **边框**: 顶部 1px solid #F3F4F6

* **内边距**: 12px 16px

* **布局**: 左侧标签，右侧操作按钮

* **标签**:

  * 最多显示2个

  * 样式同侧边栏标签云

* **操作按钮**:

  * **查看按钮**: 尺寸 28px × 28px，图标 眼睛

  * **编辑按钮**: 尺寸 28px × 28px，图标 编辑

  * **更多按钮**: 尺寸 28px × 28px，图标 三点

#### 空状态

* **图标**: 数据集图标，64px × 64px，颜色 #D1D5DB

* **标题**: "暂无数据集"，字体大小 18px，颜色 #6B7280

* **描述**: "创建您的第一个数据集开始使用"，字体大小 14px，颜色 #9CA3AF

* **创建按钮**: 同Header中的创建按钮样式

## 交互逻辑

### 数据集创建

1. **创建流程**:

   * 点击创建按钮打开向导

   * 选择数据集类型

   * 上传数据文件

   * 配置元数据

   * 预览和确认

2. **文件上传**:

   * 拖拽上传支持

   * 多文件批量上传

   * 进度条显示

   * 格式验证

   * 大小限制检查

3. **数据预处理**:

   * 自动格式检测

   * 数据清洗选项

   * 列类型推断

   * 预览前100行

### 数据集管理

1. **查看详情**:

   * 点击卡片或查看按钮

   * 侧边抽屉显示详情

   * 数据预览表格

   * 统计信息图表

2. **编辑操作**:

   * 修改名称和描述

   * 更新标签

   * 调整权限设置

   * 版本管理

3. **删除确认**:

   * 二次确认对话框

   * 显示影响范围

   * 软删除机制

### 搜索和筛选

1. **实时搜索**:

   * 输入延迟 300ms 后触发

   * 搜索名称、描述、标签

   * 高亮匹配关键词

2. **筛选组合**:

   * 多条件AND逻辑

   * 筛选结果计数显示

   * URL状态同步

3. **排序功能**:

   * 点击排序选项立即生效

   * 排序方向指示

   * 记住用户偏好

### 批量操作

1. **多选模式**:

   * 长按或Ctrl+点击进入多选

   * 选中状态视觉反馈

   * 批量操作栏显示

2. **批量操作**:

   * 批量删除

   * 批量标签管理

   * 批量权限设置

   * 批量导出

### 键盘支持

* **Tab**: 在卡片间导航

* **Enter**: 打开选中的数据集

* **Space**: 选择/取消选择

* **方向键**: 在网格中导航

* **Ctrl+A**: 全选

* **Delete**: 删除选中项

## API集成

### 获取数据集列表

#### 端点

```
GET /api/v1/datasets
```

#### 查询参数

```typescript
interface DatasetListQuery {
  page: number;
  limit: number;
  search?: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'table';
  status?: 'processing' | 'ready' | 'error';
  sortBy?: 'created' | 'updated' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
  owner?: 'me' | 'shared' | 'public';
}
```

#### 响应示例

```json
{
  "datasets": [
    {
      "id": "ds_123",
      "name": "客户反馈数据",
      "description": "2024年客户反馈文本数据集",
      "type": "text",
      "status": "ready",
      "size": 1048576,
      "recordCount": 5000,
      "tags": ["客户服务", "文本分析"],
      "owner": {
        "id": "user_456",
        "name": "张三"
      },
      "permissions": {
        "read": true,
        "write": true,
        "share": true
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "lastAccessedAt": "2024-01-16T09:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "stats": {
    "totalDatasets": 156,
    "totalSize": 2684354560,
    "storageQuota": 10737418240
  }
}
```

### 创建数据集

#### 端点

```
POST /api/v1/datasets
```

#### 请求示例

```json
{
  "name": "新数据集",
  "description": "数据集描述",
  "type": "text",
  "tags": ["标签1", "标签2"],
  "isPublic": false,
  "config": {
    "delimiter": ",",
    "encoding": "utf-8",
    "hasHeader": true
  }
}
```

### 上传数据文件

#### 端点

```
┌────────────────────────────────────────────────────────────────┐
│                        [Header]                                │
├────────────────────────────────────────────────────────────────┤
│                    [Filter Bar]                               │
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                             │
│   [Sidebar]      │            [Dataset Grid]                  │
│                  │                                             │
│                  │                                             │
│                  │                                             │
│                  │                                             │
└──────────────────┴─────────────────────────────────────────────┘
```

#### 请求格式

```
Content-Type: multipart/form-data

file: [data file]
chunkIndex?: number
totalChunks?: number
```

### 获取数据集详情

#### 端点

```
GET /api/v1/datasets/:id
```

#### 响应示例

```json
{
  "id": "ds_123",
  "name": "客户反馈数据",
  "description": "详细描述",
  "type": "text",
  "status": "ready",
  "schema": {
    "columns": [
      {
        "name": "feedback",
        "type": "string",
        "nullable": false
      },
      {
        "name": "rating",
        "type": "integer",
        "nullable": true
      }
    ]
  },
  "preview": {
    "rows": [
      {"feedback": "很好的产品", "rating": 5},
      {"feedback": "需要改进", "rating": 3}
    ],
    "totalRows": 5000
  },
  "statistics": {
    "nullCount": 12,
    "uniqueCount": 4988,
    "avgRating": 4.2
  }
}
```

### TypeScript类型定义

```typescript
interface Dataset {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'table';
  status: 'processing' | 'ready' | 'error';
  size: number;
  recordCount: number;
  tags: string[];
  owner: {
    id: string;
    name: string;
  };
  permissions: {
    read: boolean;
    write: boolean;
    share: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

interface DatasetSchema {
  columns: {
    name: string;
    type: string;
    nullable: boolean;
  }[];
}

interface DatasetPreview {
  rows: Record<string, any>[];
  totalRows: number;
}

interface DatasetFilters {
  search: string;
  type: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  tags: string[];
  owner: string;
}

interface DatasetManagementState {
  datasets: Dataset[];
  selectedDatasets: string[];
  filters: DatasetFilters;
  pagination: PaginationInfo;
  stats: {
    totalDatasets: number;
    totalSize: number;
    storageQuota: number;
  };
  isLoading: boolean;
  error: string | null;
}
```

## 响应式设计

### 移动端 (< 768px)

* 侧边栏改为底部抽屉

* 网格改为单列列表

* 筛选栏折叠为下拉菜单

* 卡片高度调整为自适应

### 平板端 (768px - 1024px)

* 侧边栏宽度: 200px

* 网格2-3列布局

* 保持桌面端交互

### 桌面端 (> 1024px)

* 标准布局规格

* 网格3-4列布局

* 侧边栏宽度: 240px

## 无障碍支持

* **语义化HTML**: 使用main、section、article等语义标签

* **ARIA标签**: 为卡片和操作按钮提供标签

* **键盘导航**: 完整的键盘操作支持

* **屏幕阅读器**: 为状态和统计信息提供描述

* **焦点管理**: 操作后正确设置焦点

## 性能要求

* **列表加载时间**: < 1.5秒

* **搜索响应时间**: < 300ms

* **文件上传**: 支持断点续传

* **数据预览**: < 1秒

## 安全措施

* **文件类型验证**: 严格的文件格式检查

* **大小限制**: 防止恶意大文件上传

* **权限控制**: 基于角色的访问控制

* **数据加密**: 敏感数据加密存储



