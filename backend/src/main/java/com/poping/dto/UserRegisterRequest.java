package com.poping.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * [文件概览]
 * - 目的: 用户注册请求DTO，封装注册所需的参数
 * - 数据流: 前端 → Controller → DTO → Service
 * - 核心数据: 用户注册信息（邮箱、密码、用户名）
 * - 关系: 被Controller接收，传递给Service层处理
 */
public class UserRegisterRequest {
    
    /**
     * 用户邮箱，必填且格式正确
     */
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    /**
     * 用户密码，必填且长度符合要求
     */
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在6-20位之间")
    private String password;
    
    /**
     * 用户名，可选
     */
    @Size(max = 50, message = "用户名长度不能超过50位")
    private String username;
    
    // 构造函数
    public UserRegisterRequest() {}
    
    public UserRegisterRequest(String email, String password, String username) {
        this.email = email;
        this.password = password;
        this.username = username;
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
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    @Override
    public String toString() {
        return "UserRegisterRequest{" +
                "email='" + email + '\'' +
                ", username='" + username + '\'' +
                '}';
    }
}