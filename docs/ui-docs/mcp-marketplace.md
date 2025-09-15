# MCP市场技术规格文档

## 基础信息

### 页面目的
提供MCP（Model Context Protocol）组件的浏览、搜索、安装和管理功能，用户可以发现和使用各种AI模型扩展组件。

### URL路由
`/marketplace`

### 整体布局结构图

```
┌────────────────────────────────────────────────────────────────┐
│                        [Header]                                │
├────────────────────────────────────────────────────────────────┤
│                    [Search Bar]                               │
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                             │
│   [Category]     │            [Component Grid]                │
│   [Sidebar]      │                                             │
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
    * 文本: "MCP市场"
  * **副标题**:
    * 字体大小: 14px
    * 颜色: #737373
    * 文本: "发现和安装AI模型扩展组件"
    * 上边距: 2px

* **右侧操作区**:
  * **我的组件按钮**:
    * 宽度: 100px
    * 高度: 36px
    * 背景: transparent
    * 颜色: #000000
    * 边框: 1px solid #E5E5E5
    * 圆角: 6px
    * 字体大小: 14px
    * 字体粗细: 500
    * 悬停状态: 背景 #F5F5F5

### Search Bar 搜索栏

* **高度**: 80px
* **背景**: #FAFAFA
* **边框**: 底部 1px solid #E5E5E5
* **内边距**: 20px 24px

#### 搜索输入框
* **宽度**: 600px
* **高度**: 48px
* **背景**: #FFFFFF
* **边框**: 1px solid #E5E5E5
* **圆角**: 24px
* **内边距**: 0 20px 0 48px
* **字体大小**: 16px
* **占位符**: "搜索MCP组件..."
* **搜索图标**: 20px，位置左侧 16px，颜色 #737373
* **聚焦状态**:
  * 边框: 1px solid #000000
  * 阴影: 0 0 0 3px rgba(0,0,0,0.1)
* **过渡动画**: 150ms ease

#### 快速筛选标签
* **位置**: 搜索框下方，上边距 12px
* **标签样式**:
  * 内边距: 6px 12px
  * 背景: #FFFFFF
  * 边框: 1px solid #E5E5E5
  * 圆角: 16px
  * 字体大小: 12px
  * 字体粗细: 500
  * 颜色: #737373
  * 间距: 8px
  * 过渡动画: 150ms ease
* **悬停状态**:
  * 背景: #F5F5F5
  * 边框: 1px solid #D4D4D4
* **激活状态**:
  * 背景: #000000
  * 颜色: #FFFFFF
  * 边框: 1px solid #000000
* **标签选项**: 全部、工具类、数据处理、API集成、AI模型、最新、热门

### Category Sidebar 分类侧边栏

* **宽度**: 240px
* **背景**: #FAFAFA
* **边框**: 右侧 1px solid #E5E5E5
* **内边距**: 24px 16px

#### 分类列表
* **分类项高度**: 40px
* **内边距**: 0 12px
* **字体大小**: 14px
* **字体粗细**: 500
* **默认状态**:
  * 颜色: #737373
  * 背景: transparent
* **激活状态**:
  * 颜色: #000000
  * 背景: #FFFFFF
  * 左边框: 3px solid #000000
  * 圆角: 0 6px 6px 0
  * 阴影: 0 1px 3px rgba(0,0,0,0.1)
* **悬停状态**:
  * 颜色: #000000
  * 背景: #F5F5F5
* **过渡动画**: 150ms ease

#### 分类结构
1. **工具类** (12)
   - 文件处理
   - 数据转换
   - 系统集成
2. **数据处理** (8)
   - 数据清洗
   - 格式转换
   - 统计分析
3. **API集成** (15)
   - 第三方服务
   - 数据库连接
   - 云服务
4. **AI模型** (6)
   - 语言模型
   - 图像识别
   - 语音处理

#### 筛选器
* **评分筛选**:
  * 星级选择器
  * 4星及以上、3星及以上等
  * 复选框样式: 16px × 16px
  * 选中状态: 背景 #000000，对勾 #FFFFFF
* **价格筛选**:
  * 免费
  * 付费
  * 订阅制
  * 单选按钮样式: 16px × 16px，圆形
* **更新时间**:
  * 最近一周
  * 最近一月
  * 最近三月
  * 下拉选择器样式

### Component Grid 组件网格

- **背景**: #FFFFFF
- **内边距**: 24px
- **网格布局**: 3列，间距 20px
- **响应式**: 最小卡片宽度 300px

#### 组件卡片
- **宽度**: 300px
- **高度**: 380px
- **背景**: #FFFFFF
- **边框**: 1px solid #E5E5E5
- **圆角**: 12px
- **阴影**: 0 2px 8px rgba(0,0,0,0.1)
- **悬停阴影**: 0 8px 24px rgba(0,0,0,0.15)
- **过渡**: all 300ms ease

##### 卡片头部
- **高度**: 120px
- **背景**: 线性渐变，根据组件类型
- **圆角**: 12px 12px 0 0
- **组件图标**:
  - 尺寸: 64px × 64px
  - 背景: #FFFFFF
  - 圆角: 12px
  - 位置: 居中
  - 阴影: 0 2px 8px rgba(0,0,0,0.1)

##### 卡片内容
- **内边距**: 20px
- **组件名称**:
  - 字体大小: 18px
  - 字体粗细: 600
  - 颜色: #000000
  - 最大行数: 1
  - 省略号截断
- **开发者**:
  - 字体大小: 12px
  - 颜色: #737373
  - 上边距: 4px
- **描述**:
  - 字体大小: 14px
  - 颜色: #737373
  - 行高: 1.4
  - 最大行数: 2
  - 上边距: 8px
- **标签**:
  - 最多显示3个
  - 内边距: 2px 6px
  - 背景: #F3F4F6
  - 圆角: 8px
  - 字体大小: 10px
  - 颜色: #6B7280
  - 上边距: 12px

##### 卡片底部
- **高度**: 60px
- **边框**: 顶部 1px solid #F3F4F6
- **内边距**: 16px 20px
- **布局**: 左侧信息，右侧按钮

###### 左侧信息
- **评分**:
  - 星级图标: 12px，颜色 #FCD34D
  - 评分数值: 字体大小 12px，颜色 #000000
  - 评价数量: 字体大小 10px，颜色 #737373
- **下载量**:
  - 字体大小: 10px
  - 颜色: #737373
  - 格式: "1.2k 下载"
- **价格**:
  - 免费: 字体大小 12px，颜色 #22C55E，文本 "免费"
  - 付费: 字体大小 12px，颜色 #000000，格式 "¥29"

###### 右侧按钮
- **安装按钮**:
  - 宽度: 80px
  - 高度: 32px
  - 背景: #000000
  - 颜色: #FFFFFF
  - 圆角: 6px
  - 字体大小: 12px
  - 字体粗细: 500
- **已安装状态**:
  - 背景: #22C55E
  - 文本: "已安装"
  - 图标: 对勾
- **更新可用状态**:
  - 背景: #F59E0B
  - 文本: "更新"

#### 加载状态
- **骨架屏**: 卡片结构的灰色占位符
- **加载动画**: 渐变扫描效果
- **加载更多**: 滚动到底部自动加载

#### 空状态
- **图标**: 搜索图标，64px × 64px，颜色 #D1D5DB
- **标题**: "未找到相关组件"，字体大小 18px，颜色 #6B7280
- **描述**: "尝试调整搜索条件或浏览其他分类"，字体大小 14px，颜色 #9CA3AF

## 交互逻辑

### 搜索功能

1. **实时搜索**:
   - 输入延迟 400ms 后触发搜索
   - 搜索组件名称、描述、标签、开发者
   - 高亮匹配关键词
   - 搜索历史记录

2. **搜索建议**:
   - 输入时显示下拉建议
   - 热门搜索词推荐
   - 拼写错误自动纠正

3. **搜索结果**:
   - 相关性排序
   - 搜索结果数量显示
   - 无结果时推荐相似组件

### 分类筛选

1. **分类导航**:
   - 点击分类立即筛选
   - 面包屑导航显示
   - 子分类展开/收起

2. **多重筛选**:
   - 分类 + 评分 + 价格组合筛选
   - 筛选条件标签显示
   - 一键清除所有筛选

3. **筛选结果**:
   - 实时更新组件数量
   - URL状态同步
   - 筛选历史记录

### 组件操作

1. **组件详情**:
   - 点击卡片查看详情
   - 侧边抽屉或新页面显示
   - 详细描述、截图、文档

2. **安装流程**:
   - 点击安装按钮
   - 权限确认对话框
   - 安装进度显示
   - 安装成功提示

3. **组件管理**:
   - 已安装组件列表
   - 启用/禁用切换
   - 卸载确认
   - 更新检查

### 评价系统

1. **查看评价**:
   - 评价列表显示
   - 评分分布图表
   - 评价排序选项

2. **提交评价**:
   - 星级评分
   - 文字评价
   - 匿名选项
   - 评价审核

### 收藏功能

1. **收藏操作**:
   - 心形图标切换
   - 收藏状态同步
   - 收藏列表管理

2. **收藏列表**:
   - 我的收藏页面
   - 收藏分类管理
   - 批量操作

### 键盘支持

- **Tab**: 在卡片间导航
- **Enter**: 查看组件详情
- **Space**: 收藏/取消收藏
- **方向键**: 在网格中导航
- **Ctrl+F**: 聚焦搜索框
- **Escape**: 关闭详情面板

## API集成

### 获取组件列表

#### 端点
```
GET /api/v1/marketplace/components
```

#### 查询参数
```typescript
interface ComponentListQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  price?: 'free' | 'paid' | 'subscription';
  sortBy?: 'popularity' | 'rating' | 'updated' | 'name';
  sortOrder?: 'asc' | 'desc';
}
```

#### 响应示例
```json
{
  "components": [
    {
      "id": "comp_123",
      "name": "文件处理器",
      "description": "强大的文件处理和转换工具",
      "version": "1.2.0",
      "author": {
        "id": "dev_456",
        "name": "开发者名称",
        "avatar": "/avatars/dev_456.jpg"
      },
      "category": "工具类",
      "tags": ["文件处理", "转换", "批处理"],
      "icon": "/icons/comp_123.png",
      "screenshots": ["/screenshots/comp_123_1.jpg"],
      "rating": {
        "average": 4.5,
        "count": 128
      },
      "downloads": 1250,
      "price": {
        "type": "free",
        "amount": 0
      },
      "isInstalled": false,
      "hasUpdate": false,
      "isFavorited": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "categories": [
    {
      "id": "tools",
      "name": "工具类",
      "count": 12
    }
  ]
}
```

### 获取组件详情

#### 端点
```
GET /api/v1/marketplace/components/:id
```

#### 响应示例
```json
{
  "id": "comp_123",
  "name": "文件处理器",
  "description": "详细描述...",
  "longDescription": "完整的功能说明...",
  "documentation": "使用文档内容...",
  "changelog": [
    {
      "version": "1.2.0",
      "date": "2024-01-15",
      "changes": ["新增批处理功能", "修复已知问题"]
    }
  ],
  "permissions": [
    "文件系统访问",
    "网络请求"
  ],
  "requirements": {
    "minVersion": "1.0.0",
    "dependencies": ["comp_456"]
  },
  "reviews": [
    {
      "id": "rev_789",
      "user": {
        "name": "用户名",
        "avatar": "/avatars/user.jpg"
      },
      "rating": 5,
      "comment": "非常好用的工具",
      "createdAt": "2024-01-10T00:00:00Z"
    }
  ]
}
```

### 安装组件

#### 端点
```
POST /api/v1/marketplace/components/:id/install
```

#### 响应示例
```json
{
  "success": true,
  "installId": "install_123",
  "status": "installing",
  "progress": 0
}
```

### 获取安装进度

#### 端点
```
GET /api/v1/marketplace/installs/:installId
```

#### 响应示例
```json
{
  "id": "install_123",
  "status": "completed",
  "progress": 100,
  "message": "安装完成"
}
```

### TypeScript类型定义

```typescript
interface MCPComponent {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  version: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  icon: string;
  screenshots: string[];
  rating: {
    average: number;
    count: number;
  };
  downloads: number;
  price: {
    type: 'free' | 'paid' | 'subscription';
    amount: number;
  };
  isInstalled: boolean;
  hasUpdate: boolean;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ComponentCategory {
  id: string;
  name: string;
  count: number;
  subcategories?: ComponentCategory[];
}

interface ComponentReview {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface MarketplaceFilters {
  search: string;
  category: string;
  tags: string[];
  rating: number;
  price: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface MarketplaceState {
  components: MCPComponent[];
  categories: ComponentCategory[];
  selectedComponent: MCPComponent | null;
  filters: MarketplaceFilters;
  favorites: string[];
  installedComponents: string[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
}
```

## 响应式设计

### 移动端 (< 768px)

- 侧边栏改为顶部筛选抽屉
- 网格改为单列布局
- 搜索框宽度100%
- 卡片高度自适应

### 平板端 (768px - 1024px)

- 侧边栏宽度: 200px
- 网格2列布局
- 搜索框宽度: 500px

### 桌面端 (> 1024px)

- 标准布局规格
- 网格3列布局
- 搜索框宽度: 600px
- 侧边栏宽度: 240px

## 无障碍支持

- **语义化HTML**: 使用main、section、article等语义标签
- **ARIA标签**: 为卡片和操作按钮提供标签
- **键盘导航**: 完整的键盘操作支持
- **屏幕阅读器**: 为评分和状态提供描述
- **焦点管理**: 操作后正确设置焦点

## 性能要求

- **列表加载时间**: < 1.5秒
- **搜索响应时间**: < 400ms
- **组件安装**: < 30秒
- **图片懒加载**: 视口内才加载

## 安全措施

- **组件审核**: 上架前安全审核
- **权限控制**: 明确权限申请
- **代码扫描**: 恶意代码检测
- **用户举报**: 问题组件举报机制