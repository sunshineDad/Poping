package com.poping.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * [文件概览]
 * - 目的: MyBatis-Plus配置类，提供自动填充功能
 * - 数据流: 实体保存/更新时自动填充时间字段
 * - 核心数据: 创建时间、更新时间的自动填充
 * - 关系: 被MyBatis-Plus框架调用
 */
@Configuration
public class MyBatisPlusConfig {
    
    /**
     * 自动填充处理器
     */
    @Component
    public static class AutoFillMetaObjectHandler implements MetaObjectHandler {
        
        /**
         * [函数: insertFill]
         * - 输入: MetaObject metaObject - 元数据对象
         * - 输出: void
         * - 角色: 插入时自动填充字段
         * - 逻辑: 1. 填充创建时间 2. 填充更新时间
         */
        @Override
        public void insertFill(MetaObject metaObject) {
            LocalDateTime now = LocalDateTime.now();
            
            // 填充创建时间字段
            this.strictInsertFill(metaObject, "createdAt", LocalDateTime.class, now);
            this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
            
            // 填充更新时间字段
            this.strictInsertFill(metaObject, "updatedAt", LocalDateTime.class, now);
            this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
        }
        
        /**
         * [函数: updateFill]
         * - 输入: MetaObject metaObject - 元数据对象
         * - 输出: void
         * - 角色: 更新时自动填充字段
         * - 逻辑: 1. 填充更新时间
         */
        @Override
        public void updateFill(MetaObject metaObject) {
            LocalDateTime now = LocalDateTime.now();
            
            // 填充更新时间字段
            this.strictUpdateFill(metaObject, "updatedAt", LocalDateTime.class, now);
            this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, now);
        }
    }
}