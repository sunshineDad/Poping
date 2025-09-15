package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.poping.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 消息数据访问接口
 */
@Mapper
public interface MessageRepository extends BaseMapper<Message> {
    
    /**
     * 根据会话ID分页查询消息
     */
    @Select("SELECT * FROM messages WHERE session_id = #{sessionId} ORDER BY sequence_number ASC")
    IPage<Message> selectBySessionId(Page<Message> page, @Param("sessionId") Long sessionId);
    
    /**
     * 根据会话ID查询最近的消息
     */
    @Select("SELECT * FROM messages WHERE session_id = #{sessionId} ORDER BY sequence_number DESC LIMIT #{limit}")
    List<Message> selectRecentMessages(@Param("sessionId") Long sessionId, @Param("limit") int limit);
    
    /**
     * 获取会话中的最大序号
     */
    @Select("SELECT COALESCE(MAX(sequence_number), 0) FROM messages WHERE session_id = #{sessionId}")
    Integer getMaxSequenceNumber(@Param("sessionId") Long sessionId);
    
    /**
     * 根据会话ID查询所有消息
     */
    @Select("SELECT * FROM messages WHERE session_id = #{sessionId} ORDER BY sequence_number ASC")
    List<Message> selectAllBySessionId(@Param("sessionId") Long sessionId);
    
    /**
     * 删除会话的所有消息
     */
    @Select("DELETE FROM messages WHERE session_id = #{sessionId}")
    int deleteBySessionId(@Param("sessionId") Long sessionId);
}