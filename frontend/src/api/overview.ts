import { http } from '@/utils/http'
import type {
  ApiKey,
  StatsData,
  ChartData,
  McpIntegration,
  ApiResponse,
  GenerateApiKeyRequest,
  UsageChartRequest
} from '@/types/overview'

/**
 * Overview页面API服务
 * 数据流: 前端组件 → API服务 → 后端接口
 */
export const overviewApi = {
  /**
   * 获取统计数据
   */
  async getStats(): Promise<ApiResponse<StatsData[]>> {
    return http.get('/api/overview/stats')
  },

  /**
   * 获取API密钥列表
   */
  async getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    return http.get('/api/overview/api-keys')
  },

  /**
   * 生成新的API密钥
   */
  async generateApiKey(request?: GenerateApiKeyRequest): Promise<ApiResponse<ApiKey>> {
    return http.post('/api/overview/api-keys', request || { name: '默认密钥' })
  },

  /**
   * 重新生成API密钥
   */
  async regenerateApiKey(keyId: string): Promise<ApiResponse<ApiKey>> {
    return http.put(`/api/overview/api-keys/${keyId}/regenerate`)
  },

  /**
   * 删除API密钥
   */
  async deleteApiKey(keyId: string): Promise<ApiResponse<void>> {
    return http.delete(`/api/overview/api-keys/${keyId}`)
  },

  /**
   * 获取使用统计图表数据
   */
  async getUsageChart(timeRange: string): Promise<ApiResponse<ChartData[]>> {
    return http.get('/api/overview/usage-chart', {
      params: { timeRange }
    })
  },

  /**
   * 获取MCP集成列表
   */
  async getMcpIntegrations(): Promise<ApiResponse<McpIntegration[]>> {
    return http.get('/api/overview/mcp-integrations')
  },

  /**
   * 更新MCP集成配置
   */
  async updateMcpIntegration(integrationId: string, config: Record<string, any>): Promise<ApiResponse<McpIntegration>> {
    return http.put(`/api/overview/mcp-integrations/${integrationId}`, { config })
  },

  /**
   * 测试MCP集成连接
   */
  async testMcpIntegration(integrationId: string): Promise<ApiResponse<{ status: string; message: string }>> {
    return http.post(`/api/overview/mcp-integrations/${integrationId}/test`)
  },

  /**
   * 获取代码示例
   */
  async getCodeExamples(): Promise<ApiResponse<any>> {
    return http.get('/api/examples')
  }
}