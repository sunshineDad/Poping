# 总览仪表板技术规格文档

## 基础信息

### 页面目的

提供平台整体数据概览，包括关键指标、趋势图表和快速操作入口，帮助用户快速了解平台使用情况。

### 核心功能模块

总览仪表板主体页面包含四个核心功能模块，各模块保持设计风格统一，确保功能完整性和操作连贯性：

#### 1. 统计折线图模块

* **主要职责**: 负责数据可视化展示与实时监控

* **核心功能**:

  * 多维度数据趋势展示（调用次数等）

  * 实时数据更新与监控告警

  * 时间范围切换（7天、30天、90天、1年）

  * 交互式图表操作（缩放、平移、数据点详情）

* **设计特点**: 简洁的黑白配色，清晰的数据标识，响应式图表布局

#### 2. API-Key管理模块

* **主要职责**: 提供接口key生成

* **核心功能**:

  * Akey自动生成

* **设计特点**: 统一的表单样式，直观的测试界面，完整的文档展示

#### 3. 示例代码模块

* **主要职责**: 展示典型应用场景的代码实现方案

* **核心功能**:

  * 多语言代码示例展示（JavaScript、Python、Java等）

  * 代码片段复制与下载功能

  * 实际应用场景演示

  * 代码执行结果预览

* **设计特点**: 语法高亮显示，清晰的代码结构，便捷的操作按钮

#### 4. 智能体配置模块

* **主要职责**: 支持AI模型参数调整与行为规则设定

* **核心功能**:

  * AI模型参数实时调整（温度、最大令牌数、响应长度等）

  * 数据集配置，智能体系统提示词配置，mcp配置，是否启用记忆配置，以及查看，点击调试跳转到playground

  * 预设模板选择与自定义配置

* **设计特点**: 直观的参数滑块，清晰的配置分组，实时的效果反馈

### URL路由

`/overview`

### 整体布局结构图

```
┌─────────────┬──────────────────────────────────────────────────┐
│             │                   [Header]                       │
│             ├──────────────────────────────────────────────────┤
│             │               [Stats Cards Row]                 │
│  [Sidebar]  ├─────────────────┬────────────────────────────────┤
│             │                 │                                │
│   [Menu]    │  [Chart Area]   │      [Activity Feed]          │
│             │                 │                                │
│             │                 │                                │
│             ├─────────────────┴────────────────────────────────┤
│             │               [Quick Actions]                   │
└─────────────┴──────────────────────────────────────────────────┘
```

## 组件详细规格

### Sidebar 左侧菜单栏

* **宽度**: 240px (展开状态) / 64px (折叠状态)

* **高度**: 100vh

* **背景**: #FFFFFF

* **边框**: 右侧 1px solid #E5E5E5

* **位置**: 固定定位

* **z-index**: 1000

#### 菜单头部

* **高度**: 64px

* **内边距**: 16px

* **Logo区域**:

  * 展开状态: Logo + 产品名称

  * 折叠状态: 仅显示Logo图标

  * Logo尺寸: 32px × 32px

  * 产品名称: 字体大小 18px，字体粗细 600

#### 折叠按钮

* **位置**: 菜单头部右上角

* **尺寸**: 24px × 24px

* **图标**: 汉堡菜单图标

* **悬停效果**: 背景 #F5F5F5，圆角 4px

#### 菜单项分组

**主要功能区**:

* **总览仪表板** (当前页面)

  * 图标: 📊 Dashboard

  * 路由: /overview

  * 高亮状态: 背景 #F5F5F5，左侧边框 3px solid #000000

* **游乐场**

  * 图标: 🎮 Playground

  * 路由: /playground

* **文档中心**

  * 图标: 📚 Docs

  * 路由: /docs

* **数据集管理**

  * 图标: 🗂️ Dataset

  * 路由: /dataset

* **MCP市场**

  * 图标: 🏪 Marketplace

  * 路由: /marketplace

**个人功能区**:

* **个人资料**

  * 图标: 👤 Profile

  * 路由: /profile

**管理员专属区** (仅管理员可见):

* **分组标题**: "系统管理"

  * 字体大小: 12px

  * 颜色: #737373

  * 上边距: 24px

  * 底边距: 8px

* **用户管理**

  * 图标: 👥 Users

  * 路由: /admin/users

  * 权限标识: 右侧显示 "Admin" 标签

* **系统配置**

  * 图标: ⚙️ Settings

  * 路由: /admin/settings

  * 权限标识: 右侧显示 "Admin" 标签

