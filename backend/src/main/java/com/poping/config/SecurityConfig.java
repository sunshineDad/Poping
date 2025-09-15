package com.poping.config;

import com.poping.security.JwtAuthenticationEntryPoint;
import com.poping.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * [文件概览]
 * - 目的: Spring Security安全配置，定义认证授权规则
 * - 数据流: 请求 → Security过滤器链 → JWT验证 → 业务逻辑
 * - 核心数据: 安全规则、JWT过滤器、CORS配置
 * - 关系: 整个应用的安全入口，保护所有API端点
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    /**
     * [函数: passwordEncoder]
     * - 输入: 无
     * - 输出: PasswordEncoder - 密码编码器
     * - 角色: 提供密码加密和验证功能
     * - 逻辑: 1. 创建BCrypt编码器 2. 配置强度 3. 返回实例
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    /**
     * [函数: authenticationManager]
     * - 输入: AuthenticationConfiguration config - 认证配置
     * - 输出: AuthenticationManager - 认证管理器
     * - 角色: 提供认证管理功能
     * - 逻辑: 1. 获取认证管理器 2. 配置认证规则
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    /**
     * [函数: corsConfigurationSource]
     * - 输入: 无
     * - 输出: CorsConfigurationSource - CORS配置源
     * - 角色: 配置跨域访问规则
     * - 逻辑: 1. 创建CORS配置 2. 设置允许的域名和方法 3. 注册路径
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    /**
     * [函数: filterChain]
     * - 输入: HttpSecurity http - HTTP安全配置
     * - 输出: SecurityFilterChain - 安全过滤器链
     * - 角色: 配置HTTP安全规则和过滤器链
     * - 逻辑: 1. 配置CORS和CSRF 2. 设置认证规则 3. 添加JWT过滤器
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 启用CORS，禁用CSRF
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable()
            
            // 配置异常处理
            .exceptionHandling()
            .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .and()
            
            // 设置会话管理为无状态
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            
            // 配置请求授权规则
            .authorizeHttpRequests()
                // 公开端点 - 不需要认证
                .antMatchers("/api/v1/auth/**").permitAll()
                .antMatchers("/api/v1/portal/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/v1/portal/**").permitAll()
                .antMatchers("/ws/**").permitAll()

                // 智能体相关端点 - 允许匿名访问用于测试
                .antMatchers(HttpMethod.GET, "/api/agents/**").permitAll()
                
                // Swagger文档端点
                .antMatchers("/swagger-ui/**").permitAll()
                .antMatchers("/swagger-resources/**").permitAll()
                .antMatchers("/api-docs/**").permitAll()
                .antMatchers("/v3/api-docs/**").permitAll()
                
                // 健康检查端点
                .antMatchers("/actuator/health").permitAll()
                
                // 用户相关端点 - 需要认证
                .antMatchers("/api/v1/users/**").authenticated()
                .antMatchers("/api/v1/agents/**").authenticated()
                .antMatchers("/api/v1/datasets/**").authenticated()
                .antMatchers("/api/v1/subscriptions/**").authenticated()
                
                // 管理员端点 - 需要管理员权限
                .antMatchers("/api/v1/admin/**").hasRole("ADMIN")
                
                // 其他所有请求都需要认证
                .anyRequest().authenticated()
            .and();
        
        // 添加JWT过滤器
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}