# 前端技术规范

## 概述

本文档定义了智能体服务平台前端项目的技术规范，确保代码一致性、可维护性和团队协作效率。

## 技术栈

- **Vue 3** + TypeScript - 类型安全的现代前端框架
- **Pinia** - Vue 3 官方推荐的状态管理
- **Radix UI** - 无样式、可访问性优先的组件基础
- **Vite** - 快速开发服务器和构建工具
- **Axios** - HTTP 客户端库

## 代码风格规范

### 1. 组件结构

**单文件组件 (SFC) 顺序：**
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 脚本内容
</script>

<style scoped>
/* 样式内容 */
</style>
```

### 2. TypeScript 规范

**接口定义：**
```typescript
// 使用 PascalCase 命名接口
interface UserConfig {
  id: string
  name: string
  email?: string // 可选属性使用 ?
}

// 组件 Props 类型定义
const props = defineProps<{
  visible: boolean
  config?: UserConfig
}>()
```

**响应式数据：**
```typescript
// 使用 ref 处理基础类型
const loading = ref(false)
const count = ref(0)

// 使用 reactive 处理对象
const form = reactive<UserConfig>({
  id: '',
  name: '',
  email: ''
})
```

### 3. 组件设计原则

**Props 验证：**
```typescript
// 始终定义类型和必填字段
const props = defineProps<{
  title: string // 必填
  description?: string // 可选
  items: Array<Item> // 数组类型
}>()
```

**事件定义：**
```typescript
// 明确定义事件类型
const emit = defineEmits<{
  close: []
  save: [data: UserConfig]
  update: [field: string, value: any]
}>()
```

## API 调用规范

### 1. HTTP 客户端使用

**导入方式：**
```typescript
// 统一从 utils/http 导入
import { http } from '@/utils/http'
```

**API 调用模式：**
```typescript
// GET 请求
const fetchData = async () => {
  try {
    const response = await http.get('/api/users')
    if (response.success) {
      return response.data
    }
    throw new Error(response.message)
  } catch (error) {
    console.error('获取数据失败:', error)
    throw error
  }
}

// POST 请求
const saveData = async (data: UserConfig) => {
  try {
    const response = await http.post('/api/users', data)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message)
  } catch (error) {
    console.error('保存数据失败:', error)
    throw error
  }
}
```

### 2. 错误处理

```typescript
// 统一错误处理模式
const handleApiCall = async () => {
  loading.value = true
  try {
    const result = await apiCall()
    // 处理成功结果
  } catch (error: any) {
    console.error('操作失败:', error)
    // 显示错误提示给用户
  } finally {
    loading.value = false
  }
}
```

## 状态管理规范

### 1. Pinia Store 结构

```typescript
// stores/userStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const loading = ref(false)
  
  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  
  // 方法
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      const response = await http.post('/auth/login', credentials)
      user.value = response.data
    } finally {
      loading.value = false
    }
  }
  
  return {
    user,
    loading,
    isLoggedIn,
    login
  }
})
```

### 2. 组件中使用 Store

```typescript
// 在组件中使用
const userStore = useUserStore()
const { user, isLoggedIn } = storeToRefs(userStore)
```

## 样式规范

### 1. 设计令牌使用

```css
/* 使用统一的设计令牌 */
.button {
  background: #3B82F6; /* colors.brand.primary */
  padding: 12px 24px; /* spacing.3 spacing.6 */
  border-radius: 8px; /* borderRadius.md */
  font-weight: 600; /* fontWeight.semibold */
  transition: all 0.2s ease; /* animation.normal */
}

.button:hover {
  background: #2563EB; /* colors.brand.primary-hover */
}
```

### 2. 组件样式结构

```css
/* 按功能分组样式 */

/* 布局 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 外观 */
.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

/* 交互状态 */
.button:hover {
  background: #2563EB;
}

.button:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}
```

## 文件组织规范

### 1. 目录结构

```
src/
├── components/          # 通用组件
│   ├── ui/             # 基础 UI 组件
│   └── business/       # 业务组件
├── views/              # 页面组件
├── stores/             # Pinia 状态管理
├── utils/              # 工具函数
├── types/              # TypeScript 类型定义
└── assets/             # 静态资源
```

### 2. 命名规范

- **组件文件**: PascalCase (UserProfile.vue)
- **页面文件**: PascalCase (UserProfilePage.vue)
- **工具文件**: camelCase (httpClient.ts)
- **类型文件**: camelCase (userTypes.ts)

## 性能优化规范

### 1. 组件懒加载

```typescript
// 路由懒加载
const UserProfile = () => import('@/views/UserProfilePage.vue')

// 组件懒加载
const LazyModal = defineAsyncComponent(() => import('@/components/Modal.vue'))
```

### 2. 响应式优化

```typescript
// 使用 computed 缓存计算结果
const filteredItems = computed(() => {
  return items.value.filter(item => item.active)
})

// 使用 watchEffect 处理副作用
watchEffect(() => {
  if (user.value) {
    loadUserData(user.value.id)
  }
})
```

## 测试规范

### 1. 组件测试

```typescript
// UserProfile.test.ts
import { mount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile', () => {
  it('renders user name correctly', () => {
    const wrapper = mount(UserProfile, {
      props: {
        user: { name: 'John Doe', email: 'john@example.com' }
      }
    })
    
    expect(wrapper.text()).toContain('John Doe')
  })
})
```

## 代码审查清单

### ✅ 必须检查项

- [ ] 组件使用 TypeScript 严格类型
- [ ] Props 和 Emits 正确定义
- [ ] API 调用有错误处理
- [ ] 样式使用设计令牌
- [ ] 组件结构清晰（template → script → style）
- [ ] 无 console.log 残留
- [ ] 变量和函数命名清晰

### 🎯 性能检查项

- [ ] 大型组件使用懒加载
- [ ] 计算属性使用 computed
- [ ] 避免不必要的响应式数据
- [ ] 事件监听器正确清理

### 🔒 安全检查项

- [ ] 用户输入正确验证
- [ ] API 密钥不暴露在前端
- [ ] XSS 防护措施到位

---

**遵循这些规范，确保代码质量和团队协作效率。**