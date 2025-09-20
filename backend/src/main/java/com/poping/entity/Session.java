package com.poping.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 会话实体类
 */
@TableName("chat_sessions")
public class Session {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * AIGents会话ID
     */
    @TableField("external_session_id")
    private String aigentsSessionId;
    
    /**
     * 会话标题
     */
    private String title;
    
    /**
     * 用户ID
     */
    @TableField("user_id")
    private String userId;
    
    /**
     * 智能体ID
     */
    @TableField("agent_config_id")
    private Long agentId;
    
    /**
     * 会话状态：active, ended, archived
     */
    private String status;
    
    /**
     * 消息数量 - 数据库中没有此字段，移除映射
     */
    @TableField(exist = false)
    private Integer messageCount;
    
    /**
     * 最后活动时间 - 使用updated_at字段
     */
    @TableField("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastActivity;
    
    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
    
    public Session() {
        this.messageCount = 0;
        this.status = "active";
        this.lastActivity = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getAigentsSessionId() {
        return aigentsSessionId;
    }
    
    public void setAigentsSessionId(String aigentsSessionId) {
        this.aigentsSessionId = aigentsSessionId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public Long getAgentId() {
        return agentId;
    }
    
    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Integer getMessageCount() {
        return messageCount;
    }
    
    public void setMessageCount(Integer messageCount) {
        this.messageCount = messageCount;
    }
    
    public LocalDateTime getLastActivity() {
        return lastActivity;
    }
    
    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }
    
    public LocalDateTime getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
    
    public LocalDateTime getUpdateTime() {
        return updateTime;
    }
    
    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}