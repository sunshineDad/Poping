<template>
  <div class="line-chart">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-value">
        <span class="current-value">{{ currentValue }}</span>
        <span :class="['trend', trendDirection]">
          <svg v-if="trendDirection === 'up'" class="trend-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17l9.2-9.2M17 17V7m0 0H7" />
          </svg>
          <svg v-else class="trend-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 7l-9.2 9.2M7 7v10m0 0h10" />
          </svg>
          {{ trendText }}
        </span>
      </div>
    </div>
    
    <div class="chart-container" ref="chartContainer">
      <svg :width="chartWidth" :height="chartHeight" class="chart-svg">
        <!-- 网格线 -->
        <g class="grid">
          <!-- 水平网格线 -->
          <line
            v-for="(line, index) in horizontalGridLines"
            :key="'h-' + index"
            :x1="padding.left"
            :y1="line.y"
            :x2="chartWidth - padding.right"
            :y2="line.y"
            class="grid-line"
          />
          <!-- 垂直网格线 -->
          <line
            v-for="(line, index) in verticalGridLines"
            :key="'v-' + index"
            :x1="line.x"
            :y1="padding.top"
            :x2="line.x"
            :y2="chartHeight - padding.bottom"
            class="grid-line"
          />
        </g>
        
        <!-- 数据线 -->
        <path
          :d="linePath"
          class="data-line"
          fill="none"
        />
        
        <!-- 数据点 -->
        <circle
          v-for="(point, index) in dataPoints"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          :r="4"
          class="data-point"
          @mouseover="showTooltip($event, point, index)"
          @mouseout="hideTooltip"
        />
        
        <!-- Y轴标签 -->
        <g class="y-axis">
          <text
            v-for="(label, index) in yAxisLabels"
            :key="index"
            :x="padding.left - 10"
            :y="label.y + 4"
            class="axis-label"
            text-anchor="end"
          >
            {{ label.text }}
          </text>
        </g>
        
        <!-- X轴标签 -->
        <g class="x-axis">
          <text
            v-for="(label, index) in xAxisLabels"
            :key="index"
            :x="label.x"
            :y="chartHeight - padding.bottom + 20"
            class="axis-label"
            text-anchor="middle"
          >
            {{ label.text }}
          </text>
        </g>
      </svg>
      
      <!-- 工具提示 -->
      <div
        v-if="tooltip.visible"
        class="tooltip"
        :style="{
          left: tooltip.x + 'px',
          top: tooltip.y + 'px'
        }"
      >
        <div class="tooltip-title">{{ tooltip.title }}</div>
        <div class="tooltip-value">{{ tooltip.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// Props
interface DataPoint {
  label: string
  value: number
  timestamp?: string
}

interface Props {
  title: string
  data: DataPoint[]
  color?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3B82F6',
  height: 200
})

// 响应式数据
const chartContainer = ref<HTMLElement>()
const chartWidth = ref(400)
const chartHeight = computed(() => props.height)
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  value: ''
})

// 图表配置
const padding = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 60
}

// 计算属性
const currentValue = computed(() => {
  if (props.data.length === 0) return '0'
  const latest = props.data[props.data.length - 1]
  return formatValue(latest.value)
})

const trendDirection = computed(() => {
  if (props.data.length < 2) return 'neutral'
  const current = props.data[props.data.length - 1].value
  const previous = props.data[props.data.length - 2].value
  return current > previous ? 'up' : current < previous ? 'down' : 'neutral'
})

const trendText = computed(() => {
  if (props.data.length < 2) return '0%'
  const current = props.data[props.data.length - 1].value
  const previous = props.data[props.data.length - 2].value
  const change = ((current - previous) / previous * 100).toFixed(1)
  return `${Math.abs(Number(change))}%`
})

const dataRange = computed(() => {
  if (props.data.length === 0) return { min: 0, max: 100 }
  const values = props.data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.1 || 10
  return {
    min: Math.max(0, min - padding),
    max: max + padding
  }
})

