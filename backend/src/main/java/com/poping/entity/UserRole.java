package com.poping.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.time.LocalDateTime;

/**
 * [文件概览]
 * - 目的: 用户角色实体类，对应user_roles表
 * - 数据流: 数据库 ↔ 实体对象 ↔ 权限管理
 * - 核心数据: 角色信息、权限描述
 * - 关系: 与User多对多关系
 */
@TableName("user_roles")
public class UserRole {
    
    /**
     * 物理主键，自增ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    /**
     * 业务主键，UUID格式
     */
    @TableField("role_id")
    private String roleId;
    
    /**
     * 角色名称：unlogged, registered, paid, admin
     */
    @TableField("role_name")
    private String roleName;
    
    /**
     * 角色描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 扩展信息，JSON格式
     */
    @TableField("ext_info")
    private String extInfo;
    
    // 构造函数
    public UserRole() {}
    
    public UserRole(String roleId, String roleName, String description) {
        this.roleId = roleId;
        this.roleName = roleName;
        this.description = description;
    }
    
    // Getter和Setter方法
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getRoleId() {
        return roleId;
    }
    
    public void setRoleId(String roleId) {
        this.roleId = roleId;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getExtInfo() {
        return extInfo;
    }
    
    public void setExtInfo(String extInfo) {
        this.extInfo = extInfo;
    }
    
    @Override
    public String toString() {
        return "UserRole{" +
                "id=" + id +
                ", roleId='" + roleId + '\'' +
                ", roleName='" + roleName + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}