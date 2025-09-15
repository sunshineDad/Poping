package com.poping.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * [文件概览]
 * - 目的: 订阅计划实体类，对应subscription_plans表
 * - 数据流: 数据库 ↔ 实体对象 ↔ 订阅业务逻辑
 * - 核心数据: 计划信息、价格、功能配置
 * - 关系: 与UserSubscription一对多关系
 */
@TableName("subscription_plans")
public class SubscriptionPlan {
    
    /**
     * 物理主键，自增ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    /**
     * 业务主键，UUID格式
     */
    @TableField("plan_id")
    private String planId;
    
    /**
     * 计划名称
     */
    @TableField("plan_name")
    private String planName;
    
    /**
     * 计划描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 价格
     */
    @TableField("price")
    private BigDecimal price;
    
    /**
     * 订阅时长（天）
     */
    @TableField("duration_days")
    private Integer durationDays;
    
    /**
     * 功能配置，JSON格式
     */
    @TableField("features")
    private String features;
    
    /**
     * 计划状态：active, inactive
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
    public SubscriptionPlan() {}
    
    public SubscriptionPlan(String planId, String planName, String description, BigDecimal price, Integer durationDays) {
        this.planId = planId;
        this.planName = planName;
        this.description = description;
        this.price = price;
        this.durationDays = durationDays;
        this.status = "active";
    }
    
    // Getter和Setter方法
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getPlanId() {
        return planId;
    }
    
    public void setPlanId(String planId) {
        this.planId = planId;
    }
    
    public String getPlanName() {
        return planName;
    }
    
    public void setPlanName(String planName) {
        this.planName = planName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Integer getDurationDays() {
        return durationDays;
    }
    
    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }
    
    public String getFeatures() {
        return features;
    }
    
    public void setFeatures(String features) {
        this.features = features;
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
}