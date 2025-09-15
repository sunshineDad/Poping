package com.poping.dto;

import com.poping.entity.User;
import java.time.LocalDateTime;

/**
 * [文件概览]
 * - 目的: 用户响应DTO，封装返回给前端的用户信息
 * - 数据流: Service → DTO → Controller → 前端
 * - 核心数据: 用户基本信息（不包含敏感信息）
 * - 关系: 被Controller返回给前端，不包含密码等敏感信息
 */
public class UserResponse {
    
    /**
     * 用户业务ID
     */
    private String userId;
    
    /**
     * 用户邮箱
     */
    private String email;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 头像URL
     */
    private String avatarUrl;
    
    /**
     * 用户状态
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
    
    // 构造函数
    public UserResponse() {}
    
    public UserResponse(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.avatarUrl = user.getAvatarUrl();
        this.status = user.getStatus();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }
    
    /**
     * [函数: fromUser]
     * - 输入: User user - 用户实体对象
     * - 输出: UserResponse - 用户响应DTO
     * - 角色: 静态工厂方法，将User实体转换为响应DTO
     * - 逻辑: 1. 创建UserResponse对象 2. 复制用户信息 3. 返回DTO对象
     */
    public static UserResponse fromUser(User user) {
        return new UserResponse(user);
    }
    
    // Getter和Setter方法
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
    
    @Override
    public String toString() {
        return "UserResponse{" +
                "userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", username='" + username + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}