package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.poping.entity.ProviderConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import java.util.List;

/**
 * [文件概览]
 * - 目的: 供应商配置数据访问层接口
 * - 数据流: Service层 → Repository → 数据库
 * - 核心数据: ProviderConfig实体CRUD操作
 * - 关系: 继承MyBatis-Plus BaseMapper
 */
@Mapper
public interface ProviderConfigRepository extends BaseMapper<ProviderConfig> {
    
    /**
     * [函数: findByUserIdAndProviderId]
     * - 输入: String userId, String providerId - 用户ID和供应商ID
     * - 输出: ProviderConfig - 供应商配置实体
     * - 角色: 根据用户和供应商查找配置
     * - 逻辑: 1. 执行SQL查询 2. 返回匹配的活跃配置
     */
    @Select("SELECT * FROM provider_configs WHERE user_id = #{userId} AND provider_id = #{providerId} AND status = 'active'")
    ProviderConfig findByUserIdAndProviderId(String userId, String providerId);
    
    /**
     * [函数: findByUserId]
     * - 输入: String userId - 用户ID
     * - 输出: List<ProviderConfig> - 用户的供应商配置列表
     * - 角色: 获取用户的所有供应商配置
     * - 逻辑: 1. 查询用户的活跃配置 2. 按更新时间排序
     */
    @Select("SELECT * FROM provider_configs WHERE user_id = #{userId} AND status = 'active' ORDER BY updated_at DESC")
    List<ProviderConfig> findByUserId(String userId);
    
    /**
     * [函数: findByConfigId]
     * - 输入: String configId - 配置业务ID
     * - 输出: ProviderConfig - 供应商配置实体
     * - 角色: 根据业务ID查找配置
     * - 逻辑: 1. 执行SQL查询 2. 返回匹配结果
     */
    @Select("SELECT * FROM provider_configs WHERE config_id = #{configId} AND status = 'active'")
    ProviderConfig findByConfigId(String configId);
    
    /**
     * [函数: deactivateByUserIdAndProviderId]
     * - 输入: String userId, String providerId - 用户ID和供应商ID
     * - 输出: int - 影响行数
     * - 角色: 停用用户的特定供应商配置
     * - 逻辑: 1. 更新状态为inactive 2. 更新时间戳
     */
    @Update("UPDATE provider_configs SET status = 'inactive', updated_at = NOW() WHERE user_id = #{userId} AND provider_id = #{providerId} AND status = 'active'")
    int deactivateByUserIdAndProviderId(String userId, String providerId);
}