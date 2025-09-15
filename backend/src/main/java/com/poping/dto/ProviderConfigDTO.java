package com.poping.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * [文件概览]
 * - 目的: 供应商配置数据传输对象
 * - 数据流: 前端请求 → DTO → Service层处理
 * - 核心数据: API配置信息传输
 * - 关系: 用于Controller和Service之间的数据传输
 */
public class ProviderConfigDTO {
    
    /**
     * 配置ID，更新时使用
     */
    private String configId;
    
    /**
     * 供应商ID，必填
     */
    @NotBlank(message = "供应商ID不能为空")
    private String providerId;
    
    /**
     * API基础URL，必填
     */
    @NotBlank(message = "API URL不能为空")
    @Size(max = 500, message = "API URL长度不能超过500字符")
    private String apiUrl;
    
    /**
     * API密钥，必填
     */
    @NotBlank(message = "API Key不能为空")
    @Size(max = 1000, message = "API Key长度不能超过1000字符")
    private String apiKey;
    
    /**
     * 扩展配置，JSON格式
     */
    private String extConfig;
    
    // 构造函数
    public ProviderConfigDTO() {}
    
    public ProviderConfigDTO(String providerId, String apiUrl, String apiKey) {
        this.providerId = providerId;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
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
    
    public String getApiUrl() {
        return apiUrl;
    }
    
    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }
    
    public String getApiKey() {
        return apiKey;
    }
    
    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
    
    public String getExtConfig() {
        return extConfig;
    }
    
    public void setExtConfig(String extConfig) {
        this.extConfig = extConfig;
    }
    
    @Override
    public String toString() {
        return "ProviderConfigDTO{" +
                "configId='" + configId + '\'' +
                ", providerId='" + providerId + '\'' +
                ", apiUrl='" + apiUrl + '\'' +
                ", apiKey='[PROTECTED]'" +
                ", extConfig='" + extConfig + '\'' +
                '}';
    }
}