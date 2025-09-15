<template>
  <div class="dataset-page dark-theme">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">数据集管理</h1>
        <p class="page-subtitle">数据集创建、管理和版本控制</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="importDataset">
          <IconComponents name="upload" class="btn-icon" />
          导入数据集
        </button>
        <button class="btn-primary" @click="createDataset">
          <IconComponents name="plus" class="btn-icon" />
          创建数据集
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="search-box">
        <IconComponents name="search" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索数据集名称或描述"
          class="search-input"
        />
      </div>
      
      <div class="filter-controls">
        <select v-model="selectedType" class="filter-select">
          <option value="">所有类型</option>
          <option value="text">文本</option>
          <option value="image">图像</option>
          <option value="audio">音频</option>
          <option value="video">视频</option>
          <option value="table">表格</option>
        </select>
        
        <select v-model="selectedStatus" class="filter-select">
          <option value="">所有状态</option>
          <option value="processing">处理中</option>
          <option value="ready">就绪</option>
          <option value="error">错误</option>
        </select>
        
        <select v-model="sortBy" class="filter-select">
          <option value="created">创建时间</option>
          <option value="updated">更新时间</option>
          <option value="name">名称</option>
          <option value="size">大小</option>
        </select>
      </div>
    </div>

    <!-- 数据集网格 -->
    <div class="dataset-grid" v-if="filteredDatasets.length > 0">
      <div 
        v-for="dataset in filteredDatasets" 
        :key="dataset.id" 
        class="dataset-card"
        @click="viewDataset(dataset)"
      >
        <div class="card-header">
          <div class="dataset-type">
            <IconComponents :name="getTypeIcon(dataset.type)" class="type-icon" />
            <span class="type-label">{{ getTypeLabel(dataset.type) }}</span>
          </div>
          <div class="dataset-status" :class="`status-${dataset.status}`">
            {{ getStatusLabel(dataset.status) }}
          </div>
        </div>
        
        <div class="card-content">
          <h3 class="dataset-name">{{ dataset.name }}</h3>
          <p class="dataset-description">{{ dataset.description }}</p>
          
          <div class="dataset-stats">
            <div class="stat-item">
              <span class="stat-label">记录数</span>
              <span class="stat-value">{{ formatNumber(dataset.recordCount) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">大小</span>
              <span class="stat-value">{{ formatSize(dataset.size) }}</span>
            </div>
          </div>
          
          <div class="dataset-tags" v-if="dataset.tags.length > 0">
            <span v-for="tag in dataset.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        
        <div class="card-footer">
          <div class="dataset-meta">
            <span class="meta-item">{{ formatDate(dataset.updatedAt) }}</span>
            <span class="meta-item">{{ dataset.owner.name }}</span>
          </div>
          
          <div class="card-actions" @click.stop>
            <button class="action-btn" @click="editDataset(dataset)" title="编辑">
              <IconComponents name="edit" />
            </button>
            <button class="action-btn" @click="shareDataset(dataset)" title="分享">
              <IconComponents name="share" />
            </button>
            <button class="action-btn danger" @click="deleteDataset(dataset)" title="删除">
              <IconComponents name="delete" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else-if="datasets.length === 0 && !loading">
      <div class="empty-icon">
        <IconComponents name="dataset" size="lg" />
      </div>
      <h3>暂无数据集</h3>
      <p>您还没有创建任何数据集，点击下方按钮开始创建。</p>
      <button class="btn-primary" @click="createDataset">
        <IconComponents name="plus" class="btn-icon" />
        创建数据集
      </button>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-if="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1" 
        @click="goToPage(currentPage - 1)"
      >
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
      
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages" 
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import IconComponents from '@/components/icons/IconComponents.vue'
import { confirmDialog } from '@/utils/confirm'

// 类型定义
interface Dataset {
  id: string
  name: string
  description: string
  type: 'text' | 'image' | 'audio' | 'video' | 'table'
  status: 'processing' | 'ready' | 'error'
  size: number
  recordCount: number
  tags: string[]
  owner: {
    id: string
    name: string
  }
  permissions: {
    read: boolean
    write: boolean
    share: boolean
  }
  createdAt: string
  updatedAt: string
  lastAccessedAt: string
}

const router = useRouter()

// 响应式数据
const datasets = ref<Dataset[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const sortBy = ref('created')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// 计算属性
const filteredDatasets = computed(() => {
  let filtered = datasets.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(dataset => 
      dataset.name.toLowerCase().includes(query) ||
      dataset.description.toLowerCase().includes(query) ||
      dataset.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // 类型过滤
  if (selectedType.value) {
    filtered = filtered.filter(dataset => dataset.type === selectedType.value)
  }
  
  // 状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(dataset => dataset.status === selectedStatus.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Dataset]
    const bValue = b[sortBy.value as keyof Dataset]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return bValue.localeCompare(aValue)
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return bValue - aValue
    }
    return 0
  })
  
  return filtered
})

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 方法
const loadDatasets = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    datasets.value = [
      {
        id: 'ds_001',
        name: '客户反馈数据集',
        description: '2024年客户反馈文本数据，包含情感分析标注',
        type: 'text',
        status: 'ready',
        size: 1048576,
        recordCount: 5000,
        tags: ['客户服务', '情感分析', '文本'],
        owner: { id: 'user_001', name: '张三' },
        permissions: { read: true, write: true, share: true },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        lastAccessedAt: '2024-01-16T09:15:00Z'
      },
      {
        id: 'ds_002',
        name: '产品图像数据集',
        description: '电商产品图像数据，已完成分类标注',
        type: 'image',
        status: 'processing',
        size: 5242880,
        recordCount: 2000,
        tags: ['电商', '图像分类', '产品'],
        owner: { id: 'user_002', name: '李四' },
        permissions: { read: true, write: false, share: false },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-20T14:20:00Z',
        lastAccessedAt: '2024-01-21T08:45:00Z'
      }
    ]
    
    totalCount.value = datasets.value.length
  } catch (error) {
    console.error('加载数据集失败:', error)
  } finally {
    loading.value = false
  }
}

