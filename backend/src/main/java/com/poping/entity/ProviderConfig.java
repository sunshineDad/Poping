package com.poping.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.time.LocalDateTime;

/**
 * [文件概览]
 * - 目的: 供应商配置实体类，对应provider_configs表
 * - 数据流: 数据库 ↔ 实体对象 ↔ 业务逻辑
 * - 核心数据: API配置信息、用户关联
 * - 关系: 与Provider多对一关系，与User多对一关系
 */
@TableName("provider_configs")
public class ProviderConfig {
    
    /**
     * 物理主键，自增ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    /**
     * 业务主键，UUID格式
     */
    @TableField("config_id")
    private String configId;
    
    /**
     * 用户ID，关联users表
     */
    @TableField("user_id")
    private String userId;
    
    /**
     * 供应商ID，关联providers表
     */
    @TableField("provider_id")
    private String providerId;
    
    /**
     * API基础URL
     */
    @TableField("api_url")
    private String apiUrl;
    
    /**
     * API密钥
     */
    @TableField("api_key")
    private String apiKey;
    
    /**
     * 配置状态：active, inactive
     */
    @TableField("status")
    private String status;
    
    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    /**
     * 扩展配置，JSON格式
     */
    @TableField("ext_config")
    private String extConfig;
    
    // 构造函数
    public ProviderConfig() {}
    
    public ProviderConfig(String configId, String userId, String providerId, String apiUrl, String apiKey) {
        this.configId = configId;
        this.userId = userId;
        this.providerId = providerId;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.status = "active";
    }
    
    // Getter和Setter方法
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getConfigId() {
        return configId;
    }
    
    public void setConfigId(String configId) {
        this.configId = configId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
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
        return "ProviderConfig{" +
                "id=" + id +
                ", configId='" + configId + '\'' +
                ", userId='" + userId + '\'' +
                ", providerId='" + providerId + '\'' +
                ", apiUrl='" + apiUrl + '\'' +
                ", apiKey='[PROTECTED]'" +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", extConfig='" + extConfig + '\'' +
                '}';
    }
}