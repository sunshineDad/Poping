# 系统管理-用户管理技术规格文档

## 基础信息

### 页面目的
为系统管理员提供用户账户管理功能，包括用户列表查看、用户信息编辑、权限管理、账户状态控制等。

### URL路由
`/admin/users`

### 整体布局结构图

```
┌────────────────────────────────────────────────────────────────┐
│                        [Header]                                │
├────────────────────────────────────────────────────────────────┤
│                    [Filter Bar]                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    [User Table]                               │
│                                                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                    [Pagination]                               │
└────────────────────────────────────────────────────────────────┘
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
    * 文本: "用户管理"
  * **副标题**:
    * 字体大小: 14px
    * 颜色: #737373
    * 文本: "系统用户账户管理和权限控制"
    * 上边距: 2px

* **右侧操作区**:
  * **添加用户按钮**:
    * 宽度: 100px
    * 高度: 36px
    * 背景: #000000
    * 颜色: #FFFFFF
    * 圆角: 6px
    * 字体大小: 14px
    * 字体粗细: 500
    * 悬停状态: 背景 #333333
    * 左边距: 12px
  * **导出按钮**:
    * 宽度: 80px
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
* **占位符**: "搜索用户名、邮箱或姓名"
* **搜索图标**: 16px，位置左侧 12px
* **聚焦状态**: 边框 1px solid #000000，阴影 0 0 0 3px rgba(0,0,0,0.1)

#### 状态筛选
* **宽度**: 120px
* **高度**: 36px
* **下拉选择器**:
  * 背景: #FFFFFF
  * 边框: 1px solid #E5E5E5
  * 圆角: 6px
  * 内边距: 0 12px
  * 字体大小: 14px
  * 选项: 全部、活跃、禁用、待验证
  * 聚焦状态: 边框 1px solid #000000

#### 角色筛选
* **宽度**: 120px
* **高度**: 36px
* **下拉选择器**:
  * 背景: #FFFFFF
  * 边框: 1px solid #E5E5E5
  * 圆角: 6px
  * 内边距: 0 12px
  * 字体大小: 14px
  * 选项: 全部、管理员、普通用户、访客
  * 聚焦状态: 边框 1px solid #000000

#### 注册时间筛选
* **宽度**: 200px
* **高度**: 36px
* **日期范围选择器**:
  * 背景: #FFFFFF
  * 边框: 1px solid #E5E5E5
  * 圆角: 6px
  * 内边距: 0 12px
  * 字体大小: 14px
  * 聚焦状态: 边框 1px solid #000000

### User Table 用户表格

* **背景**: #FFFFFF
* **边框**: 1px solid #E5E5E5
* **圆角**: 8px
* **内边距**: 0
* **阴影**: 0 1px 3px rgba(0,0,0,0.1)

#### 表头
* **高度**: 48px
* **背景**: #FAFAFA
* **边框**: 底部 1px solid #E5E5E5
* **内边距**: 0 16px
* **字体大小**: 12px
* **字体粗细**: 600
* **颜色**: #737373
* **文本转换**: uppercase

#### 表格列定义
1. **选择框** (40px)
   - 复选框: 16px × 16px
   - 圆角: 2px
   - 选中颜色: #000000

2. **头像** (60px)
   - 尺寸: 32px × 32px
   - 圆角: 50%
   - 默认背景: #E5E5E5

3. **用户信息** (300px)
   - **用户名**: 字体大小 14px，字体粗细 500，颜色 #000000
   - **邮箱**: 字体大小 12px，颜色 #737373
   - **姓名**: 字体大小 12px，颜色 #737373

4. **角色** (120px)
   - **标签样式**:
     - 内边距: 4px 8px
     - 圆角: 12px
     - 字体大小: 11px
     - 字体粗细: 500
   - **管理员**: 背景 #FEF3C7，颜色 #92400E
   - **普通用户**: 背景 #DBEAFE，颜色 #1E40AF
   - **访客**: 背景 #F3F4F6，颜色 #374151

5. **状态** (100px)
   - **活跃**: 背景 #D1FAE5，颜色 #065F46，图标 ●
   - **禁用**: 背景 #FEE2E2，颜色 #991B1B，图标 ●
   - **待验证**: 背景 #FEF3C7，颜色 #92400E，图标 ●

6. **注册时间** (120px)
   - 字体大小: 12px
   - 颜色: #737373
   - 格式: YYYY-MM-DD

7. **最后登录** (120px)
   - 字体大小: 12px
   - 颜色: #737373
   - 格式: YYYY-MM-DD HH:mm

8. **操作** (120px)
   - **编辑按钮**:
     - 尺寸: 28px × 28px
     - 背景: transparent
     - 颜色: #737373
     - 悬停颜色: #000000
     - 图标: 编辑，14px
   - **更多操作**:
     - 下拉菜单触发器
     - 包含: 重置密码、禁用/启用、删除

#### 表格行
- **高度**: 64px
- **内边距**: 0 16px
- **边框**: 底部 1px solid #F3F4F6
- **悬停状态**: 背景 #F9F9F9
- **选中状态**: 背景 #F0F9FF

### Pagination 分页

- **高度**: 60px
- **背景**: #FFFFFF
- **边框**: 顶部 1px solid #E5E5E5
- **内边距**: 16px 24px
- **布局**: 左侧显示总数，右侧分页控件

#### 总数显示
- **字体大小**: 14px
- **颜色**: #737373
- **格式**: "共 1,234 个用户"

#### 分页控件
- **按钮尺寸**: 32px × 32px
- **间距**: 4px
- **圆角**: 4px
- **默认状态**: 背景 transparent，颜色 #737373
- **悬停状态**: 背景 #F3F4F6，颜色 #000000
- **激活状态**: 背景 #000000，颜色 #FFFFFF
- **禁用状态**: 颜色 #D1D5DB

## 交互逻辑

### 搜索和筛选

1. **实时搜索**:
   - 输入延迟 500ms 后触发搜索
   - 支持用户名、邮箱、姓名模糊匹配
   - 高亮匹配关键词

2. **筛选组合**:
   - 多个筛选条件AND逻辑
   - 筛选变更立即生效
   - URL参数同步

3. **重置筛选**:
   - 清空所有筛选条件
   - 恢复默认排序

### 表格操作

1. **排序功能**:
   - 点击表头进行排序
   - 支持升序/降序切换
   - 排序指示器显示

2. **批量选择**:
   - 全选/取消全选
   - 跨页选择保持
   - 批量操作按钮激活

3. **行操作**:
   - 单击行查看详情
   - 悬停显示操作按钮
   - 右键菜单快捷操作

### 用户操作

1. **编辑用户**:
   - 弹窗表单编辑
   - 实时验证
   - 保存后刷新列表

2. **状态管理**:
   - 启用/禁用用户
   - 确认对话框


3. **密码重置**:
   - 发送重置邮件
   - 操作确认提示
   - 状态反馈

4. **删除用户**:
   - 二次确认对话框
   - 软删除机制
   - 关联数据处理

### 批量操作

1. **批量启用/禁用**:
   - 选择用户后批量操作
   - 进度指示器
   - 操作结果汇总

2. **批量导出**:
   - 选择字段导出
   - CSV/Excel格式
   - 下载进度显示

### 键盘支持

- **Tab**: 在筛选控件间导航
- **Enter**: 确认搜索或操作
- **Space**: 选择/取消选择行
- **方向键**: 在表格行间导航
- **Ctrl+A**: 全选当前页

## API集成

### 获取用户列表

#### 端点
```
GET /api/v1/admin/users
```

#### 查询参数
```typescript
interface UserListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'disabled' | 'pending';
  role?: 'admin' | 'user' | 'guest';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

