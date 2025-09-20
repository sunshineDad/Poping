package com.poping.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

/**
 * [文件概览]
 * - 目的: 用户实体类，对应users表
 * - 数据流: 数据库 ↔ 实体对象 ↔ 业务逻辑
 * - 核心数据: 用户基本信息、认证信息、状态管理
 * - 关系: 与UserRole多对多关系，与其他业务实体一对多关系
 */
@TableName("users")
public class User {
    
    /**
     * 物理主键，自增ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    /**
     * 业务主键，UUID格式
     */
    @TableField("user_id")
    private String userId;
    
    /**
     * 用户邮箱，唯一标识
     */
    @TableField("email")
    private String email;
    
    /**
     * 密码哈希值，不返回给前端
     */
    @JsonIgnore
    @TableField("password")
    private String passwordHash;
    
    /**
     * 用户名，可选
     */
    @TableField("username")
    private String username;
    
    /**
     * 头像URL
     */
    @TableField("avatar_url")
    private String avatarUrl;
    
    /**
     * 用户状态：active, inactive, banned
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
    public User() {}
    
    public User(String userId, String email, String passwordHash) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.status = "active";
    }
    
    // Getter和Setter方法
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
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
        return "User{" +
                "id=" + id +
                ", userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", username='" + username + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}