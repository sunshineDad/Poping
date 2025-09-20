<template>
  <div class="interactive-flowchart">
    <!-- 主标题 -->
    <div class="flowchart-header">
      <h2 class="main-title">
        <span class="title-black">Your </span>
        <span class="title-gradient">real data</span>
        <span class="title-black">, Build </span>
        <span class="title-blue">Better</span>
        <span class="title-black"> Agent</span>
      </h2>
      <p class="subtitle">将混乱数据转换为智能Agent的完整流程</p>
    </div>

    <!-- 流程图容器 -->
    <div class="flowchart-container">
      <!-- 第一行：Chaos, Context Management, Memory -->
      <div class="flow-row top-row">
        <!-- Chaos 模块 -->
        <div class="flow-module chaos-module" :class="{ active: modules.chaos.enabled, expanded: modules.chaos.expanded, pulse: modules.chaos.enabled && isFlowActive }">
          <div class="module-header" @click="toggleModule('chaos')">
            <div class="module-title-section">
              <el-checkbox 
                v-model="modules.chaos.enabled" 
                @change="handleModuleToggle('chaos')"
                @click.stop
                class="module-checkbox"
              >
                Chaos
              </el-checkbox>
            </div>
            <div class="module-expand-icon" 
                 :class="{ rotated: modules.chaos.expanded }"
                 @click.stop="toggleExpanded('chaos')">
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          <div class="module-content" :class="{ expanded: modules.chaos.expanded }">
            <!-- 上传区域 - 只在没有文件时显示 -->
            <div class="upload-area" v-if="uploadedFiles.length === 0" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent" >
              <el-upload
                class="upload-demo"
                drag
                :auto-upload="false"
                :on-change="handleFileChange"
                multiple
                :file-list="fileList"
                :show-file-list="false"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽文件到此处 或 <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 txt/pdf/doc/csv 等格式，可多选
                  </div>
                </template>
              </el-upload>
            </div>
            
            <!-- 文件卡片展示 - 有文件时显示，包含添加更多文件的按钮 -->
            <div class="file-cards" v-if="uploadedFiles.length > 0">
              <div v-for="(file, index) in uploadedFiles" :key="file.name" class="file-card">
                <div class="file-icon">📄</div>
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
                <el-button 
                  type="danger" 
                  size="small" 
                  circle 
                  @click="removeFile(index)"
                  class="remove-btn"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              
              <!-- 添加更多文件按钮 -->
              <div class="add-more-files">
                <el-upload
                  class="add-file-upload"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  multiple
                  :show-file-list="false"
                >
                  <el-button type="primary" plain size="small">
                    <el-icon><Plus /></el-icon>
                    添加更多文件
                  </el-button>
                </el-upload>
              </div>
            </div>
          </div>
        </div>



        <!-- 新的SVG箭头 -->
        <div class="flow-arrow-svg" :class="{ active: modules.chaos.enabled || modules.context.enabled }">
          <svg viewBox="0 0 120 24" class="arrow-container">
            <g class="arrow-group">
              <path d="M8 6 L16 12 L8 18" class="arrow-chevron chevron-1" />
              <path d="M28 6 L36 12 L28 18" class="arrow-chevron chevron-2" />
              <path d="M48 6 L56 12 L48 18" class="arrow-chevron chevron-3" />
              <path d="M68 6 L76 12 L68 18" class="arrow-chevron chevron-4" />
            </g>
          </svg>
        </div>

        <!-- Context Management 模块 -->
        <div class="flow-module context-module" :class="{ active: modules.context.enabled, expanded: modules.context.expanded, pulse: modules.context.enabled && isFlowActive }">
          <div class="module-header" @click="toggleModule('context')">
            <div class="module-title-section">
              <el-checkbox 
                v-model="modules.context.enabled" 
                @change="handleModuleToggle('context')"
                @click.stop
                class="module-checkbox"
              >
                Context Management
              </el-checkbox>
              <el-button 
                v-if="uploadedFiles.length > 0 && modules.context.enabled"
                type="primary" 
                size="small"
                @click.stop="processContext"
                class="process-btn"
              >
                处理上下文
              </el-button>
            </div>
            <div class="module-expand-icon" 
                 :class="{ rotated: modules.context.expanded }"
                 @click.stop="toggleExpanded('context')">
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          <div class="module-content" :class="{ expanded: modules.context.expanded && showContextData }">
            <div class="json-display">
              <pre class="json-content">{{ contextData }}</pre>
            </div>
          </div>
        </div>



        <!-- 新的SVG双向箭头 -->
        <div class="flow-arrow-svg bidirectional" :class="{ active: modules.context.enabled || modules.memory.enabled }">
          <svg viewBox="0 0 120 24" class="arrow-container">
            <g class="arrow-group">
              <path d="M8 6 L16 12 L8 18" class="arrow-chevron chevron-1" />
              <path d="M28 6 L36 12 L28 18" class="arrow-chevron chevron-2" />
              <path d="M48 6 L56 12 L48 18" class="arrow-chevron chevron-3" />
              <path d="M68 6 L76 12 L68 18" class="arrow-chevron chevron-4" />
            </g>
          </svg>
          <svg viewBox="0 0 120 24" class="arrow-container reverse">
            <g class="arrow-group">
              <path d="M76 6 L68 12 L76 18" class="arrow-chevron chevron-1" />
              <path d="M56 6 L48 12 L56 18" class="arrow-chevron chevron-2" />
              <path d="M36 6 L28 12 L36 18" class="arrow-chevron chevron-3" />
              <path d="M16 6 L8 12 L16 18" class="arrow-chevron chevron-4" />
            </g>
          </svg>
        </div>

        <!-- Memory 模块 -->
        <div class="flow-module memory-module" :class="{ active: modules.memory.enabled, expanded: modules.memory.expanded, pulse: modules.memory.enabled && isFlowActive }">
          <div class="module-header" @click="toggleModule('memory')">
            <div class="module-title-section">
              <el-checkbox 
                v-model="modules.memory.enabled" 
                @change="handleModuleToggle('memory')"
                @click.stop
                class="module-checkbox"
              >
                Memory
              </el-checkbox>
            </div>
            <div class="module-expand-icon" 
                 :class="{ rotated: modules.memory.expanded }"
                 @click.stop="toggleExpanded('memory')">
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          <div class="module-content" :class="{ expanded: modules.memory.expanded }">
            <div class="memory-display">
              <div class="memory-stats clickable" @click="openMemoryFullscreen">
                <span class="memory-count">{{ memoryData.length }} 条记录</span>
                <span class="memory-status">实时更新</span>
                <el-icon class="expand-icon"><FullScreen /></el-icon>
              </div>
              <div class="memory-list">
                <div 
                  v-for="memory in memoryData.slice(-5)" 
                  :key="memory.id" 
                  class="memory-item"
                  :class="{ 'new-memory': memory.isNew }"
                >
                  <div class="memory-icon">{{ getMemoryIcon(memory.action) }}</div>
                  <div class="memory-details">
                    <span class="memory-time">{{ memory.time }}</span>
                    <span class="memory-action">{{ memory.action }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- 新的SVG垂直箭头 -->
      <div class="vertical-arrows-svg">
        <div class="vertical-arrow-svg" :class="{ active: modules.chaos.enabled && modules.context.enabled }">
          <svg viewBox="0 0 24 120" class="vertical-arrow-container">
            <g class="arrow-group">
              <path d="M6 8 L12 16 L18 8" class="arrow-chevron chevron-1" />
              <path d="M6 28 L12 36 L18 28" class="arrow-chevron chevron-2" />
              <path d="M6 48 L12 56 L18 48" class="arrow-chevron chevron-3" />
              <path d="M6 68 L12 76 L18 68" class="arrow-chevron chevron-4" />
            </g>
          </svg>
        </div>
        <div class="vertical-arrow-svg" :class="{ active: modules.memory.enabled && modules.context.enabled }">
          <svg viewBox="0 0 24 120" class="vertical-arrow-container">
            <g class="arrow-group">
              <path d="M6 8 L12 16 L18 8" class="arrow-chevron chevron-1" />
              <path d="M6 28 L12 36 L18 28" class="arrow-chevron chevron-2" />
              <path d="M6 48 L12 56 L18 48" class="arrow-chevron chevron-3" />
              <path d="M6 68 L12 76 L18 68" class="arrow-chevron chevron-4" />
            </g>
          </svg>
        </div>
      </div>

      <!-- 第二行：Model, Agent Framework, API -->
      <div class="flow-row bottom-row">
        <!-- Model 模块 -->
        <div class="flow-module model-module" :class="{ active: selectedModel, expanded: selectedModel }">
          <div class="module-header" @click="toggleModule('model')">
            <div class="module-title-section">
              <el-checkbox 
                v-model="selectedModel" 
                @change="handleModelToggle"
                @click.stop
                class="module-checkbox"
              >
                Model
              </el-checkbox>
            </div>
            <div class="module-expand-icon" :class="{ rotated: selectedModel }">
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          <div class="module-content" :class="{ expanded: selectedModel }">
            <div class="model-selector">
              <el-select v-model="selectedModel1" placeholder="请选择模型">
                <el-option
                  v-for="model in availableModels"
                  :key="model.value"
                  :label="model.label"
                  :value="model.value"
                />
              </el-select>
            </div>
          </div>
        </div>



        <!-- 新的SVG箭头 -->
        <div class="flow-arrow-svg" :class="{ active: selectedModel && isFrameworkActive }">
          <svg viewBox="0 0 120 24" class="arrow-container">
            <g class="arrow-group">
              <path d="M8 6 L16 12 L8 18" class="arrow-chevron chevron-1" />
              <path d="M28 6 L36 12 L28 18" class="arrow-chevron chevron-2" />
              <path d="M48 6 L56 12 L48 18" class="arrow-chevron chevron-3" />
              <path d="M68 6 L76 12 L68 18" class="arrow-chevron chevron-4" />
            </g>
          </svg>
        </div>

        <!-- Agent Framework 模块 -->
        <div class="flow-module agent-module" :class="{ active: isFrameworkActive, expanded: isFrameworkActive }">
          <div class="module-header" @click="toggleModule('agentframework')">
            <div class="module-title-section">
              <el-checkbox 
                v-model="isFrameworkActive" 
                @change="handleFrameworkToggle"
                @click.stop
                class="module-checkbox"
              >
                Agent Framework
              </el-checkbox>
            </div>
            <div class="module-expand-icon" :class="{ rotated: isFrameworkActive }">
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          <div class="module-content" :class="{ expanded: isFrameworkActive }">
            <div class="framework-status">
              <div class="status-indicator" :class="{ active: isFrameworkActive }"></div>
              <span>{{ isFrameworkActive ? '运行中' : '待启动' }}</span>
            </div>
          </div>
        </div>



        <!-- 新的SVG箭头 -->
        <div class="flow-arrow-svg" :class="{ active: isFrameworkActive && canLaunch }">
          <svg viewBox="0 0 120 24" class="arrow-container">
            <g class="arrow-group">
              <path d="M8 6 L16 12 L8 18" class="arrow-chevron chevron-1" />
              <path d="M28 6 L36 12 L28 18" class="arrow-chevron chevron-2" />
              <path d="M48 6 L56 12 L48 18" class="arrow-chevron chevron-3" />
              <path d="M68 6 L76 12 L68 18" class="arrow-chevron chevron-4" />
            </g>
          </svg>
        </div>

        <!-- API 模块 -->
        <div class="flow-module api-module" :class="{ active: canLaunch, expanded: canLaunch }">
          <div class="module-header" @click="toggleModule('api')">
            <div class="module-title-section">
              <el-checkbox 
                v-model="canLaunch" 
                @change="handleApiToggle"
                @click.stop
                class="module-checkbox"
              >
                API
              </el-checkbox>
            </div>
            <div class="module-expand-icon" :class="{ rotated: canLaunch }">
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          <div class="module-content" :class="{ expanded: canLaunch }">
            <div class="api-controls">
              <el-button 
                type="text" 
                @click="handleLetsGo"
                :disabled="!canLaunch"
                size="large"
                style="font-size:20px;margin-top:20px;"
                class="lets-go-btn"
              >
                Let's Go!<el-icon size="20" style="margin-left:5px"><Position /></el-icon>
              </el-button>
              <div class="api-key-display" v-if="apiKey">
                <span class="api-key-label">API Key:</span>
                <code class="api-key">{{ maskedApiKey }}</code>
                <el-button 
                  type="text" 
                  @click="copyApiKey"
                  class="copy-btn"
                  size="small"
                >
                  <el-icon v-if="!isApiCopy" size="20"><DocumentCopy /></el-icon>
                  <el-icon v-if="isApiCopy" size="20" style="color:#10B981;"><Check /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MCP 市场模块 -->
      <div class="mcp-section">

        <!-- 新的SVG向上箭头 -->
        <div class="vertical-arrow-svg up-arrow" :class="{ active: modules.mcp.enabled }">
          <svg viewBox="0 0 24 120" class="vertical-arrow-container reverse">
            <g class="arrow-group">
              <path d="M6 76 L12 68 L18 76" class="arrow-chevron chevron-1" />
              <path d="M6 56 L12 48 L18 56" class="arrow-chevron chevron-2" />
              <path d="M6 36 L12 28 L18 36" class="arrow-chevron chevron-3" />
              <path d="M6 16 L12 8 L18 16" class="arrow-chevron chevron-4" />
            </g>
          </svg>
        </div>
        
        <!-- MCP 市场模块 -->
        <div class="module-card mcp-module" :class="{ active: modules.mcp.enabled, expanded: modules.mcp.expanded }">
          <div class="module-header" @click="toggleModule('mcp')">
            <div class="module-title-section">
              <el-checkbox 
                v-model="modules.mcp.enabled" 
                @change="handleModuleToggle('mcp')"
                @click.stop
                class="module-checkbox"
              >
                MCP 市场
              </el-checkbox>
            </div>
            <div class="module-expand-icon" 
                 :class="{ rotated: modules.mcp.expanded }"
                 @click.stop="toggleExpanded('mcp')">
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          <div class="module-content" :class="{ expanded: modules.mcp.expanded }">
            <div class="mcp-header">
              <div class="mcp-stats">
                <span class="plugin-count">{{ mcpPlugins.length }} 个插件</span>
                <span class="selected-count">已选择 {{ selectedPlugins.length }} 个</span>
              </div>
            </div>
            <div class="plugin-grid">
              <div 
                v-for="plugin in mcpPlugins" 
                :key="plugin.id"
                class="plugin-card"
                :class="{ 'selected': selectedPlugins.includes(plugin.id) }"
                @click="togglePlugin(plugin.id)"
              >
                <div class="plugin-icon">{{ plugin.icon }}</div>
                <div class="plugin-info">
                  <div class="plugin-name">{{ plugin.name }}</div>
                  <div class="plugin-description">{{ plugin.description }}</div>
                  <div class="plugin-category">{{ getCategoryName(plugin.category) }}</div>
                </div>
                <div class="plugin-checkbox">
                  <el-checkbox 
                    :model-value="selectedPlugins.includes(plugin.id)"
                    @click.stop
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 全屏记忆时间线模态框 -->
  <div 
    v-if="showMemoryFullscreen" 
    class="memory-fullscreen-modal"
    @click="closeMemoryFullscreen"
  >
    <div class="memory-fullscreen-content" @click.stop>
      <div class="memory-fullscreen-header">
        <h2>记忆时间线</h2>
        <el-icon class="close-btn" @click="closeMemoryFullscreen">
          <Close />
        </el-icon>
      </div>
      
      <div class="memory-timeline">
        <div class="timeline-flowchart">
          <div class="flowchart-container">
            <div 
              v-for="(memory, index) in memoryData" 
              :key="memory.id"
              class="flowchart-node"
              :class="`node-${index % 4}`"
            >
              <div class="node-content">
                <div class="node-icon">{{ getMemoryIcon(memory.action) }}</div>
                <div class="node-info">
                  <div class="node-time">{{ memory.time }}</div>
                  <div class="node-action">{{ memory.action }}</div>
                </div>
              </div>
              
              <!-- 连接线 -->
              <div v-if="index < memoryData.length - 1" class="flowchart-connector">
                <svg class="connector-line" viewBox="0 0 100 60">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                            refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                    </marker>
                  </defs>
                  <path d="M 45 30 Q 45 0 45 60" 
                        stroke="#3B82F6" 
                        stroke-width="2" 
                        fill="none" 
                        marker-end="url(#arrowhead)"
                        class="animated-path" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElCheckbox, ElUpload, ElSelect, ElOption, ElButton, ElIcon, ElMessage } from 'element-plus'