#### 响应示例
```json
{
  "users": [
    {
      "id": "user_123",
      "username": "john_doe",
      "email": "john@example.com",
      "name": "John Doe",
      "avatar": "/avatars/user_123.jpg",
      "role": "user",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLoginAt": "2024-01-15T10:30:00Z",
      "loginCount": 25,
      "isEmailVerified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1234,
    "totalPages": 62
  }
}
```

### 更新用户信息

#### 端点
```
PUT /api/v1/admin/users/:id
```

#### 请求示例
```json
{
  "name": "John Smith",
  "role": "admin",
  "status": "active",
  "permissions": ["read", "write", "admin"]
}
```

### 批量操作

#### 端点
```
POST /api/v1/admin/users/batch
```

#### 请求示例
```json
{
  "action": "disable",
  "userIds": ["user_123", "user_456"],
  "reason": "Violation of terms"
}
```

### 导出用户数据

#### 端点
```
POST /api/v1/admin/users/export
```

#### 请求示例
```json
{
  "format": "csv",
  "fields": ["username", "email", "name", "role", "status"],
  "filters": {
    "status": "active",
    "role": "user"
  }
}
```

### TypeScript类型定义

```typescript
interface AdminUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'disabled' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
  loginCount: number;
  isEmailVerified: boolean;
  permissions?: string[];
}

interface UserListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserFilters {
  search: string;
  status: string;
  role: string;
  dateRange: [string, string] | null;
}

interface UserManagementState {
  users: AdminUser[];
  selectedUsers: string[];
  filters: UserFilters;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
}
```

## 响应式设计

### 移动端 (< 768px)

- 表格改为卡片列表
- 筛选栏折叠为抽屉
- 操作按钮改为下拉菜单
- 分页简化为上一页/下一页

### 平板端 (768px - 1024px)

- 隐藏部分非关键列
- 调整列宽比例
- 保持表格布局

### 桌面端 (> 1024px)

- 标准表格布局
- 显示所有列
- 固定表头滚动

## 无障碍支持

- **语义化HTML**: 使用table、thead、tbody等语义标签
- **ARIA标签**: 为表格和操作按钮提供标签
- **键盘导航**: 完整的键盘操作支持
- **屏幕阅读器**: 为状态和角色提供描述
- **焦点管理**: 操作后正确设置焦点

## 性能要求

- **列表加载时间**: < 1秒
- **搜索响应时间**: < 500ms
- **批量操作**: < 3秒
- **导出功能**: < 10秒

## 安全措施

- **权限验证**: 管理员权限检查
- **操作日志**: 记录所有管理操作
- **敏感操作**: 二次验证
- **数据脱敏**: 敏感信息保护