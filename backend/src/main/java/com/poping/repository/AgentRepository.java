package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.poping.entity.Agent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 智能体数据访问接口
 */
@Mapper
public interface AgentRepository extends BaseMapper<Agent> {
    
    /**
     * 分页查询公开的智能体
     */
    @Select("SELECT * FROM agent_configs WHERE is_public = 1 AND status = 'active' ORDER BY usage_count DESC, create_time DESC")
    IPage<Agent> selectPublicAgents(Page<Agent> page);
    
    /**
     * 根据创建者ID分页查询智能体
     */
    @Select("SELECT * FROM agent_configs WHERE creator_user_id = #{creatorId} ORDER BY create_time DESC")
    IPage<Agent> selectByCreatorId(Page<Agent> page, @Param("creatorId") Long creatorId);
    
    /**
     * 根据名称模糊查询智能体
     */
    @Select("SELECT * FROM agent_configs WHERE name LIKE CONCAT('%', #{keyword}, '%') AND status = 'active' ORDER BY usage_count DESC")
    List<Agent> searchByName(@Param("keyword") String keyword);
    
    /**
     * 增加使用次数
     */
    @Update("UPDATE agent_configs SET usage_count = usage_count + 1 WHERE id = #{id}")
    int incrementUsageCount(@Param("id") Long id);
    
    /**
     * 获取热门智能体
     */
    @Select("SELECT * FROM agent_configs WHERE is_public = 1 AND status = 'active' ORDER BY usage_count DESC LIMIT #{limit}")
    List<Agent> selectPopularAgents(@Param("limit") int limit);
}