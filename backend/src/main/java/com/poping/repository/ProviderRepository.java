package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.poping.entity.Provider;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

/**
 * [文件概览]
 * - 目的: 供应商数据访问层接口
 * - 数据流: Service层 → Repository → 数据库
 * - 核心数据: Provider实体CRUD操作
 * - 关系: 继承MyBatis-Plus BaseMapper
 */
@Mapper
public interface ProviderRepository extends BaseMapper<Provider> {
    
    /**
     * [函数: findByName]
     * - 输入: String name - 供应商名称
     * - 输出: Provider - 供应商实体
     * - 角色: 根据名称查找供应商
     * - 逻辑: 1. 执行SQL查询 2. 返回匹配结果
     */
    @Select("SELECT * FROM providers WHERE name = #{name} AND status = 'active'")
    Provider findByName(String name);
    
    /**
     * [函数: findByProviderId]
     * - 输入: String providerId - 供应商业务ID
     * - 输出: Provider - 供应商实体
     * - 角色: 根据业务ID查找供应商
     * - 逻辑: 1. 执行SQL查询 2. 返回匹配结果
     */
    @Select("SELECT * FROM providers WHERE provider_id = #{providerId} AND status = 'active'")
    Provider findByProviderId(String providerId);
    
    /**
     * [函数: findAllActive]
     * - 输入: 无
     * - 输出: List<Provider> - 活跃供应商列表
     * - 角色: 获取所有活跃供应商
     * - 逻辑: 1. 查询状态为active的供应商 2. 按创建时间排序
     */
    @Select("SELECT * FROM providers WHERE status = 'active' ORDER BY created_at DESC")
    List<Provider> findAllActive();
}