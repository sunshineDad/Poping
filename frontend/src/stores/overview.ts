import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiKey, StatsData, ChartData, McpIntegration, CodeExample } from '@/types/overview'
import { overviewApi } from '@/api/overview'

export const useOverviewStore = defineStore('overview', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const apiKeys = ref<ApiKey[]>([])
  const statsData = ref<StatsData[]>([])
  const chartData = ref<Record<string, ChartData[]>>({})
  const mcpIntegrations = ref<McpIntegration[]>([])
  const codeExamples = ref<CodeExample[]>([])

  // Computed
  const hasApiKeys = computed(() => apiKeys.value.length > 0)
  const totalApiCalls = computed(() => {
    return statsData.value.find(stat => stat.id === 'api-calls')?.value || 0
  })

  // Actions
  const loadOverviewData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const [statsResponse, keysResponse, integrationsResponse, examplesResponse] = await Promise.all([
        overviewApi.getStats(),
        overviewApi.getApiKeys(),
        overviewApi.getMcpIntegrations(),
        overviewApi.getCodeExamples()
      ])
      
      statsData.value = statsResponse.data
      apiKeys.value = keysResponse.data
      mcpIntegrations.value = integrationsResponse.data
      codeExamples.value = examplesResponse.data
      
      // Load chart data for default time range
      await loadChartData('7d')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载数据失败'
      console.error('加载概览数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  const loadChartData = async (timeRange: string) => {
    try {
      const response = await overviewApi.getUsageChart(timeRange)
      chartData.value[timeRange] = response.data
    } catch (err) {
      console.error('加载图表数据失败:', err)
    }
  }

  const getChartData = (timeRange: string) => {
    if (!chartData.value[timeRange]) {
      loadChartData(timeRange)
      return []
    }
    return chartData.value[timeRange]
  }

  const generateApiKey = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await overviewApi.generateApiKey()
      apiKeys.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成API Key失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const regenerateApiKey = async (keyId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await overviewApi.regenerateApiKey(keyId)
      const index = apiKeys.value.findIndex(key => key.id === keyId)
      if (index !== -1) {
        apiKeys.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重新生成API Key失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteApiKey = async (keyId: string) => {
    loading.value = true
    error.value = null
    
    try {
      await overviewApi.deleteApiKey(keyId)
      const index = apiKeys.value.findIndex(key => key.id === keyId)
      if (index !== -1) {
        apiKeys.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除API Key失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshStats = async () => {
    try {
      const response = await overviewApi.getStats()
      statsData.value = response.data
    } catch (err) {
      console.error('刷新统计数据失败:', err)
    }
  }

  // MCP集成操作
  const testMcpIntegration = async (integrationId: string) => {
    try {
      const response = await overviewApi.testMcpIntegration(integrationId)
      // 更新集成状态
      const integration = mcpIntegrations.value.find(item => item.id === integrationId)
      if (integration) {
        integration.status = response.data.status as 'connected' | 'disconnected' | 'error'
        integration.lastSync = new Date().toISOString()
      }
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '测试连接失败'
      throw err
    }
  }

  const updateMcpIntegrationConfig = async (integrationId: string, config: Record<string, any>) => {
    try {
      const response = await overviewApi.updateMcpIntegration(integrationId, config)
      // 更新本地配置
      const integration = mcpIntegrations.value.find(item => item.id === integrationId)
      if (integration) {
        integration.config = { ...integration.config, ...config }
      }
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新配置失败'
      throw err
    }
  }

  return {
    // State
    loading,
    error,
    apiKeys,
    statsData,
    chartData,
    mcpIntegrations,
    codeExamples,
    
    // Computed
    hasApiKeys,
    totalApiCalls,
    
    // Actions
    loadOverviewData,
    loadChartData,
    getChartData,
    generateApiKey,
    regenerateApiKey,
    deleteApiKey,
    refreshStats,
    testMcpIntegration,
    updateMcpIntegrationConfig
  }
})