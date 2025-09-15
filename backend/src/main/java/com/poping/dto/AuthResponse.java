package com.poping.dto;

/**
 * [文件概览]
 * - 目的: 认证响应DTO，封装登录成功后返回的令牌和用户信息
 * - 数据流: Service → DTO → Controller → 前端
 * - 核心数据: JWT访问令牌、刷新令牌、用户信息
 * - 关系: 被Controller返回给前端，用于客户端存储和后续请求认证
 */
public class AuthResponse {
    
    /**
     * JWT访问令牌
     */
    private String accessToken;
    
    /**
     * JWT刷新令牌
     */
    private String refreshToken;
    
    /**
     * 令牌类型，固定为"Bearer"
     */
    private String tokenType = "Bearer";
    
    /**
     * 访问令牌过期时间（秒）
     */
    private Long expiresIn;
    
    /**
     * 用户信息
     */
    private UserResponse user;
    
    // 构造函数
    public AuthResponse() {}
    
    public AuthResponse(String accessToken, String refreshToken, Long expiresIn, UserResponse user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }
    
    /**
     * [函数: create]
     * - 输入: String accessToken, String refreshToken, Long expiresIn, UserResponse user
     * - 输出: AuthResponse - 认证响应对象
     * - 角色: 静态工厂方法，创建认证响应
     * - 逻辑: 1. 创建AuthResponse对象 2. 设置令牌信息 3. 设置用户信息
     */
    public static AuthResponse create(String accessToken, String refreshToken, Long expiresIn, UserResponse user) {
        return new AuthResponse(accessToken, refreshToken, expiresIn, user);
    }
    
    // Getter和Setter方法
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public String getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    
    public Long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
    
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
    
    @Override
    public String toString() {
        return "AuthResponse{" +
                "tokenType='" + tokenType + '\'' +
                ", expiresIn=" + expiresIn +
                ", user=" + user +
                '}';
    }
}