package com.poping.util;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * [文件概览]
 * - 目的: 统一API响应格式，确保前后端数据交互一致性
 * - 数据流: Controller → ApiResponse → 前端
 * - 核心数据: 响应状态、数据、消息
 * - 关系: 被所有Controller使用的通用响应格式
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    /**
     * 响应状态码
     */
    private Integer code;
    
    /**
     * 响应消息
     */
    private String message;
    
    /**
     * 响应数据
     */
    private T data;
    
    /**
     * 请求是否成功
     */
    private Boolean success;
    
    /**
     * 时间戳
     */
    private Long timestamp;
    
    // 私有构造函数
    private ApiResponse() {
        this.timestamp = System.currentTimeMillis();
    }
    
    private ApiResponse(Integer code, String message, T data, Boolean success) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.success = success;
        this.timestamp = System.currentTimeMillis();
    }
    
    /**
     * [函数: success]
     * - 输入: T data - 响应数据
     * - 输出: ApiResponse<T> - 成功响应对象
     * - 角色: 创建成功响应
     * - 逻辑: 1. 设置成功状态 2. 包装数据 3. 返回响应对象
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "操作成功", data, true);
    }
    
    /**
     * [函数: success]
     * - 输入: String message, T data - 消息和数据
     * - 输出: ApiResponse<T> - 成功响应对象
     * - 角色: 创建带自定义消息的成功响应
     * - 逻辑: 1. 设置成功状态 2. 设置自定义消息 3. 包装数据
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(200, message, data, true);
    }
    
    /**
     * [函数: success]
     * - 输入: 无
     * - 输出: ApiResponse<Void> - 成功响应对象
     * - 角色: 创建无数据的成功响应
     * - 逻辑: 1. 设置成功状态 2. 返回空数据响应
     */
    public static ApiResponse<Void> success() {
        return new ApiResponse<>(200, "操作成功", null, true);
    }
    
    /**
     * [函数: error]
     * - 输入: String message - 错误消息
     * - 输出: ApiResponse<T> - 错误响应对象
     * - 角色: 创建错误响应
     * - 逻辑: 1. 设置错误状态 2. 设置错误消息 3. 返回响应对象
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(500, message, null, false);
    }
    
    /**
     * [函数: error]
     * - 输入: Integer code, String message - 错误码和消息
     * - 输出: ApiResponse<T> - 错误响应对象
     * - 角色: 创建带自定义错误码的错误响应
     * - 逻辑: 1. 设置自定义错误码 2. 设置错误消息 3. 返回响应对象
     */
    public static <T> ApiResponse<T> error(Integer code, String message) {
        return new ApiResponse<>(code, message, null, false);
    }
    
    /**
     * [函数: unauthorized]
     * - 输入: 无
     * - 输出: ApiResponse<Void> - 未授权响应对象
     * - 角色: 创建未授权响应
     * - 逻辑: 1. 设置401状态码 2. 设置未授权消息
     */
    public static ApiResponse<Void> unauthorized() {
        return new ApiResponse<>(401, "未授权访问", null, false);
    }
    
    /**
     * [函数: forbidden]
     * - 输入: 无
     * - 输出: ApiResponse<Void> - 禁止访问响应对象
     * - 角色: 创建禁止访问响应
     * - 逻辑: 1. 设置403状态码 2. 设置禁止访问消息
     */
    public static ApiResponse<Void> forbidden() {
        return new ApiResponse<>(403, "禁止访问", null, false);
    }
    
    /**
     * [函数: notFound]
     * - 输入: 无
     * - 输出: ApiResponse<Void> - 资源不存在响应对象
     * - 角色: 创建资源不存在响应
     * - 逻辑: 1. 设置404状态码 2. 设置资源不存在消息
     */
    public static ApiResponse<Void> notFound() {
        return new ApiResponse<>(404, "资源不存在", null, false);
    }
    
    // Getter和Setter方法
    public Integer getCode() {
        return code;
    }
    
    public void setCode(Integer code) {
        this.code = code;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public Long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}