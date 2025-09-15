package com.poping;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * [文件概览]
 * - 目的: Spring Boot应用程序主入口类
 * - 数据流: 启动应用 → 初始化Spring容器 → 加载配置
 * - 核心数据: 应用配置、Bean容器
 * - 关系: 整个应用的启动入口
 */
@SpringBootApplication
public class PopingPlatformApplication {

    /**
     * [函数: main]
     * - 输入: String[] args - 命令行参数
     * - 输出: void
     * - 角色: 应用程序启动入口
     * - 逻辑: 1. 启动Spring Boot应用 2. 初始化所有组件 3. 开始监听请求
     */
    public static void main(String[] args) {
        SpringApplication.run(PopingPlatformApplication.class, args);
    }
}