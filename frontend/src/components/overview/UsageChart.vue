<template>
  <div class="usage-chart">
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载图表数据...</span>
    </div>
    
    <div v-else-if="!hasData" class="chart-empty">
      <div class="empty-icon">
        <ChartIcon class="icon" />
      </div>
      <h4 class="empty-title">暂无数据</h4>
      <p class="empty-description">选择的时间范围内没有调用记录</p>
    </div>
    
    <div v-else class="chart-container">
      <!-- Chart Header -->
      <div class="chart-header">
        <div class="chart-summary">
          <div class="summary-item">
            <span class="summary-label">总调用量</span>
            <span class="summary-value">{{ totalCalls.toLocaleString() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">平均每日</span>
            <span class="summary-value">{{ averageDaily.toLocaleString() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">峰值</span>
            <span class="summary-value">{{ peakValue.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      
      <!-- SVG Chart -->
      <div class="chart-wrapper">
        <svg
          ref="chartSvg"
          :width="chartWidth"
          :height="chartHeight"
          class="chart-svg"
        >
          <!-- Grid Lines -->
          <g class="grid-lines">
            <line
              v-for="(line, index) in gridLines"
              :key="`grid-${index}`"
              :x1="padding.left"
              :y1="line.y"
              :x2="chartWidth - padding.right"
              :y2="line.y"
              class="grid-line"
            />
          </g>
          
          <!-- Y Axis Labels -->
          <g class="y-axis">
            <text
              v-for="(label, index) in yAxisLabels"
              :key="`y-${index}`"
              :x="padding.left - 8"
              :y="label.y + 4"
              class="axis-label"
              text-anchor="end"
            >
              {{ label.text }}
            </text>
          </g>
          
          <!-- Chart Line -->
          <g class="chart-line">
            <path
              :d="linePath"
              class="line-path"
              fill="none"
              :stroke="lineColor"
              stroke-width="2"
            />
            
            <!-- Area Fill -->
            <path
              :d="areaPath"
              class="area-path"
              :fill="areaGradient"
            />
          </g>
          
          <!-- Data Points -->
          <g class="data-points">
            <circle
              v-for="(point, index) in chartPoints"
              :key="`point-${index}`"
              :cx="point.x"
              :cy="point.y"
              :r="4"
              class="data-point"
              :fill="lineColor"
              @mouseenter="showTooltip(point, $event)"
              @mouseleave="hideTooltip"
            />
          </g>
          
          <!-- X Axis Labels -->
          <g class="x-axis">
            <text
              v-for="(label, index) in xAxisLabels"
              :key="`x-${index}`"
              :x="label.x"
              :y="chartHeight - padding.bottom + 16"
              class="axis-label"
              text-anchor="middle"
            >
              {{ label.text }}
            </text>
          </g>
        </svg>
        
        <!-- Tooltip -->
        <div
          v-if="tooltip.visible"
          ref="tooltipEl"
          class="chart-tooltip"
          :style="{
            left: tooltip.x + 'px',
            top: tooltip.y + 'px'
          }"
        >
          <div class="tooltip-date">{{ tooltip.date }}</div>
          <div class="tooltip-value">{{ tooltip.value }} 次调用</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { ChartData, ChartDataPoint } from '@/types/overview'
import { ActivityIcon } from '@/components/icons'

interface Props {
  data: ChartData[]
  timeRange: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Chart dimensions
const chartWidth = 800
const chartHeight = 300
const padding = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 60
}

// Refs
const chartSvg = ref<SVGElement>()
const tooltipEl = ref<HTMLElement>()

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  date: '',
  value: ''
})

// Computed properties
const hasData = computed(() => {
  return props.data.length > 0 && props.data[0]?.data?.length > 0
})

const chartData = computed(() => {
  if (!hasData.value) return []
  return props.data[0].data
})

const lineColor = computed(() => {
  return props.data[0]?.color || '#3B82F6'
})

const areaGradient = computed(() => {
  return `url(#area-gradient-${props.data[0]?.id || 'default'})`
})

const totalCalls = computed(() => {
  return chartData.value.reduce((sum, point) => sum + point.value, 0)
})

const averageDaily = computed(() => {
  if (chartData.value.length === 0) return 0
  return Math.round(totalCalls.value / chartData.value.length)
})

const peakValue = computed(() => {
  return Math.max(...chartData.value.map(point => point.value))
})

const maxValue = computed(() => {
  const max = peakValue.value
  return Math.ceil(max * 1.1) // Add 10% padding
})

const minValue = computed(() => {
  return Math.min(...chartData.value.map(point => point.value))
})

// Chart calculations
const chartPoints = computed(() => {
  if (!hasData.value) return []
  
  const data = chartData.value
  const xStep = (chartWidth - padding.left - padding.right) / (data.length - 1)
  const yRange = chartHeight - padding.top - padding.bottom
  
  return data.map((point, index) => {
    const x = padding.left + index * xStep
    const y = padding.top + yRange - ((point.value - minValue.value) / (maxValue.value - minValue.value)) * yRange
    
    return {
      x,
      y,
      data: point
    }
  })
})

const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  
  let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
  
  for (let i = 1; i < chartPoints.value.length; i++) {
    const point = chartPoints.value[i]
    path += ` L ${point.x} ${point.y}`
  }
  
  return path
})

const areaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  
  const bottomY = chartHeight - padding.bottom
  let path = `M ${chartPoints.value[0].x} ${bottomY}`
  path += ` L ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
  
  for (let i = 1; i < chartPoints.value.length; i++) {
    const point = chartPoints.value[i]
    path += ` L ${point.x} ${point.y}`
  }
  
  path += ` L ${chartPoints.value[chartPoints.value.length - 1].x} ${bottomY}`
  path += ' Z'
  
  return path
})

const gridLines = computed(() => {
  const lines = []
  const yRange = chartHeight - padding.top - padding.bottom
  const steps = 5
  
  for (let i = 0; i <= steps; i++) {
    const y = padding.top + (yRange / steps) * i
    lines.push({ y })
  }
  
  return lines
})

const yAxisLabels = computed(() => {
  const labels = []
  const steps = 5
  const yRange = chartHeight - padding.top - padding.bottom
  
  for (let i = 0; i <= steps; i++) {
    const value = maxValue.value - ((maxValue.value - minValue.value) / steps) * i
    const y = padding.top + (yRange / steps) * i
    
    labels.push({
      y,
      text: Math.round(value).toLocaleString()
    })
  }
  
  return labels
})

const xAxisLabels = computed(() => {
  if (!hasData.value) return []
  
  const data = chartData.value
  const labels = []
  const step = Math.max(1, Math.floor(data.length / 6)) // Show max 6 labels
  
  for (let i = 0; i < data.length; i += step) {
    const point = chartPoints.value[i]
    if (point) {
      labels.push({
        x: point.x,
        text: formatDate(data[i].date)
      })
    }
  }
  
  return labels
})

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const showTooltip = (point: any, event: MouseEvent) => {
  const rect = chartSvg.value?.getBoundingClientRect()
  if (!rect) return
  
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left + 10,
    y: event.clientY - rect.top - 10,
    date: formatDate(point.data.date),
    value: point.data.value.toLocaleString()
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}
</script>

<style scoped>
.usage-chart {
  width: 100%;
  height: 400px;
  position: relative;
}

/* Loading State */
.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: var(--color-gray-600);
}

/* Empty State */
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  background: var(--color-gray-100);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon .icon {
  width: 24px;
  height: 24px;
  color: var(--color-gray-400);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.empty-description {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
  text-align: center;
}

/* Chart Container */
.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 24px;
}

.chart-summary {
  display: flex;
  gap: 32px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-gray-900);
}

/* Chart Wrapper */
.chart-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  height: 100%;
}

/* SVG Styles */
.grid-line {
  stroke: var(--color-gray-200);
  stroke-width: 1;
}

.axis-label {
  font-size: 11px;
  fill: var(--color-gray-500);
  font-family: var(--font-primary);
}

.line-path {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.area-path {
  opacity: 0.1;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 6;
}

/* Tooltip */
.chart-tooltip {
  position: absolute;
  background: var(--color-gray-900);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tooltip-date {
  font-weight: 500;
  margin-bottom: 2px;
}

.tooltip-value {
  font-weight: 600;
  color: var(--color-brand-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-summary {
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>