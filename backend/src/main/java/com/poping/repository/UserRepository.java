package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.poping.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * [文件概览]
 * - 目的: 用户数据访问层，提供用户相关的数据库操作
 * - 数据流: Service层 → Repository → 数据库
 * - 核心数据: User实体的CRUD操作
 * - 关系: 被UserService调用，操作users表
 */
@Mapper
public interface UserRepository extends BaseMapper<User> {
    
    /**
     * [函数: findByEmail]
     * - 输入: String email - 用户邮箱
     * - 输出: User - 用户实体对象
     * - 角色: 根据邮箱查找用户，用于登录验证
     * - 逻辑: 1. 根据email查询 2. 返回用户信息
     */
    @Select("SELECT * FROM users WHERE email = #{email} AND status != 'deleted'")
    User findByEmail(@Param("email") String email);
    
    /**
     * [函数: findByUserId]
     * - 输入: String userId - 用户业务ID
     * - 输出: User - 用户实体对象
     * - 角色: 根据业务ID查找用户
     * - 逻辑: 1. 根据userId查询 2. 返回用户信息
     */
    @Select("SELECT * FROM users WHERE user_id = #{userId} AND status != 'deleted'")
    User findByUserId(@Param("userId") String userId);
    
    /**
     * [函数: findActiveUsers]
     * - 输入: 无
     * - 输出: List<User> - 活跃用户列表
     * - 角色: 获取所有活跃用户
     * - 逻辑: 1. 查询status为active的用户 2. 返回用户列表
     */
    @Select("SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC")
    List<User> findActiveUsers();
    
    /**
     * [函数: countByStatus]
     * - 输入: String status - 用户状态
     * - 输出: Long - 用户数量
     * - 角色: 统计指定状态的用户数量
     * - 逻辑: 1. 根据状态统计用户 2. 返回数量
     */
    @Select("SELECT COUNT(*) FROM users WHERE status = #{status}")
    Long countByStatus(@Param("status") String status);
    
    /**
     * [函数: existsByEmail]
     * - 输入: String email - 用户邮箱
     * - 输出: boolean - 是否存在
     * - 角色: 检查邮箱是否已被注册
     * - 逻辑: 1. 查询邮箱是否存在 2. 返回布尔值
     */
    @Select("SELECT COUNT(*) > 0 FROM users WHERE email = #{email}")
    boolean existsByEmail(@Param("email") String email);
}