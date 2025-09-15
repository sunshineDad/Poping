package com.poping.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.poping.dto.ChatRequest;
import com.poping.entity.Agent;
import com.poping.entity.Message;
import com.poping.entity.Session;
import com.poping.repository.MessageRepository;
import com.poping.repository.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 聊天服务类
 */
@Service
public class ChatService {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    
    private final AIGentsService aiGentsService;
    private final AgentService agentService;
    private final SessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    
    public ChatService(AIGentsService aiGentsService, AgentService agentService,
                      SessionRepository sessionRepository, MessageRepository messageRepository) {
        this.aiGentsService = aiGentsService;
        this.agentService = agentService;
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
    }
    
    /**
     * 发送聊天消息
     */
    @Transactional
    public Map<String, Object> sendMessage(ChatRequest request, Long userId) {
        try {
            // 获取智能体信息
            Agent agent = agentService.getAgentById(request.getAgentId());
            
            // 获取或创建会话
            Session session = getOrCreateSession(request.getSessionId(), userId, agent);
            
            // 保存用户消息
            Message userMessage = saveMessage(session.getId(), "user", request.getMessage());
            
            // 调用AIGents服务
            String aiResponse = aiGentsService.sendQuery(
                session.getAigentsSessionId(), 
                request.getMessage(), 
                request.getContext()
            );
            
            // 保存AI响应
            Message aiMessage = saveMessage(session.getId(), "assistant", aiResponse);
            
            // 更新会话信息
            updateSessionActivity(session.getId());
            
            // 增加智能体使用次数
            agentService.incrementUsageCount(agent.getId());
            
            // 构建响应
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("response", aiResponse);
            response.put("status", "success");
            response.put("userMessageId", userMessage.getId());
            response.put("aiMessageId", aiMessage.getId());
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error sending chat message", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "发送消息失败: " + e.getMessage());
            return errorResponse;
        }
    }
    
    /**
     * 获取或创建会话
     */
    private Session getOrCreateSession(Long sessionId, Long userId, Agent agent) {
        Session session;
        
        if (sessionId != null) {
            // 使用现有会话
            session = sessionRepository.selectById(sessionId);
            if (session == null || !session.getUserId().equals(userId)) {
                throw new RuntimeException("会话不存在或无权限访问");
            }
        } else {
            // 创建新会话
            session = createNewSession(userId, agent);
        }
        
        return session;
    }
    
    /**
     * 创建新会话
     */
    @Transactional
    public Session createNewSession(Long userId, Agent agent) {
        // 创建AIGents会话
        String aigentsSessionId = aiGentsService.createSession(
            userId.toString(), 
            "Chat with " + agent.getName()
        );
        
        if (aigentsSessionId == null) {
            throw new RuntimeException("创建AIGents会话失败");
        }
        
        // 创建本地会话记录
        Session session = new Session();
        session.setAigentsSessionId(aigentsSessionId);
        session.setTitle("与 " + agent.getName() + " 的对话");
        session.setUserId(userId);
        session.setAgentId(agent.getId());
        
        int result = sessionRepository.insert(session);
        if (result > 0) {
            logger.info("Created new session for user: {} with agent: {}", userId, agent.getName());
            return session;
        }
        
        throw new RuntimeException("创建会话失败");
    }
    
    /**
     * 保存消息
     */
    private Message saveMessage(Long sessionId, String type, String content) {
        Integer maxSequence = messageRepository.getMaxSequenceNumber(sessionId);
        int nextSequence = (maxSequence == null ? 0 : maxSequence) + 1;
        
        Message message = new Message(sessionId, type, content);
        message.setSequenceNumber(nextSequence);
        
        int result = messageRepository.insert(message);
        if (result > 0) {
            // 更新会话消息数量
            sessionRepository.incrementMessageCount(sessionId);
            return message;
        }
        
        throw new RuntimeException("保存消息失败");
    }
    
    /**
     * 更新会话活动时间
     */
    private void updateSessionActivity(Long sessionId) {
        sessionRepository.updateLastActivity(sessionId, LocalDateTime.now());
    }
    
    /**
     * 获取用户会话列表
     */
    public IPage<Session> getUserSessions(Long userId, int page, int size) {
        Page<Session> pageParam = new Page<>(page, size);
        return sessionRepository.selectByUserId(pageParam, userId);
    }
    
    /**
     * 获取会话消息历史
     */
    public IPage<Message> getSessionMessages(Long sessionId, Long userId, int page, int size) {
        // 验证会话权限
        Session session = sessionRepository.selectById(sessionId);
        if (session == null || !session.getUserId().equals(userId)) {
            throw new RuntimeException("会话不存在或无权限访问");
        }
        
        Page<Message> pageParam = new Page<>(page, size);
        return messageRepository.selectBySessionId(pageParam, sessionId);
    }
    
    /**
     * 删除会话
     */
    @Transactional
    public boolean deleteSession(Long sessionId, Long userId) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null || !session.getUserId().equals(userId)) {
            throw new RuntimeException("会话不存在或无权限访问");
        }
        
        try {
            // 删除AIGents会话
            aiGentsService.deleteSession(session.getAigentsSessionId());
            
            // 删除本地消息记录
            messageRepository.deleteBySessionId(sessionId);
            
            // 删除本地会话记录
            int result = sessionRepository.deleteById(sessionId);
            
            if (result > 0) {
                logger.info("Deleted session: {} for user: {}", sessionId, userId);
                return true;
            }
            
        } catch (Exception e) {
            logger.error("Error deleting session: {}", sessionId, e);
        }
        
        return false;
    }
    
    /**
     * 获取会话详情
     */
    public Session getSessionDetail(Long sessionId, Long userId) {
        Session session = sessionRepository.selectById(sessionId);
        if (session == null || !session.getUserId().equals(userId)) {
            throw new RuntimeException("会话不存在或无权限访问");
        }
        return session;
    }
    
    /**
     * 获取用户活跃会话
     */
    public List<Session> getUserActiveSessions(Long userId, int limit) {
        return sessionRepository.selectActiveSessions(userId, limit);
    }
}