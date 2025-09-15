package com.poping.dto;

import java.time.LocalDateTime;

/**
 * [文件概览]
 * - 目的: 供应商配置响应数据传输对象
 * - 数据流: Service层 → DTO → 前端响应
 * - 核心数据: 供应商配置信息（不含敏感数据）
 * - 关系: 用于Controller向前端返回数据
 */
public class ProviderConfigResponseDTO {
    
    /**
     * 配置ID
     */
    private String configId;
    
    /**
     * 供应商ID
     */
    private String providerId;
    
    /**
     * 供应商名称
     */
    private String providerName;
    
    /**
     * API基础URL
     */
    private String apiUrl;
    
    /**
     * API Key掩码显示
     */
    private String apiKeyMask;
    
    /**
     * 配置状态
     */
    private String status;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 扩展配置
     */
    private String extConfig;
    
    // 构造函数
    public ProviderConfigResponseDTO() {}
    
    public ProviderConfigResponseDTO(String configId, String providerId, String providerName, 
                                   String apiUrl, String apiKeyMask, String status) {
        this.configId = configId;
        this.providerId = providerId;
        this.providerName = providerName;
        this.apiUrl = apiUrl;
        this.apiKeyMask = apiKeyMask;
        this.status = status;
    }
    
    // Getter和Setter方法
    public String getConfigId() {
        return configId;
    }
    
    public void setConfigId(String configId) {
        this.configId = configId;
    }
    
    public String getProviderId() {
        return providerId;
    }
    
    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }
    
    public String getProviderName() {
        return providerName;
    }
    
    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }
    
    public String getApiUrl() {
        return apiUrl;
    }
    
    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }
    
    public String getApiKeyMask() {
        return apiKeyMask;
    }
    
    public void setApiKeyMask(String apiKeyMask) {
        this.apiKeyMask = apiKeyMask;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getExtConfig() {
        return extConfig;
    }
    
    public void setExtConfig(String extConfig) {
        this.extConfig = extConfig;
    }
    
    @Override
    public String toString() {
        return "ProviderConfigResponseDTO{" +
                "configId='" + configId + '\'' +
                ", providerId='" + providerId + '\'' +
                ", providerName='" + providerName + '\'' +
                ", apiUrl='" + apiUrl + '\'' +
                ", apiKeyMask='" + apiKeyMask + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", extConfig='" + extConfig + '\'' +
                '}';
    }
}