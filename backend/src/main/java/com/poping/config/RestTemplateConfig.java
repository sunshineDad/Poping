package com.poping.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * [文件概览]
 * - 目的: RestTemplate HTTP客户端配置
 * - 数据流: HTTP请求 → RestTemplate → 外部API服务
 * - 核心数据: HTTP客户端实例
 * - 关系: AIGentsService依赖此配置进行外部API调用
 */
@Configuration
public class RestTemplateConfig {
    
    /**
     * [函数: restTemplate]
     * - 输入: 无
     * - 输出: RestTemplate实例
     * - 角色: 提供HTTP客户端Bean
     * - 逻辑: 1. 创建RestTemplate实例 2. 注册为Spring Bean
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}