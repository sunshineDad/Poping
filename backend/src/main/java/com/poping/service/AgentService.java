package com.poping.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.poping.dto.AgentCreateRequest;
import com.poping.entity.Agent;
import com.poping.repository.AgentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import java.util.List;

/**
 * 智能体服务类
 */
@Service
public class AgentService {
    
    private static final Logger logger = LoggerFactory.getLogger(AgentService.class);
    
    private final AgentRepository agentRepository;
    
    public AgentService(AgentRepository agentRepository) {
        this.agentRepository = agentRepository;
    }
    
    /**
     * 创建智能体
     */
    @Transactional
    public Agent createAgent(AgentCreateRequest request, Long creatorId) {
        Agent agent = new Agent();
        BeanUtils.copyProperties(request, agent);
        agent.setUserId(creatorId.toString());
        
        int result = agentRepository.insert(agent);
        if (result > 0) {
            logger.info("Created agent: {} by user: {}", agent.getName(), creatorId);
            return agent;
        }
        
        throw new RuntimeException("创建智能体失败");
    }
    
    /**
     * 根据ID获取智能体
     */
    public Agent getAgentById(Long id) {
        Agent agent = agentRepository.selectById(id);
        if (agent == null || !"active".equals(agent.getStatus())) {
            throw new RuntimeException("智能体不存在或已停用");
        }
        return agent;
    }
    
    /**
     * 分页获取公开智能体
     */
    public IPage<Agent> getPublicAgents(int page, int size) {
        Page<Agent> pageParam = new Page<>(page, size);
        return agentRepository.selectPublicAgents(pageParam);
    }
    
    /**
     * 搜索智能体
     */
    public List<Agent> searchAgents(String keyword) {
        return agentRepository.searchByName(keyword);
    }
    
    /**
     * 获取用户创建的智能体（分页）
     */
    public IPage<Agent> getUserAgents(Long userId, int page, int size) {
        Page<Agent> pageParam = new Page<>(page, size);
        QueryWrapper<Agent> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("creator_user_id", userId)
                   .eq("status", "active")
                   .orderByDesc("create_time");
        return agentRepository.selectPage(pageParam, queryWrapper);
    }
    
    /**
     * 获取热门智能体
     */
    public List<Agent> getPopularAgents(int limit) {
        return agentRepository.selectPopularAgents(limit);
    }
    
    /**
     * 更新智能体
     */
    @Transactional
    public Agent updateAgent(Long id, AgentCreateRequest request, Long userId) {
        Agent agent = agentRepository.selectById(id);
        if (agent == null) {
            throw new RuntimeException("智能体不存在");
        }
        
        if (!agent.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改此智能体");
        }
        
        BeanUtils.copyProperties(request, agent, "id", "creatorId", "usageCount", "createTime");
        
        int result = agentRepository.updateById(agent);
        if (result > 0) {
            logger.info("Updated agent: {} by user: {}", agent.getName(), userId);
            return agent;
        }
        
        throw new RuntimeException("更新智能体失败");
    }
    
    /**
     * 删除智能体（软删除）
     */
    @Transactional
    public boolean deleteAgent(Long id, Long userId) {
        Agent agent = agentRepository.selectById(id);
        if (agent == null) {
            throw new RuntimeException("智能体不存在");
        }
        
        if (!agent.getUserId().equals(userId)) {
            throw new RuntimeException("无权限删除此智能体");
        }
        
        agent.setStatus("inactive");
        int result = agentRepository.updateById(agent);
        
        if (result > 0) {
            logger.info("Deleted agent: {} by user: {}", agent.getName(), userId);
            return true;
        }
        
        return false;
    }
    
    /**
     * 增加智能体使用次数
     */
    @Transactional
    public void incrementUsageCount(Long agentId) {
        agentRepository.incrementUsageCount(agentId);
    }
}