import { UploadFilled, Close, Plus, FullScreen, ArrowDown, DocumentCopy, Position, Check } from '@element-plus/icons-vue'
// 模块状态
const modules = ref({
  chaos: { enabled: false, expanded: false },
  context: { enabled: false, expanded: false },
  memory: { enabled: false, expanded: false },
  mcp: { enabled: false, expanded: false }
})

// 文件上传
const uploadedFiles = ref<File[]>([])
const fileList = ref([])
const showContextData = ref(false)
const isApiCopy = ref(false)
// 上下文数据
const contextData = ref({
  files: [],
  processed: false,
  summary: "等待数据处理..."
})

// 记忆数据
const memoryData = ref([
  { id: 1, time: "10:30", action: "用户上传文档" },
  { id: 2, time: "10:31", action: "数据预处理完成" },
  { id: 3, time: "10:32", action: "上下文提取成功" }
])

// 模型选择
const selectedModel = ref('')
const selectedModel1 = ref('')
const availableModels = ref([
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'Claude-3', value: 'claude-3' },
  { label: 'Gemini Pro', value: 'gemini-pro' }
])

// Agent Framework 状态
const isFrameworkActive = computed(() => {
  return modules.value.context.enabled && modules.value.memory.enabled && selectedModel.value
})

// API 相关
const apiKey = ref('')
const canLaunch = computed(() => {
  return isFrameworkActive.value && selectedPlugins.value.length > 0
})