#### 菜单项样式

* **高度**: 44px

* **内边距**: 12px 16px

* **字体大小**: 14px

* **字体粗细**: 500

* **图标尺寸**: 20px

* **图标与文字间距**: 12px

* **默认状态**: 颜色 #737373

* **悬停状态**: 背景 #F5F5F5，颜色 #000000

* **激活状态**: 背景 #F5F5F5，颜色 #000000，左侧边框 3px solid #000000

* **折叠状态**: 仅显示图标，居中对齐

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

    * 文本: "总览仪表板"

  * **副标题**:

    * 字体大小: 14px

    * 颜色: #737373

    * 文本: "平台数据概览和快速操作"

    * 上边距: 2px

#### 右侧用户区域

* **布局**: 水平排列，间距 16px

* **通知图标**:

  * 尺寸: 20px × 20px

  * 颜色: #737373

  * 悬停状态: 颜色 #000000

  * 未读提示: 红色圆点，尺寸 6px

* **用户头像区域**:

  * **头像**:

    * 尺寸: 36px × 36px

    * 圆角: 50%

    * 边框: 1px solid #E5E5E5

    * 默认头像: 用户名首字母，背景 #F5F5F5

  * **用户信息** (头像右侧):

    * **用户名**:

      * 字体大小: 14px

      * 字体粗细: 500

      * 颜色: #000000

    * **角色标识**:

      * 字体大小: 12px

      * 颜色: #737373

      * 管理员显示: "管理员"

      * 普通用户显示: "用户"

  * **下拉箭头**:

    * 尺寸: 16px × 16px

    * 颜色: #737373

    * 悬停状态: 颜色 #000000

#### 用户下拉菜单

* **触发方式**: 点击用户头像区域

* **位置**: 用户头像下方右对齐

* **宽度**: 200px

* **背景**: #FFFFFF

* **边框**: 1px solid #E5E5E5

* **圆角**: 8px

* **阴影**: 0 4px 12px rgba(0,0,0,0.15)

* **z-index**: 1001

**菜单项结构**:

1. **用户信息区**:

   * **内边距**: 16px

   * **边框**: 底部 1px solid #E5E5E5

   * **用户名**: 字体大小 16px，字体粗细 600

   * **邮箱**: 字体大小 14px，颜色 #737373

   * **角色标签**:

     * 管理员: 背景 #000000，颜色 #FFFFFF，圆角 4px

     * 普通用户: 背景 #F5F5F5，颜色 #737373，圆角 4px

2. **功能菜单区**:

   * **个人资料**:

     * 图标: 👤 Profile

     * 路由: /profile

   * **账户设置**:

     * 图标: ⚙️ Settings

     * 路由: /settings

   * **帮助中心**:

     * 图标: ❓ Help

     * 路由: /help

3. **管理员专属区** (仅管理员可见):

   * **分割线**: 1px solid #E5E5E5

   * **系统管理**:

     * 图标: 🔧 Admin

     * 路由: /admin

   * **用户管理**:

     * 图标: 👥 Users

     * 路由: /admin/users

4. **退出区**:

   * **分割线**: 1px solid #E5E5E5

   * **退出登录**:

     * 图标: 🚪 Logout

     * 颜色: #EF4444

     * 悬停状态: 背景 #FEF2F2

**菜单项样式**:

* **高度**: 40px

* **内边距**: 8px 16px

* **字体大小**: 14px

* **图标尺寸**: 16px

* **图标与文字间距**: 8px

* **悬停状态**: 背景 #F5F5F5

* **过渡动画**: 200ms ease

### Stats Cards Row 统计卡片行

* **布局**: 4列网格

* **间距**: 16px

* **单个卡片规格**:

  * **宽度**: 自适应 (1fr)

  * **高度**: 120px

  * **背景**: #FFFFFF

  * **边框**: 1px solid #E5E5E5

  * **圆角**: 8px

  * **内边距**: 20px

  * **阴影**: 0 1px 3px rgba(0,0,0,0.1)

  * **数值**:

    * 字体大小: 32px

    * 字体粗细: 700

    * 颜色: #000000

  * **标签**:

    * 字体大小: 14px

    * 颜色: #737373

    * 上边距: 4px

  * **变化指示器**:

    * 字体大小: 12px

    * 上升: 颜色 #22C55E，图标 ↗

    * 下降: 颜色 #EF4444，图标 ↘

    * 持平: 颜色 #737373，图标 →

### Chart Area 图表区域

* **宽度**: 66.67% (2/3)

