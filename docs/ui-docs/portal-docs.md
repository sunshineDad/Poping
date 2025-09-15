# 文档中心技术规格文档

## 基础信息

### 页面目的
提供平台使用文档、API文档和操作指南，帮助用户快速了解和使用poping平台功能。

### URL路由
`/docs`

### 整体布局结构图

```
┌────────────────────────────────────────────────────────────────┐
│                        [Header]                                │
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                             │
│   [Sidebar]      │              [Content Area]                │
│                  │                                             │
│                  │                                             │
│                  │                                             │
│                  │                                             │
└──────────────────┴─────────────────────────────────────────────┘
```

## 组件详细规格

### Header 导航栏

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
    * 文本: "文档中心"
  * **面包屑导航**:
    * 字体大小: 14px
    * 颜色: #737373
    * 分隔符: "/"
    * 当前页面颜色: #000000
    * 上边距: 2px

### Sidebar 侧边栏

* **宽度**: 280px
* **背景**: #FAFAFA
* **边框**: 右侧 1px solid #E5E5E5
* **内边距**: 24px 16px

* **搜索框**:
  * 宽度: 100%
  * 高度: 36px
  * 背景: #FFFFFF
  * 边框: 1px solid #E5E5E5
  * 圆角: 4px
  * 内边距: 0 12px
  * 字体大小: 14px
  * 占位符: "搜索文档..."
  * 聚焦状态:
    * 边框: 1px solid #000000
    * 阴影: 0 0 0 3px rgba(0,0,0,0.1)
  * 过渡动画: 150ms ease

* **导航菜单**:
  * **一级菜单项**:
    * 字体大小: 16px
    * 字体粗细: 600
    * 颜色: #000000
    * 内边距: 12px 0
    * 底边距: 8px
  * **二级菜单项**:
    * 字体大小: 14px
    * 字体粗细: 500
    * 颜色: #737373
    * 内边距: 8px 0 8px 16px
    * 悬停颜色: #000000
    * 激活状态: 颜色 #000000，左边框 2px solid #000000
    * 过渡动画: 150ms ease

### Content Area 内容区域

* **背景**: #FFFFFF
* **内边距**: 32px
* **最大宽度**: 800px

* **文档标题**:
  * 字体大小: 32px
  * 字体粗细: 700
  * 颜色: #000000
  * 底边距: 16px

* **文档内容**:
  * **段落**: 字体大小 16px，行高 1.6，颜色 #000000
  * **二级标题**: 字体大小 24px，字体粗细 600，颜色 #000000
  * **三级标题**: 字体大小 20px，字体粗细 600，颜色 #000000
  * **代码块**: 背景 #F5F5F5，内边距 16px，圆角 4px，字体 monospace
  * **行内代码**: 背景 #F5F5F5，内边距 2px 4px，圆角 2px
  * **链接**: 颜色 #000000，下划线，悬停时透明度 0.7
  * **按钮**: 遵循设计系统按钮规范
  * **表格**: 边框 1px solid #E5E5E5，表头背景 #FAFAFA

### 目录导航 (TOC)

- **位置**: 内容区域右侧固定
- **宽度**: 200px
- **背景**: #FAFAFA
- **边框**: 1px solid #E5E5E5
- **圆角**: 4px
- **内边距**: 16px
- **标题**: "目录"，字体大小 14px，字体粗细 600
- **链接项**:
  - 字体大小: 12px
  - 颜色: #737373
  - 行高: 1.5
  - 悬停颜色: #000000
  - 激活状态: 颜色 #000000，字体粗细 500

## 交互逻辑

### 搜索功能

1. **实时搜索**:
   - 输入延迟 300ms 后触发搜索
   - 高亮匹配关键词
   - 显示搜索结果数量

2. **搜索结果**:
   - 标题匹配优先级最高
   - 内容匹配显示上下文
   - 点击结果跳转到对应文档

### 导航交互

1. **菜单折叠**:
   - 一级菜单点击展开/收起二级菜单
   - 动画时长: 200ms ease

2. **页面跳转**:
   - 点击菜单项加载对应文档
   - 更新URL和浏览器历史
   - 滚动到页面顶部

3. **目录导航**:
   - 点击目录项平滑滚动到对应章节
   - 滚动时自动高亮当前章节

### 键盘支持

- **Tab**: 导航所有可交互元素
- **Enter**: 激活选中的菜单项或链接
- **Ctrl+F**: 聚焦搜索框
- **Escape**: 清空搜索框

## API集成

### 获取文档列表

#### 端点
```
GET /api/v1/docs
```

#### 响应示例
```json
{
  "categories": [
    {
      "id": "getting-started",
      "title": "快速开始",
      "docs": [
        {
          "id": "introduction",
          "title": "平台介绍",
          "path": "/docs/getting-started/introduction"
        }
      ]
    }
  ]
}
```

### 获取文档内容

#### 端点
```
GET /api/v1/docs/:id
```

#### 响应示例
```json
{
  "id": "introduction",
  "title": "平台介绍",
  "content": "# 平台介绍\n\npoping是一个...",
  "toc": [
    {
      "level": 2,
      "title": "核心功能",
      "anchor": "core-features"
    }
  ],
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### 搜索文档

#### 端点
```
GET /api/v1/docs/search?q=keyword
```

#### 响应示例
```json
{
  "results": [
    {
      "id": "api-reference",
      "title": "API参考",
      "excerpt": "...包含keyword的内容片段...",
      "path": "/docs/api/reference"
    }
  ],
  "total": 5
}
```

### TypeScript类型定义

```typescript
interface DocCategory {
  id: string;
  title: string;
  docs: DocItem[];
}

interface DocItem {
  id: string;
  title: string;
  path: string;
}

interface DocContent {
  id: string;
  title: string;
  content: string;
  toc: TocItem[];
  updated_at: string;
}

interface TocItem {
  level: number;
  title: string;
  anchor: string;
}

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  path: string;
}

interface DocsPageState {
  categories: DocCategory[];
  currentDoc: DocContent | null;
  searchResults: SearchResult[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}
```

## 响应式设计

### 移动端 (< 768px)

- 侧边栏隐藏，通过汉堡菜单切换
- 内容区域全宽显示
- 目录导航移至内容底部
- 搜索框宽度 100%
- 字体大小适当缩小

### 平板端 (768px - 1024px)

- 侧边栏宽度: 240px
- 内容区域内边距: 24px
- 目录导航保持固定位置

### 桌面端 (> 1024px)

- 标准布局规格
- 侧边栏宽度: 280px
- 内容区域最大宽度: 800px

## 无障碍支持

- **语义化HTML**: 使用nav、main、article等语义标签
- **ARIA标签**: 为搜索框和导航提供标签
- **键盘导航**: 完整的键盘操作支持
- **屏幕阅读器**: 为代码块和图片提供描述
- **焦点管理**: 页面跳转后正确设置焦点

## 性能要求

- **首屏加载时间**: < 1.5秒
- **文档切换**: < 500ms
- **搜索响应**: < 300ms
- **代码高亮**: 异步加载，不阻塞渲染

## 安全措施

- **内容过滤**: 防止XSS攻击
- **搜索限制**: 防止搜索滥用
- **访问控制**: 部分文档需要登录权限