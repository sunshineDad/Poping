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
    @Select("SELECT * FROM sessions WHERE user_id = #{userId} ORDER BY last_activity DESC")
    IPage<Session> selectByUserId(Page<Session> page, @Param("userId") Long userId);
    
    /**
     * 根据用户ID和智能体ID查询活跃会话
     */
    @Select("SELECT * FROM sessions WHERE user_id = #{userId} AND agent_id = #{agentId} AND status = 'active' ORDER BY last_activity DESC LIMIT 1")
    Session selectActiveSession(@Param("userId") Long userId, @Param("agentId") Long agentId);
    
    /**
     * 根据AIGents会话ID查询
     */
    @Select("SELECT * FROM sessions WHERE aigents_session_id = #{aigentsSessionId}")
    Session selectByAigentsSessionId(@Param("aigentsSessionId") String aigentsSessionId);
    
    /**
     * 更新最后活动时间
     */
    @Update("UPDATE sessions SET last_activity = #{lastActivity} WHERE id = #{id}")
    int updateLastActivity(@Param("id") Long id, @Param("lastActivity") LocalDateTime lastActivity);
    
    /**
     * 增加消息数量
     */
    @Update("UPDATE sessions SET message_count = message_count + 1 WHERE id = #{id}")
    int incrementMessageCount(@Param("id") Long id);
    
    /**
     * 获取用户的活跃会话列表
     */
    @Select("SELECT * FROM sessions WHERE user_id = #{userId} AND status = 'active' ORDER BY last_activity DESC LIMIT #{limit}")
    List<Session> selectActiveSessions(@Param("userId") Long userId, @Param("limit") int limit);
}