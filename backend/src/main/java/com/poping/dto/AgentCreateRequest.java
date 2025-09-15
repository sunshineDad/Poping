package com.poping.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 创建智能体请求DTO
 */
public class AgentCreateRequest {
    
    @NotBlank(message = "智能体名称不能为空")
    @Size(max = 50, message = "智能体名称不能超过50个字符")
    private String name;
    
    @Size(max = 200, message = "智能体描述不能超过200个字符")
    private String description;
    
    private String avatar;
    
    @NotBlank(message = "系统提示词不能为空")
    @Size(max = 2000, message = "系统提示词不能超过2000个字符")
    private String systemPrompt;
    
    private String config;
    
    private Boolean isPublic = false;
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    public String getSystemPrompt() {
        return systemPrompt;
    }
    
    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }
    
    public String getConfig() {
        return config;
    }
    
    public void setConfig(String config) {
        this.config = config;
    }
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
}