const maskedApiKey = computed(() => {
  if (!apiKey.value) return ''
  return apiKey.value.substring(0, 8) + '...' + apiKey.value.substring(apiKey.value.length - 4)
})

// MCP 插件
const mcpPlugins = ref([
  { id: 1, name: 'Web Search', icon: '🔍', description: '网络搜索工具', category: 'search' },
  { id: 2, name: 'File Manager', icon: '📁', description: '文件管理工具', category: 'utility' },
  { id: 3, name: 'Calculator', icon: '🧮', description: '计算器工具', category: 'utility' },
  { id: 4, name: 'Weather', icon: '🌤️', description: '天气查询工具', category: 'api' },
  { id: 5, name: 'Translator', icon: '🌐', description: '翻译工具', category: 'ai' },
  { id: 6, name: 'Code Runner', icon: '💻', description: '代码执行工具', category: 'dev' },
  { id: 7, name: 'Database', icon: '🗄️', description: '数据库连接工具', category: 'data' },
  { id: 8, name: 'Email', icon: '📧', description: '邮件发送工具', category: 'communication' },
  { id: 9, name: 'PDF Parser', icon: '📄', description: 'PDF解析工具', category: 'data' },
  { id: 10, name: 'Browser Control', icon: '🌐', description: '浏览器自动化控制', category: 'browser' },
  { id: 11, name: 'Screenshot', icon: '📸', description: '网页截图工具', category: 'browser' },
  { id: 12, name: 'Form Filler', icon: '📝', description: '表单自动填写', category: 'automation' }
])