* **背景**: #FFFFFF

* **边框**: 1px solid #E5E5E5

* **圆角**: 8px

* **内边距**: 24px

* **标题**:

  * 字体大小: 18px

  * 字体粗细: 600

  * 颜色: #000000

  * 底边距: 16px

* **图表容器**:

  * **高度**: 300px

  * **背景**: transparent

* **时间选择器**:

  * **位置**: 右上角

  * **按钮组**:

    * 宽度: 60px

    * 高度: 32px

    * 字体大小: 12px

    * 激活状态: 背景 #000000，颜色 #FFFFFF

    * 非激活状态: 背景 transparent，颜色 #737373

### Activity Feed 活动动态

* **宽度**: 33.33% (1/3)

* **背景**: #FFFFFF

* **边框**: 1px solid #E5E5E5

* **圆角**: 8px

* **内边距**: 24px

* **标题**:

  * 字体大小: 18px

  * 字体粗细: 600

  * 颜色: #000000

  * 底边距: 16px

* **活动项**:

  * **间距**: 16px

  * **头像**:

    * 尺寸: 32px × 32px

    * 圆角: 50%

    * 边框: 1px solid #E5E5E5

  * **内容**:

    * 用户名: 字体大小 14px，字体粗细 500，颜色 #000000

    * 操作描述: 字体大小 14px，颜色 #737373

    * 时间: 字体大小 12px，颜色 #A3A3A3

### Quick Actions 快速操作

* **高度**: 100px

* **背景**: #FAFAFA

* **内边距**: 24px

* **布局**: 水平排列，间距 16px

* **操作按钮**:

  * **宽度**: 160px

  * **高度**: 52px

  * **背景**: #000000

  * **颜色**: #FFFFFF

  * **圆角**: 6px

  * **字体大小**: 14px

  * **字体粗细**: 500

  * **悬停状态**: 背景 #333333

  * **图标**: 16px，左边距 8px

## 交互逻辑

### 左侧菜单栏交互

1. **菜单折叠/展开**:

   * 点击折叠按钮切换菜单状态

   * 展开状态: 宽度 240px，显示图标和文字

   * 折叠状态: 宽度 64px，仅显示图标

   * 过渡动画: 300ms ease-in-out

   * 状态持久化: 保存到 localStorage

2. **菜单项导航**:

   * 点击菜单项跳转到对应页面

   * 当前页面高亮显示

   * 悬停效果: 背景色变化，过渡 200ms

   * 键盘支持: Tab 导航，Enter 激活

3. **权限控制**:

   * 管理员专属菜单项仅对管理员用户显示

   * 权限验证失败时隐藏相关菜单项

   * 动态权限更新时实时刷新菜单

4. **响应式行为**:

   * 移动端自动折叠菜单

   * 平板设备支持手势滑动展开/收起

   * 小屏幕设备菜单覆盖主内容区域

### 用户头像交互

1. **下拉菜单触发**:

   * 点击用户头像区域显示下拉菜单

   * 点击页面其他区域关闭菜单

   * ESC 键关闭菜单

   * 菜单显示动画: 淡入 + 向下滑动，200ms ease-out

2. **菜单项操作**:

   * 个人资料: 跳转到 /profile 页面

   * 账户设置: 跳转到 /settings 页面

   * 帮助中心: 跳转到 /help 页面

   * 系统管理: 跳转到 /admin 页面 (仅管理员)

   * 用户管理: 跳转到 /admin/users 页面 (仅管理员)

   * 退出登录: 清除登录状态，跳转到登录页面

3. **权限动态显示**:

   * 根据用户角色动态显示菜单项

   * 管理员用户显示完整菜单

   * 普通用户隐藏管理员专属功能

   * 角色标签实时更新

4. **状态指示**:

   * 通知图标显示未读消息数量

   * 用户头像显示在线状态

   * 角色标签区分用户类型

### 统计卡片交互

1. **悬停效果**:

   * 阴影增强: 0 4px 12px rgba(0,0,0,0.15)

   * 变换: translateY(-2px)

   * 过渡时间: 200ms ease

2. **点击行为**:

   * 跳转到对应的详细页面

   * 传递筛选参数

### 图表交互

1. **时间范围切换**:

   * 7天、30天、90天、1年选项

   * 点击后重新加载数据

   * 加载状态显示骨架屏

2. **图表操作**:

   * 鼠标悬停显示数据点详情

   * 支持缩放和平移

   * 图例点击切换数据系列显示

### 活动动态交互

