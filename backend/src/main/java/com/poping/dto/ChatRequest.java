package com.poping.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Map;

/**
 * 聊天请求DTO
 */
public class ChatRequest {
    
    @NotNull(message = "智能体ID不能为空")
    private Long agentId;
    
    @NotBlank(message = "消息内容不能为空")
    private String message;
    
    private String sessionId;
    
    private Map<String, Object> context;
    
    // Getters and Setters
    public Long getAgentId() {
        return agentId;
    }
    
    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public Map<String, Object> getContext() {
        return context;
    }
    
    public void setContext(Map<String, Object> context) {
        this.context = context;
    }
}

/**
 * 聊天响应DTO
 */
class ChatResponse {
    
    private Long sessionId;
    private String response;
    private String status;
    private Map<String, Object> metadata;
    
    public ChatResponse() {
    }
    
    public ChatResponse(Long sessionId, String response) {
        this.sessionId = sessionId;
        this.response = response;
        this.status = "success";
    }
    
    // Getters and Setters
    public Long getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getResponse() {
        return response;
    }
    
    public void setResponse(String response) {
        this.response = response;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}