const selectedPlugins = ref<number[]>([])

// 动画控制
const isFlowActive = ref(false)

// 启动流程动画
const startFlowAnimation = () => {
  isFlowActive.value = true
  setTimeout(() => {
    isFlowActive.value = false
  }, 3000) // 3秒后停止动画
}

// 获取记忆图标
const getMemoryIcon = (action: string) => {
  if (action.includes('上传') || action.includes('拖拽')) return '📁'
  if (action.includes('激活') || action.includes('启动')) return '⚡'
  if (action.includes('选择') || action.includes('推荐')) return '🔧'
  if (action.includes('生成') || action.includes('API')) return '🔑'
  if (action.includes('处理') || action.includes('完成')) return '✅'
  return '📝'
}



// 方法
const updateContextData = () => {
  if (uploadedFiles.value.length > 0) {
    contextData.value = {
      files: uploadedFiles.value.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: new Date(f.lastModified).toISOString()
      })),
      processed: true,
      summary: `已处理 ${uploadedFiles.value.length} 个文件，提取关键信息完成`,
      extractedData: {
        totalSize: uploadedFiles.value.reduce((sum, f) => sum + f.size, 0),
        fileTypes: [...new Set(uploadedFiles.value.map(f => f.type))],
        processedAt: new Date().toISOString(),
        contextTokens: Math.floor(Math.random() * 5000) + 1000,
        qualityScore: (Math.random() * 0.3 + 0.7).toFixed(2)
      },
      metadata: {
        version: "1.0.0",
        processor: "Poping Context Engine",
        status: "ready"
      }
    }
  } else {
    contextData.value = {
      files: [],
      processed: false,
      summary: "等待数据处理...",
      extractedData: null,
      metadata: {
        version: "1.0.0",
        processor: "Poping Context Engine", 
        status: "waiting"
      }
    }
  }
}

// 新增方法：统一的模块切换逻辑
const toggleModule = (moduleType: string) => {
  switch (moduleType) {
    case 'chaos':
      modules.value.chaos.enabled = !modules.value.chaos.enabled
      modules.value.chaos.expanded = modules.value.chaos.enabled
      break
    case 'context':
      modules.value.context.enabled = !modules.value.context.enabled
      modules.value.context.expanded = modules.value.context.enabled
      break
    case 'memory':
      modules.value.memory.enabled = !modules.value.memory.enabled
      modules.value.memory.expanded = modules.value.memory.enabled
      break
    case 'model':
      // 对于model，切换selectedModel的值
      selectedModel.value = selectedModel.value ? '' : 'gpt-4'
      break
    case 'agentframework':
      // 对于agentframework，切换isFrameworkActive相关状态
      if (isFrameworkActive.value) {
        // 如果当前激活，则重置相关状态
        modules.value.context.enabled = false
        modules.value.memory.enabled = false
        selectedModel.value = ''
      } else {
        // 如果当前未激活，则激活所有必要模块
        modules.value.context.enabled = true
        modules.value.memory.enabled = true
        selectedModel.value = 'gpt-4'
      }
      break
    case 'api':
      // 对于api，切换canLaunch相关状态
      if (canLaunch.value) {
        // 如果当前可启动，则重置
        selectedPlugins.value = []
      } else {
        // 如果当前不可启动，则设置必要条件
        selectedPlugins.value = [1, 2, 3]
      }
      break
    case 'mcp':
      modules.value.mcp.enabled = !modules.value.mcp.enabled
      modules.value.mcp.expanded = modules.value.mcp.enabled
      break
  }
}

