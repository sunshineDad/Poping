# 用户个人资料技术规格文档

## 基础信息

### 页面目的
展示和编辑用户个人信息，包括基本资料、偏好设置、安全配置等，提供完整的用户账户管理功能。

### URL路由
`/profile`

### 整体布局结构图

```
┌────────────────────────────────────────────────────────────────┐
│                        [Header]                                │
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                             │
│   [Sidebar]      │            [Content Area]                  │
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
    * 文本: "用户资料"
  * **副标题**:
    * 字体大小: 14px
    * 颜色: #737373
    * 文本: "管理您的个人信息和偏好设置"
    * 上边距: 2px

### Sidebar 侧边导航

* **宽度**: 240px
* **背景**: #FAFAFA
* **边框**: 右侧 1px solid #E5E5E5
* **内边距**: 24px 0

* **菜单项**:
  * **高度**: 40px
  * **内边距**: 0 24px
  * **字体大小**: 14px
  * **字体粗细**: 500
  * **颜色**: #737373
  * **悬停背景**: #F0F0F0
  * **激活背景**: #000000
  * **激活颜色**: #FFFFFF
  * **圆角**: 4px (仅在激活状态)
  * **过渡动画**: 150ms ease

#### 菜单项列表
1. 基本信息
2. 安全设置
3. 偏好设置
4. 通知设置
5. 账单信息
6. API密钥

### Content Area 内容区域

* **背景**: #FFFFFF
* **内边距**: 32px

* **表单组**:
  * **标签**:
    * 字体大小: 14px
    * 字体粗细: 500
    * 颜色: #000000
    * 底边距: 8px
  * **输入框**:
    * 高度: 40px
    * 边框: 1px solid #E5E5E5
    * 圆角: 6px
    * 内边距: 0 12px
    * 字体大小: 14px
    * 聚焦边框: 1px solid #000000
    * 聚焦阴影: 0 0 0 3px rgba(0,0,0,0.1)
    * 过渡动画: 150ms ease
  * **保存按钮**:
    * 宽度: 100px
    * 高度: 40px
    * 背景: #000000
    * 颜色: #FFFFFF
    * 圆角: 6px
    * 字体大小: 14px
    * 字体粗细: 500
    * 悬停状态: 背景 #333333
    * 上边距: 24px

#### 基本信息表单

##### 头像上传
- **容器**:
  - 宽度: 120px
  - 高度: 120px
  - 圆角: 50%
  - 边框: 2px dashed #E5E5E5
  - 背景: #FAFAFA
- **上传按钮**:
  - 位置: 头像右下角
  - 尺寸: 32px × 32px
  - 背景: #000000
  - 颜色: #FFFFFF
  - 圆角: 50%
  - 图标: 相机，16px

##### 表单字段
- **标签**:
  - 字体大小: 14px
  - 字体粗细: 500
  - 颜色: #000000
  - 底边距: 6px
- **输入框**:
  - 宽度: 100%
  - 高度: 44px
  - 背景: #FFFFFF
  - 边框: 1px solid #E5E5E5
  - 圆角: 6px
  - 内边距: 0 16px
  - 字体大小: 14px
  - 底边距: 20px
- **聚焦状态**:
  - 边框: 1px solid #000000
  - 阴影: 0 0 0 3px rgba(0,0,0,0.1)
- **错误状态**:
  - 边框: 1px solid #EF4444
  - 错误信息: 字体大小 12px，颜色 #EF4444

##### 字段列表
1. **用户名** (必填)
2. **邮箱** (必填，只读)
3. **姓名** (可选)
4. **公司** (可选)
5. **职位** (可选)
6. **个人简介** (文本域，高度 100px)

#### 安全设置

##### 密码修改
- **当前密码输入框**:
  - 类型: password
  - 占位符: "请输入当前密码"
- **新密码输入框**:
  - 类型: password
  - 占位符: "请输入新密码"
- **确认密码输入框**:
  - 类型: password
  - 占位符: "请再次输入新密码"
- **密码强度指示器**:
  - 宽度: 100%
  - 高度: 4px
  - 背景: #E5E5E5
  - 强度颜色: 弱(#EF4444)，中(#F59E0B)，强(#22C55E)

##### 两步验证
- **开关按钮**:
  - 宽度: 48px
  - 高度: 24px
  - 背景: 关闭 #E5E5E5，开启 #000000
  - 滑块: 20px × 20px，白色
- **二维码显示**:
  - 尺寸: 200px × 200px
  - 边框: 1px solid #E5E5E5
  - 圆角: 8px

#### 偏好设置

##### 语言选择
- **下拉选择器**:
  - 宽度: 200px
  - 高度: 44px
  - 选项: 中文、English、日本語

##### 主题设置
- **单选按钮组**:
  - **选项**: 浅色、深色、跟随系统
  - **按钮样式**:
    - 宽度: 120px
    - 高度: 40px
    - 边框: 1px solid #E5E5E5
    - 圆角: 6px
    - 选中状态: 背景 #000000，颜色 #FFFFFF

##### 时区设置
- **搜索选择器**:
  - 宽度: 300px
  - 支持搜索和筛选
  - 显示UTC偏移量

#### 通知设置

##### 通知类型开关
- **邮件通知**:
  - 系统更新
  - 安全提醒
  - 营销信息
- **浏览器通知**:
  - 实时消息
  - 任务完成
- **移动推送**:
  - 重要提醒
  - 每日摘要

#### 保存按钮
- **宽度**: 120px
- **高度**: 44px
- **背景**: #000000
- **颜色**: #FFFFFF
- **圆角**: 6px
- **字体大小**: 14px
- **字体粗细**: 500
- **悬停状态**: 背景 #333333
- **加载状态**: 显示旋转图标
- **禁用状态**: 背景 #E5E5E5，颜色 #A3A3A3

## 交互逻辑

### 表单验证

1. **实时验证**:
   - 输入框失焦时触发验证
   - 显示错误信息和状态
   - 用户名唯一性检查

2. **提交验证**:
   - 所有必填字段检查
   - 密码强度验证
   - 邮箱格式验证

### 头像上传

1. **文件选择**:
   - 支持格式: JPG, PNG, GIF
   - 最大尺寸: 5MB
   - 最小分辨率: 100×100px

2. **裁剪功能**:
   - 圆形裁剪框
   - 支持缩放和拖拽
   - 实时预览

3. **上传进度**:
   - 进度条显示
   - 上传成功提示
   - 错误处理

### 密码修改

1. **安全检查**:
   - 当前密码验证
   - 新密码强度检查
   - 密码确认匹配

2. **修改流程**:
   - 发送验证邮件
   - 邮箱确认后生效
   - 强制重新登录

### 两步验证设置

1. **启用流程**:
   - 显示二维码
   - 验证器应用扫码
   - 输入验证码确认

2. **备用码生成**:
   - 生成10个备用码
   - 安全存储提醒
   - 支持重新生成

### 数据保存

1. **自动保存**:
   - 表单数据变更后5秒自动保存
   - 显示保存状态指示

2. **手动保存**:
   - 点击保存按钮
   - 显示保存成功提示
   - 错误处理和重试

### 键盘支持

- **Tab**: 在表单字段间导航
- **Enter**: 提交表单
- **Escape**: 取消编辑
- **Ctrl+S**: 保存更改

## API集成

### 获取用户信息

#### 端点
```
GET /api/v1/user/profile
```

#### 响应示例
```json
{
  "id": "user_123",
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "company": "Tech Corp",
  "position": "Developer",
  "bio": "Full-stack developer",
  "avatar": "/avatars/user_123.jpg",
  "preferences": {
    "language": "zh-CN",
    "theme": "light",
    "timezone": "Asia/Shanghai"
  },
  "notifications": {
    "email": {
      "system": true,
      "security": true,
      "marketing": false
    },
    "browser": {
      "realtime": true,
      "tasks": true
    }
  },
  "security": {
    "twoFactorEnabled": false,
    "lastPasswordChange": "2024-01-01T00:00:00Z"
  }
}
```

### 更新用户信息

#### 端点
```
PUT /api/v1/user/profile
```

#### 请求示例
```json
{
  "name": "John Smith",
  "company": "New Corp",
  "position": "Senior Developer",
  "bio": "Experienced full-stack developer",
  "preferences": {
    "language": "en-US",
    "theme": "dark"
  }
}
```

### 上传头像

#### 端点
```
POST /api/v1/user/avatar
```

#### 请求格式
```
Content-Type: multipart/form-data

