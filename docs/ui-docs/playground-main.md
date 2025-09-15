# 游乐场主页技术规格文档

## 基础信息

### 页面目的
提供AI模型测试和实验环境，用户可以在此页面进行模型对话、参数调试和结果比较。

### URL路由
`/playground`

### 整体布局结构图

```
┌────────────────────────────────────────────────────────────────┐
│                        [Header]                                │
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                             │
│   [Model Panel]  │            [Chat Area]                     │
│                  │                                             │
│                  │                                             │
│                  ├─────────────────────────────────────────────┤
│                  │            [Input Area]                    │
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
    * 文本: "AI游乐场"
  * **副标题**:
    * 字体大小: 14px
    * 颜色: #737373
    * 文本: "AI模型测试和实验环境"
    * 上边距: 2px

* **右侧操作区**:
  * **新建对话按钮**:
    * 宽度: 100px
    * 高度: 36px
    * 背景: #000000
    * 颜色: #FFFFFF
    * 圆角: 6px
    * 字体大小: 14px
    * 字体粗细: 500
    * 悬停状态: 背景 #333333
    * 左边距: 12px
  * **保存按钮**:
    * 宽度: 80px
    * 高度: 36px
    * 背景: transparent
    * 颜色: #000000
    * 边框: 1px solid #E5E5E5
    * 圆角: 6px
    * 字体大小: 14px
    * 字体粗细: 500
    * 悬停状态: 背景 #F5F5F5

### Model Panel 模型配置面板

- **宽度**: 320px
- **背景**: #FAFAFA
- **边框**: 右侧 1px solid #E5E5E5
- **内边距**: 24px

#### 模型选择器
- **标签**:
  - 字体大小: 14px
  - 字体粗细: 500
  - 颜色: #000000
  - 底边距: 8px
- **下拉框**:
  - 宽度: 100%
  - 高度: 40px
  - 背景: #FFFFFF
  - 边框: 1px solid #E5E5E5
  - 圆角: 6px
  - 内边距: 0 12px
  - 字体大小: 14px

#### 参数调节器

##### 温度 (Temperature) - Slider组件
* **轨道规格**:
  * 宽度: 100%
  * 高度: 4px
  * 背景: #E5E5E5
  * 圆角: 2px
* **滑块规格**:
  * 尺寸: 16px × 16px
  * 背景: #000000
  * 圆角: 50%
  * 边框: 2px solid #FFFFFF
  * 阴影: 0 2px 4px rgba(0,0,0,0.2)
* **交互状态**:
  * 悬停状态: 滑块尺寸 18px × 18px
  * 拖拽状态: 滑块阴影 0 4px 8px rgba(0,0,0,0.3)
  * 禁用状态: 轨道背景 #F5F5F5，滑块背景 #A3A3A3
* **数值显示**:
  * 字体大小: 12px
  * 颜色: #737373
  * 位置: 滑块上方
  * 背景: #FFFFFF
  * 边框: 1px solid #E5E5E5
  * 圆角: 4px
  * 内边距: 4px 8px
* **参数范围**: 0.1 - 2.0
* **步长**: 0.1

- **最大令牌数 (Max Tokens)**:
  - **输入框**:
    - 宽度: 100%
    - 高度: 36px
    - 背景: #FFFFFF
    - 边框: 1px solid #E5E5E5
    - 圆角: 4px
    - 内边距: 0 12px
    - 字体大小: 14px
  - **范围**: 1 - 4096

##### Top P - Slider组件
* **轨道规格**: 同温度滑块
* **滑块规格**: 同温度滑块
* **交互状态**: 同温度滑块
* **数值显示**: 同温度滑块
* **参数范围**: 0.1 - 1.0
* **步长**: 0.05

#### 系统提示
- **文本域**:
  - 宽度: 100%
  - 高度: 120px
  - 背景: #FFFFFF
  - 边框: 1px solid #E5E5E5
  - 圆角: 6px
  - 内边距: 12px
  - 字体大小: 14px
  - 字体: monospace
  - 占位符: "输入系统提示..."

### Chat Area 对话区域

- **背景**: #FFFFFF
- **内边距**: 24px
- **最小高度**: calc(100vh - 200px)

#### 消息容器
- **间距**: 24px between messages
- **用户消息**:
  - **对齐**: 右侧
  - **最大宽度**: 70%
  - **背景**: #000000
  - **颜色**: #FFFFFF
  - **圆角**: 12px 12px 4px 12px
  - **内边距**: 12px 16px
  - **字体大小**: 14px
  - **行高**: 1.5

- **AI消息**:
  - **对齐**: 左侧
  - **最大宽度**: 70%
  - **背景**: #F5F5F5
  - **颜色**: #000000
  - **圆角**: 12px 12px 12px 4px
  - **内边距**: 12px 16px
  - **字体大小**: 14px
  - **行高**: 1.5

#### 消息操作
- **复制按钮**:
  - 尺寸: 24px × 24px
  - 背景: transparent
  - 颜色: #737373
  - 悬停颜色: #000000
  - 位置: 消息右上角

- **重新生成按钮** (仅AI消息):
  - 宽度: 80px
  - 高度: 28px
  - 背景: transparent
  - 颜色: #737373
  - 边框: 1px solid #E5E5E5
  - 圆角: 4px
  - 字体大小: 12px
  - 位置: 消息底部

#### 加载状态
- **打字动画**:
  - 3个点的跳动动画
  - 颜色: #737373
  - 动画时长: 1.5s infinite

### Input Area 输入区域

- **高度**: 自适应 (最小 60px，最大 200px)
- **背景**: #FFFFFF
- **边框**: 顶部 1px solid #E5E5E5
- **内边距**: 16px 24px

#### 输入框
- **宽度**: calc(100% - 60px)
- **最小高度**: 44px
- **背景**: #FAFAFA
- **边框**: 1px solid #E5E5E5
- **圆角**: 12px
- **内边距**: 12px 16px
- **字体大小**: 14px
- **行高**: 1.4
- **占位符**: "输入您的消息..."
- **自动调整高度**: 根据内容调整

#### 发送按钮
- **尺寸**: 44px × 44px
- **背景**: #000000
- **颜色**: #FFFFFF
- **圆角**: 50%
- **位置**: 输入框右侧，间距 12px
- **图标**: 发送箭头，16px
- **禁用状态**: 背景 #E5E5E5，颜色 #A3A3A3

#### 快捷操作
- **字符计数**:
  - 字体大小: 12px
  - 颜色: #737373
  - 位置: 输入框右下角
  - 格式: "0 / 2000"

- **快捷键提示**:
  - 字体大小: 11px
  - 颜色: #A3A3A3
  - 文本: "Shift + Enter 换行，Enter 发送"

## 交互逻辑

### 模型配置

1. **参数实时更新**:
   - 滑块拖动时实时显示数值
   - 参数变更自动保存到本地存储
   - 切换模型时重置为默认参数

2. **预设管理**:
   - 支持保存当前配置为预设
   - 快速加载已保存的预设
   - 预设名称自定义

### 对话交互

1. **消息发送**:
   - Enter键发送消息
   - Shift+Enter换行
   - 空消息不允许发送
   - 发送后清空输入框

2. **流式响应**:
   - 实时显示AI回复
   - 支持中断生成
   - 显示生成进度

3. **消息操作**:
   - 悬停显示操作按钮
   - 复制消息内容到剪贴板
   - 重新生成AI回复
   - 删除消息对

### 会话管理

1. **新建会话**:
   - 清空当前对话
   - 重置模型参数
   - 生成新的会话ID

2. **保存会话**:
   - 自动保存到本地存储
   - 支持导出为JSON格式
   - 会话历史列表

### 键盘支持

- **Tab**: 在模型面板参数间导航
- **Enter**: 发送消息
- **Shift+Enter**: 换行
- **Ctrl+N**: 新建对话
- **Ctrl+S**: 保存对话
- **Escape**: 停止生成

## API集成

### 获取可用模型

#### 端点
```
GET /api/v1/models
```

#### 响应示例
```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "openai",
      "maxTokens": 8192,
      "supportedFeatures": ["chat", "streaming"]
    }
  ]
}
```

### 发送消息

#### 端点
```
POST /api/v1/chat/completions
```

#### 请求示例
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "temperature": 0.7,
  "maxTokens": 1000,
  "topP": 1.0,
  "stream": true
}
```

