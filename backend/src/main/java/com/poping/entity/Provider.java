package com.poping.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.time.LocalDateTime;

/**
 * [文件概览]
 * - 目的: 供应商实体类，对应providers表
 * - 数据流: 数据库 ↔ 实体对象 ↔ 业务逻辑
 * - 核心数据: 供应商基本信息、状态管理
 * - 关系: 与ProviderConfig一对多关系
 */
@TableName("providers")
public class Provider {
    
    /**
     * 物理主键，自增ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    /**
     * 业务主键，UUID格式
     */
    @TableField("provider_id")
    private String providerId;
    
    /**
     * 供应商名称，唯一
     */
    @TableField("name")
    private String name;
    
    /**
     * 供应商描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 供应商状态：active, inactive
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
     * 扩展信息，JSON格式
     */
    @TableField("ext_info")
    private String extInfo;
    
    // 构造函数
    public Provider() {}
    
    public Provider(String providerId, String name, String description) {
        this.providerId = providerId;
        this.name = name;
        this.description = description;
        this.status = "active";
    }
    
    // Getter和Setter方法
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getProviderId() {
        return providerId;
    }
    
    public void setProviderId(String providerId) {
        this.providerId = providerId;
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
    
    @Override
    public String toString() {
        return "Provider{" +
                "id=" + id +
                ", providerId='" + providerId + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", extInfo='" + extInfo + '\'' +
                '}';
    }
}