1. **滚动加载**:

   * 滚动到底部自动加载更多

   * 每次加载20条记录

   * 显示加载指示器

2. **点击跳转**:

   * 点击活动项跳转到相关页面

   * 点击用户头像查看用户详情

### 快速操作

1. **按钮状态**:

   * 默认、悬停、激活、禁用状态

   * 加载状态显示旋转图标

2. **操作反馈**:

   * 成功操作显示toast提示

   * 错误操作显示错误信息

### 键盘支持

* **Tab**: 导航所有可交互元素

* **Enter/Space**: 激活按钮和链接

* **方向键**: 在时间选择器中切换选项

## API集成

### 获取用户权限信息

#### 端点

```
GET /api/v1/user/permissions
```

#### 响应示例

```json
{
  "user": {
    "id": "user_123",
    "name": "张三",
    "email": "zhangsan@example.com",
    "avatar": "/avatars/user123.jpg",
    "role": "admin",
    "permissions": [
      "dashboard.view",
      "admin.users.manage",
      "admin.system.config"
    ]
  },
  "menuItems": [
    {
      "id": "overview",
      "label": "总览仪表板",
      "icon": "dashboard",
      "route": "/overview",
      "active": true
    },
    {
      "id": "admin-users",
      "label": "用户管理",
      "icon": "users",
      "route": "/admin/users",
      "adminOnly": true
    }
  ]
}
```

### 获取通知信息

#### 端点

```
GET /api/v1/notifications
```

#### 查询参数

```typescript
interface NotificationQuery {
  unreadOnly?: boolean;
  limit?: number;
}
```

#### 响应示例

