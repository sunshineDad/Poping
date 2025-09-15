package com.poping.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.poping.util.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * [文件概览]
 * - 目的: JWT认证入口点，处理未认证请求的响应
 * - 数据流: 未认证请求 → AuthenticationEntryPoint → 返回401响应
 * - 核心数据: 错误响应、HTTP状态码
 * - 关系: 被Spring Security调用，处理认证失败情况
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * [函数: commence]
     * - 输入: HttpServletRequest request, HttpServletResponse response, AuthenticationException authException
     * - 输出: void
     * - 角色: 处理认证失败的请求，返回统一的错误响应
     * - 逻辑: 1. 设置响应状态码 2. 构建错误响应 3. 返回JSON格式错误信息
     */
    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        // 设置响应状态码和内容类型
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        
        // 构建错误响应
        ApiResponse<Void> errorResponse = ApiResponse.error(401, "未授权访问，请先登录");
        
        // 写入响应
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }
}