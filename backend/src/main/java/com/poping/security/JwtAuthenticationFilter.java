package com.poping.security;

import com.poping.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * [文件概览]
 * - 目的: JWT认证过滤器，验证每个请求的JWT令牌
 * - 数据流: 请求 → 提取JWT → 验证令牌 → 设置认证上下文
 * - 核心数据: JWT令牌、用户认证信息、权限列表
 * - 关系: 在Spring Security过滤器链中执行，为每个请求提供认证
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * [函数: doFilterInternal]
     * - 输入: HttpServletRequest request, HttpServletResponse response, FilterChain filterChain
     * - 输出: void
     * - 角色: 过滤器核心方法，处理JWT认证逻辑
     * - 逻辑: 1. 提取JWT令牌 2. 验证令牌有效性 3. 设置认证上下文 4. 继续过滤器链
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // 从请求头中提取JWT令牌
            String jwt = getJwtFromRequest(request);
            
            // 如果令牌存在且有效，设置认证上下文
            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt)) {
                String userId = jwtUtil.getUserIdFromToken(jwt);
                String email = jwtUtil.getEmailFromToken(jwt);
                
                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // 创建认证对象
                    List<SimpleGrantedAuthority> authorities = getAuthoritiesFromToken(jwt);
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 设置认证上下文
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    // 在请求属性中设置用户信息，便于Controller使用
                    request.setAttribute("userId", userId);
                    request.setAttribute("email", email);
                }
            }
        } catch (Exception ex) {
            // 记录异常但不阻断请求，让Spring Security处理
            logger.error("无法设置用户认证信息", ex);
        }
        
        // 继续过滤器链
        filterChain.doFilter(request, response);
    }
    
    /**
     * [函数: getJwtFromRequest]
     * - 输入: HttpServletRequest request - HTTP请求
     * - 输出: String - JWT令牌
     * - 角色: 从请求头中提取JWT令牌
     * - 逻辑: 1. 获取Authorization头 2. 检查Bearer前缀 3. 提取令牌
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    /**
     * [函数: getAuthoritiesFromToken]
     * - 输入: String jwt - JWT令牌
     * - 输出: List<SimpleGrantedAuthority> - 权限列表
     * - 角色: 从JWT令牌中提取用户权限
     * - 逻辑: 1. 解析令牌 2. 提取权限信息 3. 构建权限列表
     */
    private List<SimpleGrantedAuthority> getAuthoritiesFromToken(String jwt) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        // 这里可以从JWT中提取角色信息，或者从数据库查询
        // 暂时给所有认证用户分配基础权限
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        // TODO: 根据实际需求从数据库或JWT中获取用户角色
        // String userId = jwtUtil.getUserIdFromToken(jwt);
        // List<UserRole> userRoles = userRoleService.getUserRoles(userId);
        // for (UserRole role : userRoles) {
        //     authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleName().toUpperCase()));
        // }
        
        return authorities;
    }
    
    /**
     * [函数: shouldNotFilter]
     * - 输入: HttpServletRequest request - HTTP请求
     * - 输出: boolean - 是否跳过过滤
     * - 角色: 判断是否需要跳过JWT验证
     * - 逻辑: 1. 检查请求路径 2. 判断是否为公开端点 3. 返回是否跳过
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // 跳过认证的路径
        return path.startsWith("/api/v1/auth/") ||
               path.startsWith("/api/v1/portal/") ||
               path.startsWith("/swagger-ui/") ||
               path.startsWith("/api-docs/") ||
               path.startsWith("/v3/api-docs/") ||
               path.equals("/actuator/health");
    }
}