package com.poping.dto;

import com.poping.entity.Agent;
import java.util.List;

/**
 * 智能体列表响应DTO
 */
public class AgentListResponse {
    private List<Agent> agents;
    private int total;
    private int page;
    private int size;
    
    public AgentListResponse() {}
    
    public AgentListResponse(List<Agent> agents, int total, int page, int size) {
        this.agents = agents;
        this.total = total;
        this.page = page;
        this.size = size;
    }
    
    public List<Agent> getAgents() {
        return agents;
    }
    
    public void setAgents(List<Agent> agents) {
        this.agents = agents;
    }
    
    public int getTotal() {
        return total;
    }
    
    public void setTotal(int total) {
        this.total = total;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
}