// 新增方法：统一的展开/收缩切换逻辑
const toggleExpanded = (moduleType: string) => {
  switch (moduleType) {
    case 'chaos':
      modules.value.chaos.expanded = !modules.value.chaos.expanded
      break
    case 'context':
      modules.value.context.expanded = !modules.value.context.expanded
      break
    case 'memory':
      modules.value.memory.expanded = !modules.value.memory.expanded
      break
    case 'mcp':
      modules.value.mcp.expanded = !modules.value.mcp.expanded
      break
  }
}

// 新增方法：处理各模块的toggle事件
const handleModelToggle = () => {
  if (!selectedModel.value) {
    selectedModel.value = 'gpt-4'
  }
}

const handleFrameworkToggle = () => {
  // 框架切换逻辑已在toggleModule中处理
}

const handleApiToggle = () => {
  // API切换逻辑已在toggleModule中处理
}

const handleModuleToggle = (moduleType: string) => {
  // 当checkbox被选中时，自动展开模块内容
  if (moduleType === 'chaos' && modules.value.chaos.enabled) {
    modules.value.chaos.expanded = true
    // 启用 Chaos 后自动启用 Context Management
    setTimeout(() => {
      modules.value.context.enabled = true
      modules.value.context.expanded = true
      updateContextData()
      // 添加新的记忆条目
      memoryData.value.push({
        id: memoryData.value.length + 1,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        action: "Context Management 模块已激活"
      })
    }, 1000)
  } else if (moduleType === 'chaos' && !modules.value.chaos.enabled) {
    modules.value.chaos.expanded = false
  }
  
  if (moduleType === 'context' && modules.value.context.enabled) {
    modules.value.context.expanded = true
    // 启用 Context Management 后自动启用 Memory
    setTimeout(() => {
      modules.value.memory.enabled = true
      modules.value.memory.expanded = true
      memoryData.value.push({
        id: memoryData.value.length + 1,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        action: "Memory 模块已激活"
      })
    }, 1000)
  } else if (moduleType === 'context' && !modules.value.context.enabled) {
    modules.value.context.expanded = false
  }
  
  // 修复Memory模块首次点击checkbox时内容无法显示的问题
  if (moduleType === 'memory' && modules.value.memory.enabled) {
    // 确保Memory模块被激活时立即展开内容
    modules.value.memory.expanded = true
    // 添加记忆条目
    memoryData.value.push({
      id: memoryData.value.length + 1,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      action: "Memory 模块手动激活"
    })
  } else if (moduleType === 'memory' && !modules.value.memory.enabled) {
    modules.value.memory.expanded = false
  }
  
  if (moduleType === 'mcp' && modules.value.mcp.enabled) {
    // 确保MCP模块被激活时立即展开内容
    modules.value.mcp.expanded = true
  } else if (moduleType === 'mcp' && !modules.value.mcp.enabled) {
    // 如果MCP模块被禁用，确保收缩内容
    modules.value.mcp.expanded = false
  }
}

const handleFileChange = (file: any) => {
  uploadedFiles.value.push(file.raw)
  // 重置上下文显示状态
  showContextData.value = false
  // 添加文件上传记忆
  memoryData.value.push({
    id: memoryData.value.length + 1,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    action: `上传文件: ${file.raw.name}`
  })
}

const handleFileDrop = (e: DragEvent) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer?.files || [])
  uploadedFiles.value.push(...files)
  // 重置上下文显示状态
  showContextData.value = false
  // 添加拖拽上传记忆
  files.forEach(file => {
    memoryData.value.push({
      id: memoryData.value.length + 1,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      action: `拖拽上传: ${file.name}`
    })
  })
}

// 移除文件
const removeFile = (index: number) => {
  const fileName = uploadedFiles.value[index].name
  uploadedFiles.value.splice(index, 1)
  // 如果没有文件了，隐藏上下文数据
  if (uploadedFiles.value.length === 0) {
    showContextData.value = false
  }
  // 添加移除文件记忆
  memoryData.value.push({
    id: memoryData.value.length + 1,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    action: `移除文件: ${fileName}`
  })
}

