<template>
  <div class="dataset-page dark-theme">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">数据集管理</h1>
        <p class="page-subtitle">集中管理数据集，追踪解析进度与文件状态</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="loadDatasets">
          刷新列表
        </button>
        <button class="btn-primary" @click="openCreateDialog">
          <IconComponents name="plus" class="btn-icon" />
          创建数据集
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <IconComponents name="search" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索数据集标题或标签"
          class="search-input"
        />
      </div>

      <div class="filter-controls">
        <select v-model="selectedType" class="filter-select">
          <option value="">所有类型</option>
          <option v-for="item in typeOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>

        <select v-model="selectedStatus" class="filter-select">
          <option value="">所有状态</option>
          <option value="PROCESSING">处理中</option>
          <option value="READY">已就绪</option>
          <option value="FAILED">解析失败</option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="created">创建时间</option>
          <option value="updated">更新时间</option>
          <option value="name">名称</option>
          <option value="size">大小</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载数据集中...</p>
    </div>

    <div v-else-if="datasets.length === 0" class="empty-state">
      <div class="empty-icon">
        <IconComponents name="dataset" size="lg" />
      </div>
      <h3>暂无数据集</h3>
      <p>创建数据集并上传文件，系统会自动保存并解析。</p>
      <button class="btn-primary" @click="openCreateDialog">
        <IconComponents name="plus" class="btn-icon" />
        创建数据集
      </button>
    </div>

    <div v-else class="dataset-grid">
      <div
        v-for="dataset in displayedDatasets"
        :key="dataset.datasetId"
        class="dataset-card"
        @click="openDatasetDetail(dataset)"
      >
        <div class="card-header">
          <div class="dataset-type">
            <IconComponents :name="getTypeIcon(dataset.type)" class="type-icon" />
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
              <IconComponents name="delete" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        上一页
      </button>
      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-number"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
        下一页
      </button>
    </div>

    <div v-if="createDialogVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>创建数据集</h2>
          <button class="modal-close" @click="closeCreateDialog">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input v-model="createForm.title" type="text" placeholder="例如：客户反馈数据集" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea
              v-model="createForm.description"
              rows="3"
              placeholder="简要描述数据集内容，如：2024年客户反馈文本数据，包含情感分析标注"
            ></textarea>
          </div>
          <div class="form-group">
            <label>标签 (最多3个)</label>
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
                :disabled="createForm.tags.length >= 3"
                placeholder="输入标签后按 Enter 添加"
                @keydown.enter.prevent="addTag"
              />
            </div>
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="createForm.type">
              <option v-for="item in typeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>上传文件</label>
            <div class="upload-box">
              <input id="dataset-files" type="file" multiple @change="handleFileChange" />
              <p>支持多文件上传，将文件拖拽或点击此处选择文件</p>
            </div>
            <ul v-if="selectedFiles.length" class="file-list">
              <li v-for="file in selectedFiles" :key="file.name">
                <IconComponents name="docs" class="file-icon" />
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" type="button" @click="closeCreateDialog">取消</button>
          <button class="btn-primary" type="button" :disabled="saving" @click="saveAndParse">
            {{ saving ? '保存中...' : '保存并解析' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="detailVisible" class="detail-overlay">
      <div class="detail-panel">
        <div class="detail-header">
          <div>
            <h2>{{ selectedDataset?.title || '数据集详情' }}</h2>
            <p v-if="selectedProgress" class="detail-progress-text">{{ selectedProgress.message }}</p>
          </div>
          <button class="modal-close" @click="closeDetail">×</button>
        </div>
        <div class="detail-body">
          <div v-if="detailLoading" class="detail-loading">
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
.dataset-page {
  padding: 24px;
  background-color: #f9fafb;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
}

.btn-primary:hover {
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
}

.btn-secondary {
  background: #e0e7ff;
  color: #4338ca;
}

.btn-secondary:hover {
  background: #c7d2fe;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 260px;
  background: #fff;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.04);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #111827;
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  font-size: 14px;
}

.dataset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.dataset-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(17, 24, 39, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid transparent;
}

.dataset-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 25px 50px rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dataset-type {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #eef2ff;
  padding: 6px 12px;
  border-radius: 999px;
  color: #4338ca;
  font-weight: 500;
}

.type-icon {
  width: 16px;
  height: 16px;
}

.dataset-status {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-processing {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
}

.status-ready {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.status-failed {
  background: rgba(248, 113, 113, 0.15);
  color: #dc2626;
}

.dataset-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #111827;
}

.dataset-description {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 12px;
  line-height: 1.5;
  min-height: 42px;
}

.dataset-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-value {
  height: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #4338ca;
  font-weight: 500;
}

.dataset-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.stat-item {
  background: #f9fafb;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.dataset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dataset-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: #e5e7eb;
}

.action-btn.danger {
  color: #dc2626;
  background: rgba(248, 113, 113, 0.15);
}

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.page-btn,
.page-number {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  color: #111827;
}

.page-number.active {
  background: #4f46e5;
  color: #fff;
  border-color: transparent;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 80px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}

.modal {
  width: 100%;
  max-width: 640px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header,
.modal-footer {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  padding: 0 24px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  font-size: 16px;
  color: #4b5563;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  color: #111827;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.tag-editor {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag.selected {
  background: rgba(99, 102, 241, 0.15);
  color: #4338ca;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tag-remove {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
}

.upload-box {
  border: 2px dashed #c7d2fe;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.upload-box input[type='file'] {
  display: block;
  margin: 0 auto 12px;
}

.file-list {
  margin-top: 12px;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f3f4f6;
}

.file-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.file-name {
  flex: 1;
  color: #374151;
}

.file-size {
  color: #6b7280;
  font-size: 12px;
  margin-left: 12px;
}

.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  justify-content: flex-end;
  z-index: 60;
}

.detail-panel {
  width: min(520px, 100%);
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 20px 0 0 20px;
  box-shadow: -20px 0 40px rgba(15, 23, 42, 0.2);
}

.detail-header {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
}

.detail-header h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.detail-progress-text {
  margin: 4px 0 0;
  color: #6366f1;
  font-size: 13px;
}

.detail-body {
  padding: 24px;
  overflow-y: auto;
}

.detail-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 120px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.detail-description {
  color: #4b5563;
  line-height: 1.6;
}

.detail-tags {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.info-item {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
}

.info-value {
  font-weight: 600;
  color: #111827;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
  background: #f9fafb;
  border-radius: 14px;
  overflow: hidden;
}

.file-table th,
.file-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
}

.file-table tbody tr:nth-child(even) {
  background: rgba(99, 102, 241, 0.05);
}

.file-table .actions {
  text-align: right;
}

.text-btn {
  border: none;
  background: transparent;
  color: #6366f1;
  cursor: pointer;
}

.empty-files {
  padding: 16px;
  text-align: center;
  border-radius: 12px;
  background: #f3f4f6;
  color: #6b7280;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .dataset-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
