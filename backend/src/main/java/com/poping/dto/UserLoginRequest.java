package com.poping.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

/**
 * [文件概览]
 * - 目的: 用户登录请求DTO，封装登录所需的参数
 * - 数据流: 前端 → Controller → DTO → Service
 * - 核心数据: 用户登录信息（邮箱、密码）
 * - 关系: 被Controller接收，传递给Service层处理
 */
public class UserLoginRequest {
    
    /**
     * 用户邮箱，必填且格式正确
     */
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    /**
     * 用户密码，必填
     */
    @NotBlank(message = "密码不能为空")
    private String password;
    
    // 构造函数
    public UserLoginRequest() {}
    
    public UserLoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }
    
    // Getter和Setter方法
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    @Override
    public String toString() {
        return "UserLoginRequest{" +
                "email='" + email + '\'' +
                '}';
    }
}