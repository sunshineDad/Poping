package com.poping.dto;

import javax.validation.constraints.NotBlank;

/**
 * [文件概览]
 * - 目的: 刷新令牌请求DTO，封装令牌刷新所需的参数
 * - 数据流: 前端 → Controller → DTO → Service
 * - 核心数据: 刷新令牌
 * - 关系: 被Controller接收，传递给Service层处理
 */
public class RefreshTokenRequest {
    
    /**
     * 刷新令牌，必填
     */
    @NotBlank(message = "刷新令牌不能为空")
    private String refreshToken;
    
    // 构造函数
    public RefreshTokenRequest() {}
    
    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    // Getter和Setter方法
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    @Override
    public String toString() {
        return "RefreshTokenRequest{refreshToken='[PROTECTED]'}";
    }
}