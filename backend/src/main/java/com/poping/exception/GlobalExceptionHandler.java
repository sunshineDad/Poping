package com.poping.exception;

import com.poping.util.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * [文件概览]
 * - 目的: 全局异常处理器，统一处理应用中的各种异常
 * - 数据流: 异常抛出 → ExceptionHandler → 统一响应格式 → 前端
 * - 核心数据: 异常信息、错误码、错误消息
 * - 关系: 拦截所有Controller抛出的异常，返回统一格式的错误响应
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * [函数: handleValidationExceptions]
     * - 输入: MethodArgumentNotValidException ex - 参数验证异常
     * - 输出: ResponseEntity<ApiResponse<Map<String, String>>> - 验证错误响应
     * - 角色: 处理请求参数验证失败的异常
     * - 逻辑: 1. 提取验证错误信息 2. 构建错误映射 3. 返回详细错误信息
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        logger.warn("参数验证失败: {}", errors);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, "参数验证失败"));
    }
    
    /**
     * [函数: handleBindException]
     * - 输入: BindException ex - 绑定异常
     * - 输出: ResponseEntity<ApiResponse<Map<String, String>>> - 绑定错误响应
     * - 角色: 处理数据绑定失败的异常
     * - 逻辑: 1. 提取绑定错误信息 2. 构建错误映射 3. 返回详细错误信息
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleBindException(BindException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        logger.warn("数据绑定失败: {}", errors);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, "数据绑定失败"));
    }
    
    /**
     * [函数: handleConstraintViolationException]
     * - 输入: ConstraintViolationException ex - 约束违反异常
     * - 输出: ResponseEntity<ApiResponse<Map<String, String>>> - 约束错误响应
     * - 角色: 处理约束验证失败的异常
     * - 逻辑: 1. 提取约束违反信息 2. 构建错误映射 3. 返回详细错误信息
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleConstraintViolationException(
            ConstraintViolationException ex) {
        
        Map<String, String> errors = new HashMap<>();
        Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
        for (ConstraintViolation<?> violation : violations) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }
        
        logger.warn("约束验证失败: {}", errors);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, "约束验证失败"));
    }
    
    /**
     * [函数: handleBadCredentialsException]
     * - 输入: BadCredentialsException ex - 认证失败异常
     * - 输出: ResponseEntity<ApiResponse<Void>> - 认证错误响应
     * - 角色: 处理用户认证失败的异常
     * - 逻辑: 1. 记录认证失败日志 2. 返回统一错误响应
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {
        
        logger.warn("认证失败: {} - {}", ex.getMessage(), request.getDescription(false));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(401, "用户名或密码错误"));
    }
    
    /**
     * [函数: handleAccessDeniedException]
     * - 输入: AccessDeniedException ex - 访问拒绝异常
     * - 输出: ResponseEntity<ApiResponse<Void>> - 权限错误响应
     * - 角色: 处理权限不足的异常
     * - 逻辑: 1. 记录权限拒绝日志 2. 返回统一错误响应
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        
        logger.warn("访问被拒绝: {} - {}", ex.getMessage(), request.getDescription(false));
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, "权限不足，访问被拒绝"));
    }
    
    /**
     * [函数: handleRuntimeException]
     * - 输入: RuntimeException ex - 运行时异常
     * - 输出: ResponseEntity<ApiResponse<Void>> - 业务错误响应
     * - 角色: 处理业务逻辑抛出的运行时异常
     * - 逻辑: 1. 记录业务异常日志 2. 返回业务错误响应
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        
        logger.error("业务异常: {} - {}", ex.getMessage(), request.getDescription(false), ex);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, ex.getMessage()));
    }
    
    /**
     * [函数: handleIllegalArgumentException]
     * - 输入: IllegalArgumentException ex - 非法参数异常
     * - 输出: ResponseEntity<ApiResponse<Void>> - 参数错误响应
     * - 角色: 处理非法参数异常
     * - 逻辑: 1. 记录参数异常日志 2. 返回参数错误响应
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        logger.warn("非法参数: {} - {}", ex.getMessage(), request.getDescription(false));
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, "参数错误: " + ex.getMessage()));
    }
    
    /**
     * [函数: handleGenericException]
     * - 输入: Exception ex - 通用异常
     * - 输出: ResponseEntity<ApiResponse<Void>> - 系统错误响应
     * - 角色: 处理所有未被特定处理器捕获的异常
     * - 逻辑: 1. 记录系统异常日志 2. 返回通用错误响应
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, WebRequest request) {
        
        logger.error("系统异常: {} - {}", ex.getMessage(), request.getDescription(false), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "系统内部错误，请稍后重试"));
    }
}