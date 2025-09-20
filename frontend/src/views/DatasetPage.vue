<template>
  <div class="page-container">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/overview" class="nav-link">概览</router-link>
        <router-link to="/playground" class="nav-link">Playground</router-link>
        <router-link to="/agents" class="nav-link">智能体</router-link>
        <router-link to="/datasets" class="nav-link active">数据集</router-link>
        <router-link to="/market" class="nav-link">市场</router-link>
      </div>
      <div class="nav-actions">
        <router-link to="/profile" class="nav-link">个人中心</router-link>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">数据集管理</h1>
          <p class="page-subtitle">集中管理数据集，追踪解析进度与文件状态</p>
        </div>
        <button class="btn btn-primary" @click="openCreateDialog">
          <icon-components name="plus" class="btn-icon" />
          创建数据集
        </button>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="search-filters">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索数据集标题、描述或标签..."
            class="search-input"
            @keyup.enter="performSearch"
          />
          <button class="search-btn" @click="performSearch">
            <SimpleIcon />
          </button>
        </div>
        <div class="filter-group">
          <select v-model="selectedType" class="filter-select">
            <option value="">所有类型</option>
            <option v-for="item in typeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <select v-model="selectedStatus" class="filter-select">
            <option value="">所有状态</option>
            <option value="PENDING">待处理</option>
            <option value="PROCESSING">处理中</option>
            <option value="COMPLETED">已完成</option>
            <option value="FAILED">失败</option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="created">按创建时间</option>
            <option value="updated">按更新时间</option>
            <option value="name">按名称</option>
            <option value="size">按大小</option>
          </select>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载数据集中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="datasets.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h3 class="empty-title">暂无数据集</h3>
          <p class="empty-description">创建数据集并上传文件，系统会自动保存并解析。</p>
          <button class="btn btn-primary" @click="openCreateDialog">
            <icon-components name="plus" class="btn-icon" />
            创建数据集
          </button>
        </div>

        <!-- 数据集网格 -->
        <div v-else class="datasets-grid">
          <div
            v-for="dataset in displayedDatasets"
            :key="dataset.datasetId"
            class="dataset-card"
            @click="openDatasetDetail(dataset)"
          >
            <div class="card-header">
              <div class="dataset-type">
                <icon-components :name="getTypeIcon(dataset.type)" class="type-icon" />
                <span class="type-label">{{ getTypeLabel(dataset.type) }}</span>
              </div>
              <div class="dataset-status" :class="statusClass(dataset.status)">
                {{ statusLabel(dataset.status) }}
              </div>
            </div>

            <div class="card-content">
              <h3 class="dataset-name">{{ dataset.title }}</h3>
              <p class="dataset-description">{{ dataset.description || '暂无描述信息' }}</p>

              <div v-if="dataset.status === 'PROCESSING'" class="dataset-progress">
                <div class="progress-track">
                  <div class="progress-value" :style="{ width: dataset.parseProgress + '%' }"></div>
                </div>
                <span class="progress-text">{{ dataset.parseProgress }}%</span>
              </div>

              <div class="dataset-stats">
                <div class="stat-item">
                  <span class="stat-label">记录数</span>
                  <span class="stat-value">{{ formatNumber(dataset.recordCount) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">文件数</span>
                  <span class="stat-value">{{ dataset.fileCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">大小</span>
                  <span class="stat-value">{{ formatSize(dataset.totalSize) }}</span>
                </div>
              </div>

              <div v-if="dataset.tags?.length" class="dataset-tags">
                <span v-for="tag in dataset.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>

            <div class="card-footer" @click.stop>
              <div class="dataset-meta">
                <span class="meta-item">创建于 {{ formatDate(dataset.createdAt) }}</span>
                <span class="meta-item">更新于 {{ formatDate(dataset.updatedAt) }}</span>
              </div>
              <div class="card-actions">
                <button class="action-btn danger" @click="handleDelete(dataset)">
                  <icon-components name="delete" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="pagination-button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            上一页
          </button>
          <div class="pagination-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="pagination-button"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <button class="pagination-button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            下一页
          </button>
        </div>
      </div>
    </main>

    <!-- 创建数据集模态框 -->
    <div v-if="createDialogVisible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">创建数据集</h2>
          <button class="modal-close" @click="closeCreateDialog">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">标题</label>
            <input 
              v-model="createForm.title" 
              type="text" 
              class="form-input"
              placeholder="例如：客户反馈数据集" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea
              v-model="createForm.description"
              class="form-textarea"
              rows="3"
              placeholder="简要描述数据集内容，如：2024年客户反馈文本数据，包含情感分析标注"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">标签 (最多3个)</label>
            <div class="tag-editor">
              <div class="selected-tags">
                <span v-for="(tag, index) in createForm.tags" :key="tag" class="tag selected">
                  {{ tag }}
                  <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
                </span>
              </div>
              <input
                v-model="tagInput"
                type="text"
                class="tag-input"
                :disabled="createForm.tags.length >= 3"
                placeholder="输入标签后按 Enter 添加"
                @keydown.enter.prevent="addTag"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">类型</label>
            <select v-model="createForm.type" class="form-select">
              <option v-for="item in typeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">上传文件</label>
            <div class="upload-area">
              <input id="dataset-files" type="file" multiple @change="handleFileChange" class="upload-input" />
              <div class="upload-content">
                <icon-components name="upload" class="upload-icon" />
                <p class="upload-text">支持多文件上传，将文件拖拽或点击此处选择文件</p>
              </div>
            </div>
            
            <ul v-if="selectedFiles.length" class="file-list">
              <li v-for="file in selectedFiles" :key="file.name" class="file-item">
                <icon-components name="docs" class="file-icon" />
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" @click="closeCreateDialog">取消</button>
          <button class="btn btn-primary" type="button" :disabled="saving" @click="saveAndParse">
            {{ saving ? '保存中...' : '保存并解析' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 数据集详情模态框 -->
    <div v-if="detailVisible" class="modal-overlay">
      <div class="modal-content large">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">{{ selectedDataset?.title || '数据集详情' }}</h2>
            <p v-if="selectedProgress" class="detail-progress-text">{{ selectedProgress.message }}</p>
          </div>
          <button class="modal-close" @click="closeDetail">×</button>
        </div>
        <div class="modal-body">
          <div v-if="detailLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载详情...</p>
          </div>
          <div v-else-if="selectedDataset" class="detail-content">
            <section class="detail-section">
              <h3>基础信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">状态</span>
                  <span class="info-value">{{ statusLabel(selectedDataset.status) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">解析进度</span>
                  <span class="info-value">{{ selectedDataset.parseProgress }}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">类型</span>
                  <span class="info-value">{{ getTypeLabel(selectedDataset.type) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">文件数量</span>
                  <span class="info-value">{{ selectedDataset.fileCount }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">记录数量</span>
                  <span class="info-value">{{ formatNumber(selectedDataset.recordCount) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">总大小</span>
                  <span class="info-value">{{ formatSize(selectedDataset.totalSize) }}</span>
                </div>
              </div>
              <p class="detail-description">{{ selectedDataset.description || '暂无描述信息' }}</p>
              <div v-if="selectedDataset.tags?.length" class="detail-tags">
                <span v-for="tag in selectedDataset.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </section>

            <section class="detail-section">
              <h3>文件列表</h3>
              <div v-if="selectedDataset.files.length === 0" class="empty-files">暂无上传文件</div>
              <table v-else class="file-table">
                <thead>
                  <tr>
                    <th>文件名称</th>
                    <th>类型</th>
                    <th>大小</th>
                    <th>状态</th>
                    <th class="actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="file in selectedDataset.files" :key="file.fileId">
                    <td>{{ file.originalName }}</td>
                    <td>{{ file.fileType || '未知' }}</td>
                    <td>{{ formatSize(file.fileSize) }}</td>
                    <td>{{ file.status }}</td>
                    <td class="actions">
                      <button class="text-btn" @click="previewFile(file)">预览</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import IconComponents from '@/components/icons/IconComponents.vue'
import SimpleIcon from '@/components/SimpleIcon.vue'
import { confirmDialog } from '@/utils/confirm'
import toast from '@/utils/toast'
import { createDataset, fetchDatasetDetail, fetchDatasets, removeDataset } from '@/api/dataset'
import type {
  CreateDatasetPayload,
  DatasetDetail,
  DatasetFile,
  DatasetProgressMessage,
  DatasetSummary,
} from '@/types/dataset'

const datasets = ref<DatasetSummary[]>([])
const loading = ref(false)
const detailLoading = ref(false)
const saving = ref(false)

const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const sortBy = ref<'created' | 'updated' | 'name' | 'size'>('created')

const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)

const createDialogVisible = ref(false)
const tagInput = ref('')
const selectedFiles = ref<File[]>([])
const createForm = reactive<CreateDatasetPayload>({
  title: '',
  description: '',
  type: 'text',
  tags: [],
})

const detailVisible = ref(false)
const selectedDataset = ref<DatasetDetail | null>(null)

const progressMessages = reactive<Record<string, DatasetProgressMessage>>({})
const websocket = ref<WebSocket | null>(null)
let reconnectTimer: number | undefined
let searchTimer: number | undefined

const typeOptions = [
  { label: '文本', value: 'text' },
  { label: '图像', value: 'image' },
  { label: '音频', value: 'audio' },
  { label: '视频', value: 'video' },
  { label: '表格', value: 'table' },
]

const displayedDatasets = computed(() => {
  let list = [...datasets.value]

  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    list = list.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        (item.description || '').toLowerCase().includes(keyword) ||
        (item.tags || []).some((tag) => tag.toLowerCase().includes(keyword))
      )
    })
  }

  if (selectedType.value) {
    list = list.filter((item) => item.type === selectedType.value)
  }

  if (selectedStatus.value) {
    list = list.filter((item) => item.status === selectedStatus.value)
  }

  switch (sortBy.value) {
    case 'created':
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'updated':
      return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    case 'name':
      return list.sort((a, b) => a.title.localeCompare(b.title))
    case 'size':
      return list.sort((a, b) => b.totalSize - a.totalSize)
    default:
      return list
  }
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalCount.value / pageSize.value))
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let page = start; page <= end; page++) {
    pages.push(page)
  }
  return pages
})

const selectedProgress = computed(() => {
  if (!selectedDataset.value) {
    return null
  }
  return progressMessages[selectedDataset.value.datasetId] || null
})

async function loadDatasets() {
  loading.value = true
  try {
    const response = await fetchDatasets({
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchQuery.value || undefined,
      type: selectedType.value || undefined,
      status: selectedStatus.value || undefined,
    })
    datasets.value = response.data.items
    totalCount.value = response.data.total
  } catch (error) {
    console.error('加载数据集失败', error)
    toast.error('加载数据集失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function performSearch() {
  currentPage.value = 1
  loadDatasets()
}

function openCreateDialog() {
  createDialogVisible.value = true
}

function closeCreateDialog() {
  createDialogVisible.value = false
  resetCreateForm()
}

function resetCreateForm() {
  createForm.title = ''
  createForm.description = ''
  createForm.type = 'text'
  createForm.tags = []
  tagInput.value = ''
  selectedFiles.value = []
}

function addTag() {
  const value = tagInput.value.trim()
  if (!value || createForm.tags.includes(value) || createForm.tags.length >= 3) {
    return
  }
  createForm.tags.push(value)
  tagInput.value = ''
}

function removeTag(index: number) {
  createForm.tags.splice(index, 1)
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

async function saveAndParse() {
  if (!createForm.title.trim()) {
    toast.warning('请填写数据集标题')
    return
  }
  if (!createForm.tags.length) {
    toast.warning('请至少添加一个标签')
    return
  }
  if (!selectedFiles.value.length) {
    toast.warning('请上传至少一个数据文件')
    return
  }

  saving.value = true
  try {
    const payload: CreateDatasetPayload = {
      title: createForm.title,
      description: createForm.description,
      type: createForm.type,
      tags: [...createForm.tags],
    }
    const response = await createDataset(payload, selectedFiles.value)
    const summary = toSummary(response.data)
    datasets.value = [summary, ...datasets.value]
    totalCount.value += 1
    toast.success('数据集创建成功，正在解析文件')
    closeCreateDialog()
    currentPage.value = 1
    await loadDatasets()
  } catch (error) {
    console.error('创建数据集失败', error)
    toast.error('创建数据集失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

async function openDatasetDetail(dataset: DatasetSummary) {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const response = await fetchDatasetDetail(dataset.datasetId)
    selectedDataset.value = response.data
  } catch (error) {
    console.error('获取数据集详情失败', error)
    toast.error('获取数据集详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  detailVisible.value = false
  selectedDataset.value = null
}

async function handleDelete(dataset: DatasetSummary) {
  if (!(await confirmDialog(`确认删除数据集 “${dataset.title}” 吗？`))) {
    return
  }
  try {
    await removeDataset(dataset.datasetId)
    toast.success('数据集已删除')
    await loadDatasets()
  } catch (error) {
    console.error('删除数据集失败', error)
    toast.error('删除数据集失败，请稍后再试')
  }
}

function previewFile(file: DatasetFile) {
  console.log('预览文件', file.fileId)
  toast.info('预览功能正在开发中')
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) {
    return
  }
  currentPage.value = page
  loadDatasets()
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PROCESSING: '处理中',
    READY: '已就绪',
    FAILED: '解析失败',
    DELETED: '已删除',
  }
  return labels[status] || status
}

function statusClass(status: string) {
  return `status-${status.toLowerCase()}`
}

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    text: 'docs',
    image: 'image',
    audio: 'audio',
    video: 'video',
    table: 'table',
  }
  return icons[type] || 'dataset'
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    text: '文本',
    image: '图像',
    audio: '音频',
    video: '视频',
    table: '表格',
  }
  return labels[type] || type
}

function formatNumber(num: number) {
  return Number.isFinite(num) ? num.toLocaleString() : '0'
}

function formatSize(bytes: number) {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`
}

function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

function toSummary(detail: DatasetDetail): DatasetSummary {
  const { files, ...rest } = detail
  return rest
}

function handleProgressMessage(message: DatasetProgressMessage) {
  progressMessages[message.datasetId] = message
  const index = datasets.value.findIndex((item) => item.datasetId === message.datasetId)
  if (index !== -1) {
    datasets.value[index] = {
      ...datasets.value[index],
      status: message.status,
      parseProgress: message.progress,
      updatedAt: message.timestamp,
    }
    datasets.value = [...datasets.value]
  }
  if (selectedDataset.value && selectedDataset.value.datasetId === message.datasetId) {
    selectedDataset.value = {
      ...selectedDataset.value,
      status: message.status,
      parseProgress: message.progress,
      updatedAt: message.timestamp,
    }
  }
}

function connectWebSocket() {
  const baseUrl = (import.meta.env.VITE_WS_BASE_URL as string | undefined) ?? ''
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const url = baseUrl || `${protocol}://${window.location.host}/ws/datasets`

  websocket.value = new WebSocket(url)

  websocket.value.onopen = () => {
    websocket.value?.send(JSON.stringify({ type: 'subscribe', datasetId: '*' }))
  }

  websocket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as DatasetProgressMessage
      handleProgressMessage(data)
    } catch (error) {
      console.warn('解析进度消息失败', error)
    }
  }

  websocket.value.onclose = () => {
    websocket.value = null
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }
    reconnectTimer = window.setTimeout(connectWebSocket, 3000)
  }

  websocket.value.onerror = () => {
    websocket.value?.close()
  }
}

function cleanupWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
  if (websocket.value) {
    websocket.value.close()
    websocket.value = null
  }
}

onMounted(() => {
  loadDatasets()
  connectWebSocket()
})

onBeforeUnmount(() => {
  cleanupWebSocket()
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

watch([selectedType, selectedStatus], () => {
  currentPage.value = 1
  loadDatasets()
})

watch(
  () => searchQuery.value,
  () => {
    currentPage.value = 1
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = window.setTimeout(() => {
      loadDatasets()
    }, 400)
  },
)
</script>

<style scoped>
/* 页面基础样式 */
.dataset-page {
  min-height: 100vh;
  background: #ffffff;
  padding: 24px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 32px;
}

.search-container {
  max-width: 600px;
}

.nav-search {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  background: #FFFFFF;
  color: #1F2937;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #000000;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-btn {
  padding: 12px;
  background: #000000;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #1F2937;
}

.search-icon {
  width: 20px;
  height: 20px;
}

/* 内容区域 */
.content-area {
  min-height: 400px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #111827;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 400px;
}

/* 数据集网格 */
.dataset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 数据集卡片 */
.dataset-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dataset-card:hover {
  border-color: #111827;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.dataset-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.type-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.dataset-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dataset-status.processing {
  background: #f3f4f6;
  color: #374151;
}

.dataset-status.ready {
  background: #111827;
  color: #ffffff;
}

.dataset-status.failed {
  background: #ef2f2;
  color: #dc2626;
}

.card-content {
  flex: 1;
  margin-bottom: 16px;
}

.dataset-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.dataset-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 进度条 */
.dataset-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.progress-value {
  height: 100%;
  background: #111827;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  min-width: 40px;
}

/* 统计信息 */
.dataset-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

/* 标签 */
.dataset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 8px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.tag.selected {
  background-color: #eff6ff;
  color: #3b82f6;
  position: relative;
  padding-right: 28px;
}

.tag-remove {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.dataset-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  font-size: 12px;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.danger:hover {
  background: #ef2f2;
  color: #dc2626;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 48px;
}

.pagination-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination-button.active {
  background-color: #3b82f6;
  border-color: #3B82F6;
  color: #ffffff;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
}

/* 按钮样式 */
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
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
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content.large {
  max-width: 900px;
}

.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  background-color: #ffffff;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 标签编辑器 */
.tag-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px;
  background-color: #ffffff;
  min-height: 48px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-editor:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-input {
  border: none;
  outline: none;
  flex: 1;
  min-width: 120px;
  padding: 4px 8px;
  font-size: 14px;
}

.tag-input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
}

/* 文件上传 */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  background-color: #fafafa;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f8faff;
}

.upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.upload-text {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.file-item:last-child {
  border-bottom: none;
}

.file-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.file-size {
  font-size: 12px;
  color: #9ca3af;
}

/* 详情内容 */
.detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.detail-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-progress-text {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.empty-files {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 32px;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.file-table th,
.file-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.file-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.file-table td {
  font-size: 14px;
  color: #6b7280;
}

.file-table tr:last-child td {
  border-bottom: none;
}

.file-table .actions {
  width: 100px;
  text-align: center;
}

.text-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.text-btn:hover {
  background-color: #eff6ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-filters {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-group {
    justify-content: stretch;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .datasets-grid {
    grid-template-columns: 1fr;
  }
  
  .dataset-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .nav-links {
    gap: 16px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .modal-content {
    margin: 10px;
    max-width: none;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 16px;
    flex-wrap: wrap;
    height: auto;
    min-height: 64px;
  }
  
  .nav-links {
    order: 2;
    width: 100%;
    justify-content: space-around;
    padding-top: 8px;
  }
  
  .nav-actions {
    order: 1;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .dataset-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .modal-header {
    padding: 16px 16px 0 16px;
  }
  
  .modal-body {
    padding: 0 16px;
  }
  
  .modal-footer {
    padding: 16px;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
