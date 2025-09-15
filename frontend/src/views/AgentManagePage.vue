<template>
  <div class="min-h-screen bg-gray-50 dark-theme">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-xl font-semibold text-black">
            Poping
          </router-link>
          <div class="flex items-center space-x-4">
            <router-link to="/profile" class="text-gray-600 hover:text-black transition-colors">
              个人中心
            </router-link>
            <router-link to="/playground" class="text-gray-600 hover:text-black transition-colors">
              Playground
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-6 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- 页面标题和操作 -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">智能体管理</h1>
            <p class="mt-2 text-gray-600">创建和管理您的智能体</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="btn btn-primary flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>创建智能体</span>
          </button>
        </div>

        <!-- 搜索和筛选 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <!-- 搜索框 -->
            <div class="flex-1 max-w-md">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索智能体..."
                  class="input w-full pl-10"
                  @input="handleSearch"
                />
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- 筛选选项 -->
            <div class="flex items-center space-x-4">
              <select v-model="filterType" @change="handleFilter" class="input">
                <option value="all">全部类型</option>
                <option value="assistant">助手</option>
                <option value="creative">创意</option>
                <option value="analysis">分析</option>
                <option value="custom">自定义</option>
              </select>
              <select v-model="sortBy" @change="handleSort" class="input">
                <option value="created_desc">创建时间（新到旧）</option>
                <option value="created_asc">创建时间（旧到新）</option>
                <option value="usage_desc">使用次数（高到低）</option>
                <option value="name_asc">名称（A-Z）</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 智能体列表 -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="agents.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0L9 9l4 4 4-4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无智能体</h3>
          <p class="mt-1 text-sm text-gray-500">开始创建您的第一个智能体吧</p>
          <div class="mt-6">
            <button @click="showCreateModal = true" class="btn btn-primary">
              创建智能体
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="agent in agents"
            :key="agent.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <!-- 智能体卡片 -->
            <div class="p-6">
              <!-- 头部信息 -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <img
                    :src="agent.avatar || '/default-agent-avatar.png'"
                    :alt="agent.name"
                    class="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">{{ agent.name }}</h3>
                    <p class="text-sm text-gray-500">{{ agent.category || '通用助手' }}</p>
                  </div>
                </div>
                <!-- 操作菜单 -->
                <div class="relative">
                  <button
                    @click="toggleMenu(agent.id)"
                    class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  <div
                    v-if="activeMenu === agent.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                  >
                    <div class="py-1">
                      <button
                        @click="startChat(agent)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        开始对话
                      </button>
                      <button
                        @click="editAgent(agent)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        编辑
                      </button>
                      <button
                        @click="duplicateAgent(agent)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        复制
                      </button>
                      <button
                        @click="togglePublic(agent)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {{ agent.isPublic ? '设为私有' : '设为公开' }}
                      </button>
                      <hr class="my-1">
                      <button
                        @click="deleteAgent(agent)"
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 描述 -->
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ agent.description }}</p>

              <!-- 标签 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-if="agent.isPublic"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  公开
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  私有
                </span>
                <span
                  v-for="tag in (agent.tags || []).slice(0, 2)"
                  :key="tag"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="(agent.tags || []).length > 2"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                  +{{ (agent.tags || []).length - 2 }}
                </span>
              </div>

              <!-- 统计信息 -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center space-x-4">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {{ agent.usageCount || 0 }}
                  </span>
                  <span>{{ formatDate(agent.createdAt) }}</span>
                </div>
                <button
                  @click="startChat(agent)"
                  class="text-black hover:text-gray-700 font-medium"
                >
                  开始对话 →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
          <nav class="flex items-center space-x-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span class="px-3 py-2 text-sm text-gray-700">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- 创建/编辑智能体模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ showEditModal ? '编辑智能体' : '创建智能体' }}
            </h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitAgent" class="space-y-6">
            <!-- 基本信息 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  智能体名称 *
                </label>
                <input
                  v-model="agentForm.name"
                  type="text"
                  required
                  class="input w-full"
                  placeholder="请输入智能体名称"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  类别
                </label>
                <select v-model="agentForm.category" class="input w-full">
                  <option value="assistant">助手</option>
                  <option value="creative">创意</option>
                  <option value="analysis">分析</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
            </div>

            <!-- 描述 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                描述 *
              </label>
              <textarea
                v-model="agentForm.description"
                required
                rows="3"
                class="input w-full resize-none"
                placeholder="请描述这个智能体的功能和特点"
              ></textarea>
            </div>

            <!-- 头像 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                头像
              </label>
              <div class="flex items-center space-x-4">
                <img
                  :src="agentForm.avatar || '/default-agent-avatar.png'"
                  alt="智能体头像"
                  class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <button
                    type="button"
                    @click="triggerAvatarUpload"
                    class="btn btn-secondary text-sm"
                  >
                    选择头像
                  </button>
                  <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，建议尺寸 200x200</p>
                </div>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  @change="handleAvatarChange"
                  class="hidden"
                />
              </div>
            </div>

            <!-- 系统提示词 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                系统提示词 *
              </label>
              <textarea
                v-model="agentForm.systemPrompt"
                required
                rows="6"
                class="input w-full resize-none font-mono text-sm"
                placeholder="请输入系统提示词，定义智能体的角色、能力和行为规范..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">系统提示词将决定智能体的行为方式和回答风格</p>
            </div>

            <!-- 配置选项 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  温度参数
                </label>
                <input
                  v-model.number="agentForm.config.temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>保守 (0)</span>
                  <span>{{ agentForm.config.temperature }}</span>
                  <span>创意 (2)</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  最大回复长度
                </label>
                <input
                  v-model.number="agentForm.config.maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  class="input w-full"
                />
              </div>
            </div>

            <!-- 标签 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                标签
              </label>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="(tag, index) in agentForm.tags"
                  :key="index"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              </div>
              <div class="flex">
                <input
                  v-model="newTag"
                  type="text"
                  placeholder="输入标签后按回车添加"
                  class="input flex-1"
                  @keyup.enter="addTag"
                />
                <button
                  type="button"
                  @click="addTag"
                  class="ml-2 btn btn-secondary"
                >
                  添加
                </button>
              </div>
            </div>

            <!-- 可见性设置 -->
            <div class="flex items-center">
              <input
                v-model="agentForm.isPublic"
                type="checkbox"
                id="isPublic"
                class="rounded border-gray-300 text-black focus:ring-black"
              />
              <label for="isPublic" class="ml-2 text-sm text-gray-700">
                公开智能体（其他用户可以发现和使用）
              </label>
            </div>

            <!-- 提交按钮 -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="btn btn-primary disabled:opacity-50"
              >
                {{ isSubmitting ? '保存中...' : (showEditModal ? '保存更改' : '创建智能体') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-gray-900">确认删除</h3>
              <p class="text-sm text-gray-500 mt-1">
                您确定要删除智能体 "{{ agentToDelete?.name }}" 吗？此操作无法撤销。
              </p>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteModal = false"
              class="btn btn-secondary"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              :disabled="isSubmitting"
              class="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {{ isSubmitting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="showMessage" class="fixed top-4 right-4 z-50">
      <div :class="[
        'px-6 py-3 rounded-lg shadow-lg text-white',
        messageType === 'success' ? 'bg-green-500' : 'bg-red-500'
      ]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const isLoading = ref(false)
const isSubmitting = ref(false)
const agents = ref<any[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 12

// 搜索和筛选
const searchQuery = ref('')
const filterType = ref('all')
const sortBy = ref('created_desc')

// 模态框状态
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const activeMenu = ref<string | null>(null)

// 表单数据
const agentForm = reactive({
  id: '',
  name: '',
  description: '',
  avatar: '',
  category: 'assistant',
  systemPrompt: '',
  config: {
    temperature: 0.7,
    maxTokens: 2000
  },
  tags: [] as string[],
  isPublic: false
})

const newTag = ref('')
const agentToDelete = ref<any>(null)
const avatarInput = ref<HTMLInputElement>()

// 消息提示
const showMessage = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// 方法
const loadAgents = async () => {
  isLoading.value = true
  
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      size: pageSize.toString(),
      search: searchQuery.value,
      type: filterType.value,
      sort: sortBy.value
    })
    
    const response = await fetch(`/api/agents/user?${params}`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      agents.value = data.data.content
      totalPages.value = data.data.totalPages
    } else {
      showError(data.message || '加载智能体列表失败')
    }
  } catch (error) {
    showError('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadAgents()
}

const handleFilter = () => {
  currentPage.value = 1
  loadAgents()
}

const handleSort = () => {
  currentPage.value = 1
  loadAgents()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadAgents()
  }
}

