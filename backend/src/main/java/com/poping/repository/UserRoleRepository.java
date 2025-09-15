package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.poping.entity.UserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * [文件概览]
 * - 目的: 用户角色数据访问层，提供角色相关的数据库操作
 * - 数据流: Service层 → Repository → 数据库
 * - 核心数据: UserRole实体的CRUD操作
 * - 关系: 被UserService调用，操作user_roles表
 */
@Mapper
public interface UserRoleRepository extends BaseMapper<UserRole> {
    
    /**
     * [函数: findByRoleName]
     * - 输入: String roleName - 角色名称
     * - 输出: UserRole - 角色实体对象
     * - 角色: 根据角色名称查找角色
     * - 逻辑: 1. 根据roleName查询 2. 返回角色信息
     */
    @Select("SELECT * FROM user_roles WHERE role_name = #{roleName}")
    UserRole findByRoleName(@Param("roleName") String roleName);
    
    /**
     * [函数: findByRoleId]
     * - 输入: String roleId - 角色业务ID
     * - 输出: UserRole - 角色实体对象
     * - 角色: 根据业务ID查找角色
     * - 逻辑: 1. 根据roleId查询 2. 返回角色信息
     */
    @Select("SELECT * FROM user_roles WHERE role_id = #{roleId}")
    UserRole findByRoleId(@Param("roleId") String roleId);
    
    /**
     * [函数: findUserRolesByUserId]
     * - 输入: String userId - 用户业务ID
     * - 输出: List<UserRole> - 用户角色列表
     * - 角色: 获取用户的所有角色
     * - 逻辑: 1. 通过关联表查询用户角色 2. 返回角色列表
     */
    @Select("SELECT ur.* FROM user_roles ur " +
            "INNER JOIN user_user_roles uur ON ur.role_id = uur.role_id " +
            "WHERE uur.user_id = #{userId}")
    List<UserRole> findUserRolesByUserId(@Param("userId") String userId);
    
    /**
     * [函数: findAllActiveRoles]
     * - 输入: 无
     * - 输出: List<UserRole> - 所有角色列表
     * - 角色: 获取系统中所有可用角色
     * - 逻辑: 1. 查询所有角色 2. 返回角色列表
     */
    @Select("SELECT * FROM user_roles ORDER BY role_name")
    List<UserRole> findAllActiveRoles();
}