```json
{
  "notifications": [
    {
      "id": "notif_001",
      "title": "系统更新通知",
      "message": "系统将在今晚进行维护更新",
      "type": "system",
      "read": false,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

### 用户登出

#### 端点

```
POST /api/v1/auth/logout
```

#### 响应示例

```json
{
  "success": true,
  "message": "登出成功"
}
```

### 获取仪表板数据

#### 端点

```
GET /api/v1/dashboard/overview
```

#### 查询参数

```typescript
interface DashboardQuery {
  timeRange: '7d' | '30d' | '90d' | '1y';
  timezone?: string;
}
```

#### 响应示例

```json
{
  "stats": {
    "totalUsers": {
      "value": 12580,
      "change": 8.5,
      "trend": "up"
    },
    "activeProjects": {
      "value": 245,
      "change": -2.1,
      "trend": "down"
    },
    "totalRevenue": {
      "value": 89650,
      "change": 15.3,
      "trend": "up"
    },
    "systemHealth": {
      "value": 99.8,
      "change": 0.2,
      "trend": "up"
    }
  },
  "chartData": {
    "labels": ["2024-01-01", "2024-01-02"],
    "datasets": [
      {
        "label": "用户增长",
        "data": [100, 120],
        "color": "#000000"
      }
    ]
  },
  "activities": [
    {
      "id": "act_001",
      "user": {
        "name": "张三",
        "avatar": "/avatars/user1.jpg"
      },
      "action": "创建了新项目",
      "target": "AI助手项目",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 获取活动动态

#### 端点

```
GET /api/v1/dashboard/activities
```

#### 查询参数

```typescript
interface ActivitiesQuery {
  page: number;
  limit: number;
  type?: 'all' | 'user' | 'system' | 'project';
}
```

### TypeScript类型定义

```typescript
// 用户和权限相关
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  permissions: string[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  active?: boolean;
  adminOnly?: boolean;
  children?: MenuItem[];
}

interface UserPermissions {
  user: User;
  menuItems: MenuItem[];
}

// 通知相关
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'user' | 'warning' | 'info';
  read: boolean;
  timestamp: string;
}

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

// 仪表板数据相关
interface DashboardStats {
  totalUsers: StatItem;
  activeProjects: StatItem;
  totalRevenue: StatItem;
  systemHealth: StatItem;
}

interface StatItem {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label: string;
  data: number[];
  color: string;
}

interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

// 智能体实例相关
interface AgentInstance {
  id: string;                    // 对应 agent_id
  userId: string;               // 对应 user_id
  name: string;                 // 对应 name
  description?: string;         // 对应 description
  mcpConfigId?: string;         // 对应 mcp_config_id
  datasetId?: string;           // 对应 dataset_id
  memoryEnabled: boolean;       // 对应 memory_enabled
  status: 'active' | 'inactive'; // 对应 status
  createdAt: string;            // 对应 created_at
  updatedAt: string;            // 对应 updated_at
  extInfo?: Record<string, any>; // 对应 ext_info
}

interface AgentInstanceDetail extends AgentInstance {
  mcpConfig?: {
    id: string;
    configName: string;
    provider: {
      id: string;
      name: string;
    };
  };
  dataset?: {
    id: string;
    name: string;
    recordCount: number;
  };
}

// 会话管理相关
interface ChatSession {
  id: string;
  userId: string;
  agentId?: string;
  title?: string;
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
  messageCount?: number;        // 消息数量统计
  lastMessage?: string;         // 最后一条消息预览
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    tokenCount?: number;
    model?: string;
    temperature?: number;
    processingTime?: number;
  };
  createdAt: string;
}

// API Key管理相关（安全版本）
interface ApiKey {
  id: string;
  userId: string;
  name?: string;
  // 注意：不返回 api_key_secret 的完整值
  keyPreview: string;           // 只返回前几位和后几位，如 "sk-abc...xyz"
  permissions: {
    scopes: string[];           // 权限范围
    rateLimit?: number;         // 速率限制
    allowedIPs?: string[];      // 允许的IP地址
  };
  status: 'active' | 'inactive' | 'revoked';
  createdAt: string;
  expiresAt?: string;
  updatedAt: string;
}

interface ApiKeyCreateRequest {
  name?: string;
  permissions: {
    scopes: string[];
    rateLimit?: number;
    allowedIPs?: string[];
  };
  expiresAt?: string;
}

interface ApiKeyCreateResponse {
  apiKey: ApiKey;
  // 只在创建时返回完整的密钥，之后不再返回
  secretKey: string;
  warning: string; // 提醒用户保存密钥的警告信息
}

// 订阅计划相关
interface SubscriptionPlan {
  id: string;
  planName: string;
  description?: string;
  price: number;
  durationDays: number;
  features: {
    apiCallsLimit: number;
    storageLimit: number;        // GB
    agentInstancesLimit: number;
    datasetLimit: number;
    supportLevel: 'basic' | 'premium' | 'enterprise';
    customFeatures?: string[];
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;             // 对应 currency 字段
  paymentMethod?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// 供应商配置相关
interface Provider {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface ProviderConfig {
  id: string;
  providerId: string;
  configName: string;
  apiBaseUrl?: string;
  // 注意：不返回 api_token 的完整值
  hasApiToken: boolean;         // 只返回是否配置了token
  otherConfigs: {
    models: string[];           // 支持的模型列表
    defaultParams: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    };
    rateLimit?: {
      requestsPerMinute: number;
      tokensPerMinute: number;
    };
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 应用状态
interface DashboardState {
  // 用户状态
  user: User | null;
  permissions: string[];
  menuItems: MenuItem[];
  notifications: Notification[];
  unreadCount: number;
  
  // 菜单状态
  sidebarCollapsed: boolean;
  userMenuOpen: boolean;
  
  // 仪表板数据
  stats: DashboardStats | null;
  chartData: ChartData | null;
  activities: Activity[];
  timeRange: '7d' | '30d' | '90d' | '1y';
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
}

// 菜单操作
interface MenuActions {
  toggleSidebar: () => void;
  toggleUserMenu: () => void;
  navigateToRoute: (route: string) => void;
  logout: () => Promise<void>;
}
```

## 响应式设计

### 移动端 (< 768px)

* 统计卡片改为2×2网格

* 图表区域和活动动态垂直堆叠

* 快速操作按钮垂直排列

* 字体大小适当缩小

### 平板端 (768px - 1024px)

* 统计卡片保持4列布局

* 图表区域宽度调整为60%

* 活动动态宽度调整为40%

### 桌面端 (> 1024px)

* 标准布局规格

* 最大宽度限制: 1200px

* 居中对齐

## 无障碍支持

* **语义化HTML**: 使用section、article等语义标签

* **ARIA标签**: 为图表和统计数据提供标签

* **键盘导航**: 完整的键盘操作支持

* **屏幕阅读器**: 为图表提供数据表格替代

* **颜色对比**: 确保文本颜色对比度符合WCAG标准

## 性能要求

* **首屏加载时间**: < 2秒

* **数据刷新**: < 1秒

* **图表渲染**: < 500ms

* **活动动态加载**: < 300ms

## 安全措施

* **数据脱敏**: 敏感数据进行脱敏处理

* **权限控制**: 根据用户角色显示不同数据

* **API限流**: 防止频繁请求