const toggleMenu = (agentId: string) => {
  activeMenu.value = activeMenu.value === agentId ? null : agentId
}

const startChat = (agent: any) => {
  router.push({
    name: 'Playground',
    query: { agentId: agent.id }
  })
}

const editAgent = (agent: any) => {
  agentForm.id = agent.id
  agentForm.name = agent.name
  agentForm.description = agent.description
  agentForm.avatar = agent.avatar || ''
  agentForm.category = agent.category || 'assistant'
  agentForm.systemPrompt = agent.systemPrompt
  agentForm.config = { ...agent.config }
  agentForm.tags = [...(agent.tags || [])]
  agentForm.isPublic = agent.isPublic
  
  showEditModal.value = true
  activeMenu.value = null
}

const duplicateAgent = async (agent: any) => {
  agentForm.id = ''
  agentForm.name = `${agent.name} (副本)`
  agentForm.description = agent.description
  agentForm.avatar = agent.avatar || ''
  agentForm.category = agent.category || 'assistant'
  agentForm.systemPrompt = agent.systemPrompt
  agentForm.config = { ...agent.config }
  agentForm.tags = [...(agent.tags || [])]
  agentForm.isPublic = false
  
  showCreateModal.value = true
  activeMenu.value = null
}

const togglePublic = async (agent: any) => {
  try {
    const response = await fetch(`/api/agents/${agent.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...agent,
        isPublic: !agent.isPublic
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      agent.isPublic = !agent.isPublic
      showSuccess(`智能体已设为${agent.isPublic ? '公开' : '私有'}`)
    } else {
      showError(data.message || '操作失败')
    }
  } catch (error) {
    showError('网络错误，请稍后重试')
  }
  
  activeMenu.value = null
}

const deleteAgent = (agent: any) => {
  agentToDelete.value = agent
  showDeleteModal.value = true
  activeMenu.value = null
}

const confirmDelete = async () => {
  if (!agentToDelete.value) return
  
  isSubmitting.value = true
  
  try {
    const response = await fetch(`/api/agents/${agentToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      showSuccess('智能体删除成功')
      showDeleteModal.value = false
      agentToDelete.value = null
      loadAgents()
    } else {
      showError(data.message || '删除失败')
    }
  } catch (error) {
    showError('网络错误，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 这里应该上传文件到服务器
  // 暂时使用本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    agentForm.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !agentForm.tags.includes(tag)) {
    agentForm.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  agentForm.tags.splice(index, 1)
}

const resetForm = () => {
  agentForm.id = ''
  agentForm.name = ''
  agentForm.description = ''
  agentForm.avatar = ''
  agentForm.category = 'assistant'
  agentForm.systemPrompt = ''
  agentForm.config = {
    temperature: 0.7,
    maxTokens: 2000
  }
  agentForm.tags = []
  agentForm.isPublic = false
  newTag.value = ''
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetForm()
}

const submitAgent = async () => {
  isSubmitting.value = true
  
  try {
    const url = showEditModal.value ? `/api/agents/${agentForm.id}` : '/api/agents'
    const method = showEditModal.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: agentForm.name,
        description: agentForm.description,
        avatar: agentForm.avatar,
        category: agentForm.category,
        systemPrompt: agentForm.systemPrompt,
        config: agentForm.config,
        tags: agentForm.tags,
        isPublic: agentForm.isPublic
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      showSuccess(showEditModal.value ? '智能体更新成功' : '智能体创建成功')
      closeModal()
      loadAgents()
    } else {
      showError(data.message || '操作失败')
    }
  } catch (error) {
    showError('网络错误，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const showSuccess = (msg: string) => {
  message.value = msg
  messageType.value = 'success'
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

const showError = (msg: string) => {
  message.value = msg
  messageType.value = 'error'
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    activeMenu.value = null
  }
}

// 生命周期
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  loadAgents()
  document.addEventListener('click', handleClickOutside)
})

// 清理事件监听器
// onUnmounted(() => {
//   document.removeEventListener('click', handleClickOutside)
// })
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #000;
  color: white;
}

.btn-primary:hover {
  background-color: #374151;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>