const createDataset = () => {
  // 跳转到创建数据集页面或打开创建对话框
  console.log('创建数据集')
}

const importDataset = () => {
  // 打开导入数据集对话框
  console.log('导入数据集')
}

const viewDataset = (dataset: Dataset) => {
  // 跳转到数据集详情页面
  router.push(`/datasets/${dataset.id}`)
}

const editDataset = (dataset: Dataset) => {
  // 打开编辑对话框
  console.log('编辑数据集:', dataset.name)
}

const shareDataset = (dataset: Dataset) => {
  // 打开分享对话框
  console.log('分享数据集:', dataset.name)
}

const deleteDataset = async (dataset: Dataset) => {
  // 显示删除确认对话框
  if (await confirmDialog(`确定要删除数据集 "${dataset.name}" 吗？`)) {
    console.log('删除数据集:', dataset.name)
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  loadDatasets()
}

// 工具函数
const getTypeIcon = (type: string) => {
  const icons = {
    text: 'docs',
    image: 'image',
    audio: 'audio',
    video: 'video',
    table: 'table'
  }
  return icons[type as keyof typeof icons] || 'dataset'
}

const getTypeLabel = (type: string) => {
  const labels = {
    text: '文本',
    image: '图像',
    audio: '音频',
    video: '视频',
    table: '表格'
  }
  return labels[type as keyof typeof labels] || type
}

const getStatusLabel = (status: string) => {
  const labels = {
    processing: '处理中',
    ready: '就绪',
    error: '错误'
  }
  return labels[status as keyof typeof labels] || status
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 监听搜索和筛选变化
watch([searchQuery, selectedType, selectedStatus, sortBy], () => {
  currentPage.value = 1
})

// 组件挂载时加载数据
onMounted(() => {
  loadDatasets()
})
</script>

<style scoped>
.dataset-page {
  padding: 24px;
  background-color: #f9fafb;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: #000000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.35);
}

.btn-secondary {
  background-color: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.filter-bar {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  min-width: 120px;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.dataset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.dataset-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.dataset-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #000000 0%, #374151 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.dataset-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.dataset-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.dataset-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #4b5563;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-icon {
  width: 14px;
  height: 14px;
}

.dataset-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-ready {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.status-processing {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.status-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.card-content {
  margin-bottom: 20px;
}

.dataset-name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.dataset-description {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 15px;
}

.dataset-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #6b7280;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-weight: 500;
  color: #9ca3af;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.dataset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 8px;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.meta-item {
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #6b7280;
  position: relative;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
  transform: scale(1.1);
}

.action-btn.danger:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  color: #d1d5db;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.empty-state p {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.page-btn {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background-color: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.page-number:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-number.active {
  background: linear-gradient(135deg, #000000 0%, #374151 100%);
  color: white;
  border-color: #000000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dataset-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .dataset-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .btn-primary,
  .btn-secondary {
    justify-content: center;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-controls {
    justify-content: stretch;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .dataset-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .dataset-card {
    padding: 20px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .card-actions {
    justify-content: flex-end;
  }
  
  .dataset-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .dataset-page {
    padding: 12px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .filter-bar {
    padding: 16px;
  }
  
  .dataset-card {
    padding: 16px;
  }
  
  .dataset-name {
    font-size: 18px;
  }
  
  .page-numbers {
    flex-wrap: wrap;
  }
}
</style>