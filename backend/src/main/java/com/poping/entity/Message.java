package com.poping.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 消息实体类
 */
@TableName("messages")
public class Message {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 会话ID
     */
    @TableField("session_id")
    private Long sessionId;
    
    /**
     * 消息类型：user, assistant, system
     */
    private String type;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 消息元数据JSON
     */
    private String metadata;
    
    /**
     * 消息序号
     */
    @TableField("sequence_number")
    private Integer sequenceNumber;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    public Message() {
    }
    
    public Message(Long sessionId, String type, String content) {
        this.sessionId = sessionId;
        this.type = type;
        this.content = content;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public Integer getSequenceNumber() {
        return sequenceNumber;
    }
    
    public void setSequenceNumber(Integer sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }
    
    public LocalDateTime getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}