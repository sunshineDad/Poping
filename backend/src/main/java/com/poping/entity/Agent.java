package com.poping.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 智能体实体类
 */
@TableName("agent_configs")
public class Agent {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 智能体配置ID（业务主键）
     */
    @TableField("agent_config_id")
    private String agentConfigId;
    
    /**
     * 用户ID
     */
    @TableField("user_id")
    private String userId;
    
    /**
     * 智能体名称
     */
    private String name;
    
    /**
     * 智能体描述
     */
    private String description;
    
    /**
     * 会话配置JSON
     */
    @TableField("session_config")
    private String sessionConfig;
    
    /**
     * 数据集ID
     */
    @TableField("dataset_id")
    private String datasetId;
    
    /**
     * 状态：active, inactive
     */
    private String status;
    
    /**
     * 创建时间
     */
    @TableField("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    /**
     * 是否公开
     */
    @TableField("is_public")
    private Boolean isPublic;
    
    /**
     * 使用次数
     */
    @TableField("usage_count")
    private Integer usageCount;
    
    /**
     * 创建时间（数据库字段）
     */
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    /**
     * 扩展信息
     */
    @TableField("ext_info")
    private String extInfo;
    
    public Agent() {
        this.status = "active";
    }
    
    public Agent(String name, String description) {
        this.name = name;
        this.description = description;
        this.status = "active";
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getAgentConfigId() {
        return agentConfigId;
    }
    
    public void setAgentConfigId(String agentConfigId) {
        this.agentConfigId = agentConfigId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSessionConfig() {
        return sessionConfig;
    }
    
    public void setSessionConfig(String sessionConfig) {
        this.sessionConfig = sessionConfig;
    }
    
    public String getDatasetId() {
        return datasetId;
    }
    
    public void setDatasetId(String datasetId) {
        this.datasetId = datasetId;
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
    
    public String getExtInfo() {
        return extInfo;
    }
    
    public void setExtInfo(String extInfo) {
        this.extInfo = extInfo;
    }
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public Integer getUsageCount() {
        return usageCount;
    }
    
    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }
    
    public LocalDateTime getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}