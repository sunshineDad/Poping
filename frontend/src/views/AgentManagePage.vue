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
          <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 lg:space-x-6">
            <!-- 搜索框 -->
            <div class="flex-1 max-w-md">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索智能体名称、描述或标签..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  @input="handleSearch"
                />
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- 筛选和排序 -->
            <div class="flex items-center space-x-4">
              <select 
                v-model="filterType" 
                @change="handleFilter" 
                class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="all">全部类型</option>
                <option value="assistant">助手</option>
                <option value="creative">创意</option>
                <option value="analysis">分析</option>
                <option value="custom">自定义</option>
              </select>
              <select 
                v-model="sortBy" 
                @change="handleSort" 
                class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="created_desc">最新创建</option>
                <option value="created_asc">最早创建</option>
                <option value="usage_desc">使用最多</option>
                <option value="name_asc">名称排序</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
          <p class="mt-4 text-gray-600">正在加载智能体...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredAgents.length === 0" class="text-center py-16">
          <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            {{ searchQuery ? '未找到匹配的智能体' : '还没有智能体' }}
          </h3>
          <p class="text-gray-600 mb-8">
            {{ searchQuery ? '尝试调整搜索条件或筛选器' : '创建您的第一个智能体，开始AI对话之旅' }}
          </p>
          <button 
            @click="showCreateModal = true" 
            class="btn-primary px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            创建智能体
          </button>
        </div>

        <!-- 智能体网格 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="agent in paginatedAgents"
            :key="agent.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 group"
          >
            <div class="p-6">
              <!-- 智能体头部 -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="relative">
                    <img
                      :src="agent.avatar || '/default-agent-avatar.png'"
                      :alt="agent.name"
                      class="w-14 h-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-300 transition-colors"
                    />
                    <div 
                      v-if="agent.isOnline" 
                      class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                    ></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">{{ agent.name }}</h3>
                    <p class="text-sm text-gray-500">{{ getCategoryName(agent.category) }}</p>
                  </div>
                </div>
                
                <!-- 操作菜单 -->
                <div class="relative">
                  <button
                    @click="toggleMenu(agent.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  <div
                    v-if="activeMenu === agent.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
                  >
                    <div class="py-2">
                      <button
                        @click="startChat(agent)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        开始对话
                      </button>
                      <button
                        @click="editAgent(agent)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        编辑设置
                      </button>
                      <button
                        @click="duplicateAgent(agent)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制智能体
                      </button>
                      <button
                        @click="togglePublic(agent)"
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        {{ agent.isPublic ? '设为私有' : '设为公开' }}
                      </button>
                      <div class="border-t border-gray-100 my-1"></div>
                      <button
                        @click="deleteAgent(agent)"
                        class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:red-50"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        删除智能体
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 描述 -->
              <p class="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {{ agent.description || '暂无描述' }}
              </p>

              <!-- 标签和状态 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-if="agent.isPublic"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                  </svg>
                  公开
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                  </svg>
                  私有
                </span>
                <span
                  v-for="tag in (agent.tags || []).slice(0, 2)"
                  :key="tag"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="(agent.tags || []).length > 2"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                  +{{ (agent.tags || []).length - 2 }}
                </span>
              </div>

              <!-- 底部信息和操作 -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {{ formatUsageCount(agent.usageCount || 0) }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatDate(agent.createdAt) }}
                  </span>
                </div>
                <button
                  @click="startChat(agent)"
                  class="flex items-center text-black hover:text-gray-700 font-medium text-sm transition-colors group"
                >
                  <span>开始对话</span>
                  <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="flex justify-center mt-12">
          <nav class="flex items-center space-x-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              上一页
            </button>
            
            <div class="flex items-center space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  page === currentPage
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- 创建/编辑智能体模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ showEditModal ? '编辑智能体' : '创建智能体' }}
            </h2>
            <button
              @click="closeModal"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="submitAgent" class="p-6 space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                智能体名称 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="agentForm.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="请输入智能体名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                类别
              </label>
              <select 
                v-model="agentForm.category" 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="assistant">助手</option>
                <option value="creative">创意</option>
                <option value="analysis">分析</option>
                <option value="custom">自定义</option>
              </select>
            </div>
          </div>

          <!-- 描述 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              描述 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="agentForm.description"
              required
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-all"
              placeholder="请描述这个智能体的功能和特点"
            ></textarea>
          </div>

          <!-- 头像设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              头像
            </label>
            <div class="flex items-center space-x-6">
              <img
                :src="agentForm.avatar || '/default-agent-avatar.png'"
                alt="智能体头像"
                class="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
              />
              <div>
                <button
                  type="button"
                  @click="triggerAvatarUpload"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  选择头像
                </button>
                <p class="text-xs text-gray-500 mt-2">支持 JPG、PNG 格式，建议尺寸 200x200</p>
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
            <label class="block text-sm font-medium text-gray-700 mb-2">
              系统提示词 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="agentForm.systemPrompt"
              required
              rows="8"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none font-mono text-sm transition-all"
              placeholder="请输入系统提示词，定义智能体的角色、能力和行为规范..."
            ></textarea>
            <p class="text-xs text-gray-500 mt-2">系统提示词将决定智能体的行为方式和回答风格</p>
          </div>

          <!-- 高级配置 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-900 mb-4">高级配置</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  温度参数: {{ agentForm.config.temperature }}
                </label>
                <input
                  v-model.number="agentForm.config.temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>保守 (0)</span>
                  <span>创意 (2)</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  最大回复长度
                </label>
                <input
                  v-model.number="agentForm.config.maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <!-- 标签管理 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="(tag, index) in agentForm.tags"
                :key="index"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <input
                v-model="newTag"
                type="text"
                placeholder="添加标签"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                @keyup.enter="addTag"
              />
              <button
                type="button"
                @click="addTag"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          <!-- 可见性设置 -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="text-sm font-medium text-gray-900">公开智能体</h3>
              <p class="text-sm text-gray-500">允许其他用户发现和使用这个智能体</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="agentForm.isPublic"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <!-- 提交按钮 -->
          <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSubmitting ? '保存中...' : (showEditModal ? '保存更改' : '创建智能体') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
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

