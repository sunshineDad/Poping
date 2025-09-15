<template>
  <div class="stats-card">
    <div class="card-content">
      <div class="card-header">
        <div class="icon-wrapper" :class="`icon-${icon}`">
          <component :is="iconComponent" class="icon" />
        </div>
        <div class="trend-indicator" :class="`trend-${trend}`">
          <TrendUpIcon v-if="trend === 'up'" class="trend-icon" />
          <TrendDownIcon v-if="trend === 'down'" class="trend-icon" />
          <MinusIcon v-if="trend === 'stable'" class="trend-icon" />
          <span class="change-text">{{ formatChange(change) }}</span>
        </div>
      </div>
      
      <div class="card-body">
        <h3 class="card-title">{{ title }}</h3>
        <div class="card-value">{{ formatValue(value) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ApiIcon,
  KeyIcon,
  ChartIcon,
  ServerIcon,
  TrendUpIcon,
  TrendDownIcon,
  MinusIcon
} from '@/components/icons'

interface Props {
  title: string
  value: number | string
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: string
  format?: 'number' | 'currency' | 'percentage'
}

const props = withDefaults(defineProps<Props>(), {
  format: 'number'
})

// Icon mapping
const iconMap = {
  api: ApiIcon,
  key: KeyIcon,
  chart: ChartIcon,
  server: ServerIcon
}

const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap] || ApiIcon
})

const formatValue = (value: number | string): string => {
  if (typeof value === 'string') return value
  
  switch (props.format) {
    case 'currency':
      return `¥${value.toLocaleString()}`
    case 'percentage':
      return `${value}%`
    case 'number':
    default:
      return value.toLocaleString()
  }
}

const formatChange = (change: number): string => {
  const abs = Math.abs(change)
  return `${abs}%`
}
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-200);
  transition: all 0.2s ease;
  overflow: hidden;
}

.stats-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--color-gray-300);
}

.card-content {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrapper.icon-api {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
}

.icon-wrapper.icon-key {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

.icon-wrapper.icon-chart {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
}

.icon-wrapper.icon-server {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
}

.icon {
  width: 24px;
  height: 24px;
  color: white;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.trend-up {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-semantic-success);
}

.trend-down {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.trend-stable {
  background: rgba(156, 163, 175, 0.1);
  color: var(--color-gray-600);
}

.trend-icon {
  width: 12px;
  height: 12px;
}

.change-text {
  font-size: 11px;
  font-weight: 600;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.4;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-content {
    padding: 20px;
  }
  
  .card-value {
    font-size: 28px;
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .icon {
    width: 20px;
    height: 20px;
  }
}
</style>