// 处理上下文
const processContext = () => {
  updateContextData()
  showContextData.value = true
  // 添加处理上下文记忆
  memoryData.value.push({
    id: memoryData.value.length + 1,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    action: `处理上下文: ${uploadedFiles.value.length} 个文件`
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取分类名称
const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'search': '搜索',
    'utility': '工具',
    'api': 'API',
    'ai': 'AI',
    'dev': '开发',
    'data': '数据',
    'communication': '通信',
    'browser': '浏览器',
    'automation': '自动化',
    'security': '安全'
  }
  return categoryMap[category] || category
}

const togglePlugin = (pluginId: number) => {
  const index = selectedPlugins.value.indexOf(pluginId)
  const plugin = mcpPlugins.value.find(p => p.id === pluginId)
  
  if (index > -1) {
    selectedPlugins.value.splice(index, 1)
    // 添加取消选择记忆
    memoryData.value.push({
      id: memoryData.value.length + 1,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      action: `取消选择插件: ${plugin?.name}`,
      isNew: true
    })
  } else {
    selectedPlugins.value.push(pluginId)
    // 添加选择记忆
    memoryData.value.push({
      id: memoryData.value.length + 1,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      action: `选择插件: ${plugin?.name}`,
      isNew: true
    })
  }
  
  // 确保Memory模块在插件选择时自动激活和展开
  if (!modules.value.memory.enabled) {
    modules.value.memory.enabled = true
    modules.value.memory.expanded = true
  }
  
  // 清除新记忆标记
  setTimeout(() => {
    memoryData.value.forEach(memory => {
      if (memory.isNew) memory.isNew = false
    })
  }, 2000)
}

// 复制API Key
const copyApiKey = async () => {
  if (!apiKey.value) return
  
  try {
    await navigator.clipboard.writeText(apiKey.value)
    isApiCopy.value = true
    // 这里可以添加成功提示
    ElMessage.success('API Key已复制到剪贴板')
    console.log('API Key已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const handleLetsGo = () => {
  // 生成模拟API Key
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  apiKey.value = `pk-${timestamp}${random}`
  isApiCopy.value = false
  // 添加记忆记录
  memoryData.value.push({
    id: memoryData.value.length + 1,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    action: `生成API Key: ${apiKey.value.substring(0, 12)}...`,
    isNew: true
  })
  
  // 清除新记忆标记
  setTimeout(() => {
    memoryData.value.forEach(memory => {
      if (memory.isNew) memory.isNew = false
    })
  }, 2000)
  
  console.log('Agent启动配置:', {
    chaos: modules.value.chaos,
    contextManagement: modules.value.context,
    memory: modules.value.memory,
    mcp: modules.value.mcp,
    selectedPlugins: selectedPlugins.value,
    apiKey: apiKey.value
  })
}

// 监听框架状态变化
watch(isFrameworkActive, (newVal) => {
  if (newVal) {
    // 自动选择一些插件
    selectedPlugins.value = [1, 2, 3]
    // 添加记忆条目
    memoryData.value.push({
      id: memoryData.value.length + 1,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      action: "Agent Framework 已就绪，自动选择推荐插件"
    })
  }
})

// 监听模块变化，触发动画
watch([() => modules.value.chaos.enabled, () => modules.value.context.enabled, () => modules.value.memory.enabled], () => {
  startFlowAnimation()
}, { deep: true })

// 全屏展示记忆时间线
const showMemoryFullscreen = ref(false)

const openMemoryFullscreen = () => {
  showMemoryFullscreen.value = true
  document.body.style.overflow = 'hidden'
}

const closeMemoryFullscreen = () => {
  showMemoryFullscreen.value = false
  document.body.style.overflow = 'auto'
}</script>

<style scoped>
.interactive-flowchart {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  background: linear-gradient(135deg, #FAFBFC 0%, #F8FAFC 100%);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.interactive-flowchart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
  z-index: 0;
}

.flowchart-header {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
  z-index: 1;
}

.main-title {
  font-size: 2.75rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.title-black {
  color: #0F172A;
}

.title-gradient {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-blue {
  color: #3B82F6;
}

.subtitle {
  font-size: 1.125rem;
  color: #64748B;
  font-weight: 500;
  margin-bottom: 32px;
  line-height: 1.6;
}

.flowchart-container {
  position: relative;
  z-index: 1;
}

.flow-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 0px;
  width: 100%;
}

.flow-module {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 20px;
  min-width: 320px;
  min-height: 120px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.flow-module::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transition: all 0.2s ease;
  opacity: 0;
}

.flow-module.active {
  border-color: #3B82F6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  background: #FFFFFF;
  min-height: 320px;
}

.flow-module.active::before {
  opacity: 1;
  height: 2px;
}

@keyframes dataFlowTop {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.module-header {
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.module-header:hover {
  background-color: rgba(59, 130, 246, 0.04);
  border-radius: 12px;
  padding: 12px 16px;
  margin: -12px -16px 16px -16px;
}

.module-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-expand-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(156, 163, 175, 0.1);
  cursor: pointer;
  opacity: 0.7;
  position: relative;
}

.module-expand-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.2), transparent);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.module-expand-icon:hover {
  background: rgba(59, 130, 246, 0.1);
  opacity: 1;
  transform: scale(1.1);
  color: #3B82F6;
}

.module-expand-icon:hover::before {
  opacity: 1;
}

.module-expand-icon.rotated {
  transform: rotate(180deg);
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.15);
  opacity: 1;
}

.module-expand-icon.rotated::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.3));
  animation: iconGlow 2s ease-in-out infinite;
}

.module-expand-icon.rotated:hover {
  transform: rotate(180deg) scale(1.1);
}

@keyframes iconGlow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.module-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #E5E7EB 20%, #E5E7EB 80%, transparent 100%);
}

.flow-module.active .module-header::after {
  background: linear-gradient(90deg, transparent 0%, #3B82F6 20%, #60A5FA 50%, #3B82F6 80%, transparent 100%);
  animation: headerFlow 2s ease-in-out infinite;
}

@keyframes headerFlow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.module-checkbox {
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1E293B;
  letter-spacing: -0.01em;
}

.module-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1E293B;
  letter-spacing: -0.01em;
}

.module-content {
  min-height: 0;
  position: relative;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(-8px);
}

.module-content.expanded {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
  margin-top: 16px;
}

.upload-area {
  width: 100%;
}

.upload-demo {
  width: 100%;
}

/* 文件卡片样式 */
.file-cards {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.file-card:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.file-icon {
  font-size: 1.25rem;
  min-width: 20px;
  text-align: center;
  color: #6B7280;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 添加更多文件按钮样式 */
.add-more-files {
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed #D1D5DB;
  border-radius: 8px;
  text-align: center;
  background: #FFFFFF;
  transition: all 0.2s ease;
  cursor: pointer;
}

.add-more-files:hover {
  border-color: #3B82F6;
  background: #F9FAFB;
}

.add-file-upload {
  width: 100%;
}

.file-name {
  font-size: 14px;
  color: #1F2937;
  font-weight: 500;
  word-break: break-all;
}

.file-size {
  font-size: 0.75rem;
  color: #6B7280;
}

.remove-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  min-height: 24px;
}

/* 处理按钮样式 */
.process-btn {
  margin-left: 12px;
  height: 28px;
  font-size: 0.75rem;
}

.file-list {
  margin-top: 16px;
  max-height: 120px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 8px;
}

.file-name {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.file-size {
  font-size: 0.75rem;
  color: #6B7280;
}

.json-display {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  height: 210px;
  overflow-y: auto;
  position: relative;
}

.json-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #10B981;
  opacity: 0.3;
}

.json-content {
  color: #10B981;
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.memory-display {
  max-height: 210px;
  overflow-y: auto;
  position: relative;
}

.memory-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  position: relative;
}

.memory-stats.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.memory-stats.clickable:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
  transform: translateY(-1px);
}