file: [image file]
crop: {"x": 0, "y": 0, "width": 200, "height": 200}
```

### 修改密码

#### 端点
```
PUT /api/v1/user/password
```

#### 请求示例
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

### TypeScript类型定义

```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  name?: string;
  company?: string;
  position?: string;
  bio?: string;
  avatar?: string;
  preferences: UserPreferences;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
}

interface NotificationSettings {
  email: {
    system: boolean;
    security: boolean;
    marketing: boolean;
  };
  browser: {
    realtime: boolean;
    tasks: boolean;
  };
  mobile?: {
    important: boolean;
    daily: boolean;
  };
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
}

interface ProfileFormData {
  name: string;
  company: string;
  position: string;
  bio: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

## 响应式设计

### 移动端 (< 768px)

- 侧边栏改为顶部标签页
- 表单字段垂直堆叠
- 头像上传区域居中
- 按钮全宽显示

### 平板端 (768px - 1024px)

- 侧边栏宽度: 200px
- 内容区域最大宽度: 500px
- 保持桌面端布局结构

### 桌面端 (> 1024px)

- 标准布局规格
- 侧边栏宽度: 240px
- 内容区域最大宽度: 600px

## 无障碍支持

- **语义化HTML**: 使用form、fieldset、legend等语义标签
- **ARIA标签**: 为表单控件提供标签和描述
- **键盘导航**: 完整的键盘操作支持
- **屏幕阅读器**: 为错误信息和状态提供描述
- **颜色对比**: 确保文本和背景对比度符合标准

## 性能要求

- **页面加载时间**: < 1.5秒
- **表单提交响应**: < 1秒
- **头像上传**: < 3秒
- **自动保存延迟**: < 500ms

## 安全措施

- **输入验证**: 防止XSS和注入攻击
- **文件上传安全**: 文件类型和大小限制
- **密码安全**: 强密码策略和加密存储
- **会话管理**: 敏感操作需要重新验证