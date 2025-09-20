package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.poping.entity.Session;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 会话数据访问接口
 */
@Mapper
public interface SessionRepository extends BaseMapper<Session> {
    
    /**
     * 根据用户ID分页查询会话
     */
    @Select("SELECT * FROM chat_sessions WHERE user_id = #{userId} ORDER BY updated_at DESC")
    IPage<Session> selectByUserId(Page<Session> page, @Param("userId") String userId);
    
    /**
     * 根据用户ID和智能体ID查询活跃会话
     */
    @Select("SELECT * FROM chat_sessions WHERE user_id = #{userId} AND agent_config_id = #{agentId} AND status = 'active' ORDER BY updated_at DESC LIMIT 1")
    Session selectActiveSession(@Param("userId") String userId, @Param("agentId") Long agentId);
    
    /**
     * 根据AIGents会话ID查询
     */
    @Select("SELECT * FROM chat_sessions WHERE external_session_id = #{aigentsSessionId}")
    Session selectByAigentsSessionId(@Param("aigentsSessionId") String aigentsSessionId);
    
    /**
     * 更新最后活动时间
     */
    @Update("UPDATE chat_sessions SET updated_at = #{lastActivity} WHERE id = #{id}")
    int updateLastActivity(@Param("id") Long id, @Param("lastActivity") LocalDateTime lastActivity);
    
    /**
     * 增加消息数量 - 数据库中没有message_count字段，移除此方法
     */
    // @Update("UPDATE chat_sessions SET message_count = message_count + 1 WHERE id = #{id}")
    // int incrementMessageCount(@Param("id") Long id);
    
    /**
     * 获取用户的活跃会话列表
     */
    @Select("SELECT * FROM chat_sessions WHERE user_id = #{userId} AND status = 'active' ORDER BY updated_at DESC LIMIT #{limit}")
    List<Session> selectActiveSessions(@Param("userId") String userId, @Param("limit") int limit);
}