.memory-stats .expand-icon {
  color: #6B7280;
  font-size: 14px;
  transition: color 0.2s ease;
}

.memory-stats.clickable:hover .expand-icon {
  color: #3B82F6;
}

.memory-count {
  font-size: 12px;
  color: #4B5563;
  font-weight: 600;
}

.memory-status {
  font-size: 12px;
  color: #10B981;
  font-weight: 500;
}

.memory-list {
  max-height: 160px;
  overflow-y: auto;
  position: relative;
}

.memory-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.memory-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #E5E7EB 0%, #D1D5DB 100%);
  transition: all 0.3s ease;
}

.memory-item.new-memory {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border: 1px solid #BFDBFE;
  animation: memoryPulse 2s ease-in-out;
}

.memory-item.new-memory::before {
  background: linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%);
  animation: memoryGlow 2s ease-in-out infinite;
}

@keyframes memoryGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
  }
}

.memory-icon {
  font-size: 1rem;
  min-width: 20px;
  text-align: center;
}

.memory-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.memory-time {
  font-size: 0.7rem;
  color: #6B7280;
  font-weight: 500;
}

.memory-action {
  font-size: 0.8rem;
  color: #374151;
  line-height: 1.2;
}

@keyframes memoryPulse {
  0% {
    background: #EFF6FF;
    transform: scale(1);
  }
  50% {
    background: #DBEAFE;
    transform: scale(1.02);
  }
  100% {
    background: #EFF6FF;
    transform: scale(1);
  }
}

.model-selector {
  width: 100%;
}

.memory-action {
  font-size: 0.875rem;
  color: #374151;
}

.model-selector {
  width: 100%;
}

.framework-status {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 20px 0;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #E5E7EB;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.framework-status span{
  color: #222
}

.api-controls {
  text-align: center;
}



.api-key-display {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #E5E7EB;
}

.api-key-label {
  font-size: 0.875rem;
  color: #6B7280;
  display: block;
  margin-bottom: 4px;
}

.api-key {
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #D1D5DB;
}



/* 新的SVG箭头样式 */
.flow-arrow-svg {
  width: 120px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.25;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.flow-arrow-svg.active {
  opacity: 1;
}

.flow-arrow-svg.bidirectional {
  flex-direction: column;
  height: 64px;
  gap: 8px;
}

.arrow-container {
  width: 100%;
  height: 100%;
}

.arrow-chevron {
  fill: none;
  stroke: #E5E7EB;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.flow-arrow-svg.active .arrow-chevron {
  stroke: #3B82F6;
  opacity: 1;
}

/* 垂直箭头样式 */
.vertical-arrows-svg {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;
  padding: 0 120px;
  height: 60px;
}

.vertical-arrow-svg {
  width: 32px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.25;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.vertical-arrow-svg.active {
  opacity: 1;
}

.vertical-arrow-container {
  width: 100%;
  height: 100%;
}

.vertical-arrow-svg .arrow-chevron {
  fill: none;
  stroke: #E5E7EB;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.vertical-arrow-svg.active .arrow-chevron {
  stroke: #3B82F6;
  opacity: 1;
}

/* 无限循环动画 - 完整的点亮和熄灭循环 */
.flow-arrow-svg.active .chevron-1 {
  animation: infiniteChevronFlow 2.4s ease-in-out infinite;
  animation-delay: 0s;
}

.flow-arrow-svg.active .chevron-2 {
  animation: infiniteChevronFlow 2.4s ease-in-out infinite;
  animation-delay: 0.3s;
}

.flow-arrow-svg.active .chevron-3 {
  animation: infiniteChevronFlow 2.4s ease-in-out infinite;
  animation-delay: 0.6s;
}

.flow-arrow-svg.active .chevron-4 {
  animation: infiniteChevronFlow 2.4s ease-in-out infinite;
  animation-delay: 0.9s;
}

/* 垂直箭头的无限循环动画 */
.vertical-arrow-svg.active .chevron-1 {
  animation: infiniteChevronFlow 2.4s ease-in-out infinite;
  animation-delay: 0s;
}

.vertical-arrow-svg.active .chevron-2 {
  animation: infiniteChevronFlow 2.4s ease-in-out infinite;
  animation-delay: 0.3s;
}

.vertical-arrow-svg.active .chevron-3 {
  animation: infiniteChevronFlow 2.4s ease-in-out infinite;
  animation-delay: 0.6s;
}

.vertical-arrow-svg.active .chevron-4 {
  animation: infiniteChevronFlow 2.4s ease-in-out infinite;
  animation-delay: 0.9s;
}

@keyframes infiniteChevronFlow {
  0% {
    opacity: 0.3;
    stroke: #E5E7EB;
    filter: none;
  }
  12.5% {
    opacity: 1;
    stroke: #3B82F6;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
  50% {
    opacity: 1;
    stroke: #3B82F6;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
  62.5% {
    opacity: 0.3;
    stroke: #E5E7EB;
    filter: none;
  }
  100% {
    opacity: 0.3;
    stroke: #E5E7EB;
    filter: none;
  }
}

.up-arrow {
  margin-bottom: 30px;
  align-self: center;
}

.mcp-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mcp-module {
  min-width: 800px;
  min-height: 300px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  padding:24px;
  border-radius: 12px;
}

/* API 模块样式 */
.api-module {
  min-width: 300px;
  min-height: 200px;
}

.api-module .module-content {
  text-align: center;
}

.lets-go-button {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  border: none;
  color: white;
  padding: 16px 32px;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  margin-bottom: 20px;
}

.lets-go-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.lets-go-button:active {
  transform: translateY(0);
}

.api-key-display {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  margin-top: 30px;
}

.api-key-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

/* MCP 市场模块样式 */
.mcp-module {
  min-width: 800px;
  min-height: 300px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border: 1px solid #E2E8F0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.mcp-module.active {
  border-color: #3B82F6;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15), 0 8px 16px rgba(59, 130, 246, 0.1);
  transform: translateY(-4px) scale(1.01);
}

.mcp-module .module-content {
  padding: 20px;
}

.mcp-header {
  margin-bottom: 20px;
}

.mcp-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.plugin-count {
  color: #6B7280;
  font-weight: 500;
}

.selected-count {
  color: #3B82F6;
  font-weight: 600;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F1F5F9;
}

.plugin-grid::-webkit-scrollbar {
  width: 6px;
}

.plugin-grid::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 3px;
}

.plugin-grid::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}

.plugin-grid::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

.plugin-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 60px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.plugin-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #E5E7EB 50%, transparent 100%);
  transition: all 0.3s ease;
}

.plugin-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.12);
  transform: translateY(-2px);
}