// 计算属性
const filteredAgents = computed(() => {
  let filtered = [...agents.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.description?.toLowerCase().includes(query) ||
      agent.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    )
  }
  
  // 类型过滤
  if (filterType.value !== 'all') {
    filtered = filtered.filter(agent => agent.category === filterType.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'created_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'created_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'usage_desc':
        return (b.usageCount || 0) - (a.usageCount || 0)
      case 'name_asc':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })
  
  return filtered
})

const paginatedAgents = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredAgents.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const half = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, currentPage.value - half)
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 工具方法
const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    assistant: '助手',
    creative: '创意',
    analysis: '分析',
    custom: '自定义'
  }
  return categoryMap[category] || '通用助手'
}

const formatUsageCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

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
      totalPages.value = Math.ceil(filteredAgents.value.length / pageSize)
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
  totalPages.value = Math.ceil(filteredAgents.value.length / pageSize)
}

const handleFilter = () => {
  currentPage.value = 1
  totalPages.value = Math.ceil(filteredAgents.value.length / pageSize)
}

const handleSort = () => {
  currentPage.value = 1
  totalPages.value = Math.ceil(filteredAgents.value.length / pageSize)
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
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
</script>

<style scoped>
/* 页面容器 */
.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

/* 导航栏 */
.navbar {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #111827;
}

.nav-link.active {
  color: #111827;
}

/* 主内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* 搜索和筛选区域 */
.search-filters {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
  color: #111827;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  color: #111827;
  font-size: 0.875rem;
  min-width: 120px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #6b7280;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6b7280;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-description {
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

/* 智能体网格 */
.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 智能体卡片 */
.agent-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;
}

.agent-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.agent-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.agent-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
}

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  word-break: break-word;
}

.agent-category {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.agent-menu {
  position: relative;
}

.menu-button {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.menu-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 150px;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: none;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #f9fafb;
}

.menu-item:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger:hover {
  background-color: #fef2f2;
}

/* 智能体描述 */
.agent-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

/* 智能体标签 */
.agent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.agent-tag {
  padding: 0.25rem 0.5rem;
  background-color: #f9fafb;
  color: #6b7280;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

/* 智能体统计 */
.agent-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.usage-count {
  font-weight: 500;
}

.created-date {
  font-size: 0.75rem;
}

/* 智能体操作 */
.agent-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-button:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.action-button.primary {
  background-color: #111827;
  color: white;
  border-color: #111827;
}

.action-button.primary:hover {
  background-color: #374151;
  border-color: #374151;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination-button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  text-align: center;
}

.pagination-button:hover:not(:disabled) {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button.active {
  background-color: #111827;
  color: white;
  border-color: #111827;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 1rem;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
  color: #111827;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* 按钮样式 */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #111827;
  color: white;
  border-color: #111827;
}

.btn-primary:hover {
  background-color: #374151;
  border-color: #374151;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border-color: #e5e7eb;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 工具类 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>