#### 流式响应示例
```
data: {"id":"chat_001","choices":[{"delta":{"content":"Hello"}}]}
data: {"id":"chat_001","choices":[{"delta":{"content":" there"}}]}
data: [DONE]
```

### TypeScript类型定义

```typescript
interface Model {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  supportedFeatures: string[];
}

interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  config: ChatConfig;
  createdAt: number;
  updatedAt: number;
}

interface PlaygroundState {
  models: Model[];
  currentSession: ChatSession;
  sessions: ChatSession[];
  isGenerating: boolean;
  error: string | null;
}
```

## 响应式设计

### 移动端 (< 768px)

- 模型面板折叠为抽屉式
- 对话区域全屏显示
- 输入区域固定在底部
- 消息最大宽度调整为90%

### 平板端 (768px - 1024px)

- 模型面板宽度: 280px
- 保持桌面端布局结构
- 字体大小适当调整

### 桌面端 (> 1024px)

- 标准布局规格
- 模型面板宽度: 320px
- 对话区域自适应剩余宽度

## 无障碍支持

- **语义化HTML**: 使用main、section、form等语义标签
- **ARIA标签**: 为滑块和按钮提供标签
- **键盘导航**: 完整的键盘操作支持
- **屏幕阅读器**: 为参数控件提供描述
- **焦点管理**: 消息发送后焦点返回输入框

## 性能要求

- **首屏加载时间**: < 1.5秒
- **消息发送响应**: < 200ms
- **流式响应延迟**: < 100ms
- **参数调整响应**: < 50ms

## 安全措施

- **输入验证**: 防止恶意输入
- **内容过滤**: 过滤敏感内容
- **API密钥保护**: 密钥存储在服务端
- **请求限流**: 防止滥用