.plugin-card:hover::before {
  background: linear-gradient(90deg, transparent 0%, #3B82F6 50%, transparent 100%);
}

.plugin-card.selected {
  border-color: #3B82F6;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  height: auto;
  min-height: 100px;
  padding: 20px;
  box-shadow: 0 12px 28px rgba(59, 130, 246, 0.15);
}

.plugin-card.selected::before {
  animation: pluginFlow 2s ease-in-out infinite;
}

@keyframes pluginFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.plugin-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.plugin-card.selected .plugin-icon {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.plugin-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.plugin-card:not(.selected) .plugin-info {
  flex-direction: row;
}

.plugin-card.selected .plugin-info {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.plugin-name {
  font-weight: 600;
  color: #1F2937;
  font-size: 0.875rem;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.plugin-card.selected .plugin-name {
  margin-bottom: 4px;
  white-space: normal;
  font-size: 1rem;
  color: #1E40AF;
}

.plugin-description {
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0;
  display: block;
  line-height: 1.4;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.plugin-card.selected .plugin-description {
  display: block;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: #4B5563;
  opacity: 1;
}

.plugin-category {
  font-size: 0.625rem;
  color: #9CA3AF;
  background: #F3F4F6;
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-top: 4px;
  white-space: nowrap;
  font-weight: 500;
  transition: all 0.3s ease;
}

.plugin-card.selected .plugin-category {
  display: inline-block;
  background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
  color: #1E40AF;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.plugin-checkbox {
  flex-shrink: 0;
}

.api-key {
  background: #1F2937;
  color: #10B981;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  display: inline-block;
  margin-right: 8px;
  width: calc(100% - 38px)
}

.copy-btn {
  color: #6B7280;
  padding: 4px;
  min-height: auto;
  height: auto;
}

.copy-btn:hover {
  color: #3B82F6;
  background-color: #F3F4F6;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .flow-row {
    flex-direction: column;
    gap: 20px;
  }
  

  
  .mcp-plugins {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }
  
  .flow-module {
    min-width: 240px;
  }
  
  .mcp-plugins {
    grid-template-columns: 1fr;
  }
}



/* 全屏记忆时间线样式 */
.memory-fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: modalFadeIn 0.3s ease-out;
}

.memory-fullscreen-content {
  background: #FFFFFF;
  border-radius: 16px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.memory-fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #E5E7EB;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
}

.memory-fullscreen-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  cursor: pointer;
  font-size: 20px;
  color: #6B7280;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #374151;
}

.memory-timeline {
  padding: 32px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

/* 流程图样式 */
.timeline-flowchart {
  position: relative;
  width: 100%;
}

.flowchart-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
}

.flowchart-node {
  position: relative;
  width: 100%;
  max-width: 400px;
  animation: nodeSlideIn 0.6s ease-out;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border: 2px solid #E2E8F0;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.node-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3B82F6, #60A5FA, #3B82F6);
  background-size: 200% 100%;
  animation: nodeGlow 3s ease-in-out infinite;
}

.node-content:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
  border-color: #3B82F6;
}

.node-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-time {
  font-size: 12px;
  color: #6B7280;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-action {
  font-size: 16px;
  color: #1F2937;
  font-weight: 600;
  line-height: 1.4;
}

/* 节点颜色变化 */
.node-0 .node-content::before {
  background: linear-gradient(90deg, #10B981, #34D399, #10B981);
}

.node-0 .node-icon {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.node-1 .node-content::before {
  background: linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B);
}

.node-1 .node-icon {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.node-2 .node-content::before {
  background: linear-gradient(90deg, #EF4444, #F87171, #EF4444);
}

.node-2 .node-icon {
  background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.node-3 .node-content::before {
  background: linear-gradient(90deg, #8B5CF6, #A78BFA, #8B5CF6);
}

.node-3 .node-icon {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* 连接线样式 */
.flowchart-connector {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 60px;
  z-index: 1;
}

.connector-line {
  width: 100%;
  height: 100%;
}

.animated-path {
  stroke-dasharray: 5, 5;
  animation: pathFlow 2s linear infinite;
}

/* 动画效果 */
@keyframes nodeSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes nodeGlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pathFlow {
  0% {
    stroke-dashoffset: 10;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes connectorPulse {
  0%, 100% {
    opacity: 0.5;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
}
</style>