const dataPoints = computed(() => {
  if (props.data.length === 0) return []
  
  const { min, max } = dataRange.value
  const xStep = (chartWidth.value - padding.left - padding.right) / Math.max(1, props.data.length - 1)
  
  return props.data.map((point, index) => {
    const x = padding.left + (index * xStep)
    const y = padding.top + (chartHeight.value - padding.top - padding.bottom) * (1 - (point.value - min) / (max - min))
    
    return {
      x,
      y,
      originalData: point
    }
  })
})

const linePath = computed(() => {
  if (dataPoints.value.length === 0) return ''
  
  let path = `M ${dataPoints.value[0].x} ${dataPoints.value[0].y}`
  
  for (let i = 1; i < dataPoints.value.length; i++) {
    path += ` L ${dataPoints.value[i].x} ${dataPoints.value[i].y}`
  }
  
  return path
})

const horizontalGridLines = computed(() => {
  const lines = []
  const { min, max } = dataRange.value
  const steps = 5
  
  for (let i = 0; i <= steps; i++) {
    const value = min + (max - min) * (i / steps)
    const y = padding.top + (chartHeight.value - padding.top - padding.bottom) * (1 - i / steps)
    lines.push({ y, value })
  }
  
  return lines
})

const verticalGridLines = computed(() => {
  const lines = []
  const steps = Math.min(6, props.data.length)
  
  for (let i = 0; i <= steps; i++) {
    const x = padding.left + (chartWidth.value - padding.left - padding.right) * (i / steps)
    lines.push({ x })
  }
  
  return lines
})

const yAxisLabels = computed(() => {
  const { min, max } = dataRange.value
  const steps = 5
  const labels = []
  
  for (let i = 0; i <= steps; i++) {
    const value = min + (max - min) * (i / steps)
    const y = padding.top + (chartHeight.value - padding.top - padding.bottom) * (1 - i / steps)
    labels.push({
      y,
      text: formatValue(value)
    })
  }
  
  return labels
})

const xAxisLabels = computed(() => {
  if (props.data.length === 0) return []
  
  const maxLabels = 6
  const step = Math.max(1, Math.floor(props.data.length / maxLabels))
  const labels = []
  
  for (let i = 0; i < props.data.length; i += step) {
    const point = props.data[i]
    const x = padding.left + (chartWidth.value - padding.left - padding.right) * (i / Math.max(1, props.data.length - 1))
    labels.push({
      x,
      text: point.label
    })
  }
  
  return labels
})

// 方法
const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return Math.round(value).toString()
}

const showTooltip = (event: MouseEvent, point: any, index: number) => {
  const rect = chartContainer.value?.getBoundingClientRect()
  if (!rect) return
  
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left + 10,
    y: event.clientY - rect.top - 10,
    title: point.originalData.label,
    value: formatValue(point.originalData.value)
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

const updateChartSize = () => {
  if (chartContainer.value) {
    chartWidth.value = chartContainer.value.clientWidth
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    updateChartSize()
  })
  window.addEventListener('resize', updateChartSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartSize)
})
</script>

<style scoped>
.line-chart {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.chart-value {
  text-align: right;
}

.current-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
}

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
}

.trend.up {
  color: #10B981;
}

.trend.down {
  color: #EF4444;
}

.trend.neutral {
  color: #6B7280;
}

.trend-icon {
  width: 12px;
  height: 12px;
}

.chart-container {
  position: relative;
  width: 100%;
}

.chart-svg {
  width: 100%;
  height: auto;
}

.grid-line {
  stroke: #F3F4F6;
  stroke-width: 1;
}

.data-line {
  stroke: v-bind(color);
  stroke-width: 2;
  fill: none;
}

.data-point {
  fill: v-bind(color);
  stroke: white;
  stroke-width: 2;
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 6;
}

.axis-label {
  font-size: 12px;
  fill: #6B7280;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tooltip {
  position: absolute;
  background: #1F2937;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tooltip-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.tooltip-value {
  font-weight: 700;
  font-size: 14px;
}

/* 黑白主题适配 */
.dark-theme .line-chart {
  background: #FFFFFF;
  border-color: #E5E7EB;
}

.dark-theme .chart-title {
  color: #1F2937;
}

.dark-theme .current-value {
  color: #1F2937;
}
</style>