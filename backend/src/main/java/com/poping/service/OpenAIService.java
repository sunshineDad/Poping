package com.poping.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.*;

/**
 * OpenAI API集成服务
 * 提供真实的AI对话功能
 */
@Service
public class OpenAIService {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenAIService.class);
    
    @Value("${app.external.openai.api-key}")
    private String apiKey;
    
    @Value("${app.external.openai.base-url}")
    private String baseUrl;
    
    @Value("${app.external.openai.model}")
    private String model;
    
    @Value("${app.external.openai.timeout}")
    private int timeout;
    
    @Value("${app.external.openai.max-tokens}")
    private int maxTokens;
    
    @Value("${app.external.openai.temperature}")
    private double temperature;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public OpenAIService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * 发送聊天请求到OpenAI
     * @param messages 消息历史
     * @param systemPrompt 系统提示词
     * @return AI响应
     */
    public String sendChatRequest(List<Map<String, String>> messages, String systemPrompt) {
        try {
            String url = baseUrl + "/chat/completions";
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);
            
            // 构建消息列表
            List<Map<String, String>> chatMessages = new ArrayList<>();
            
            // 添加系统提示词
            if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                Map<String, String> systemMessage = new HashMap<>();
                systemMessage.put("role", "system");
                systemMessage.put("content", systemPrompt);
                chatMessages.add(systemMessage);
            }
            
            // 添加历史消息
            chatMessages.addAll(messages);
            
            requestBody.put("messages", chatMessages);
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 发送请求
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode choices = jsonNode.get("choices");
                
                if (choices != null && choices.size() > 0) {
                    JsonNode message = choices.get(0).get("message");
                    if (message != null) {
                        return message.get("content").asText();
                    }
                }
            }
            
            logger.error("Failed to get response from OpenAI: {}", response.getBody());
            return "抱歉，AI服务暂时不可用，请稍后再试。";
            
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                logger.error("OpenAI API key is invalid or expired");
                return "AI服务认证失败，请检查配置。";
            } else if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                logger.error("OpenAI API rate limit exceeded");
                return "AI服务请求过于频繁，请稍后再试。";
            } else {
                logger.error("OpenAI API client error: {}", e.getMessage());
                return "AI服务请求失败，请稍后再试。";
            }
        } catch (HttpServerErrorException e) {
            logger.error("OpenAI API server error: {}", e.getMessage());
            return "AI服务暂时不可用，请稍后再试。";
        } catch (Exception e) {
            logger.error("Error calling OpenAI API", e);
            return "AI服务出现错误，请稍后再试。";
        }
    }
    
    /**
     * 发送简单的聊天消息
     * @param userMessage 用户消息
     * @param systemPrompt 系统提示词
     * @return AI响应
     */
    public String sendSimpleMessage(String userMessage, String systemPrompt) {
        List<Map<String, String>> messages = new ArrayList<>();
        
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", userMessage);
        messages.add(message);
        
        return sendChatRequest(messages, systemPrompt);
    }
    
    /**
     * 检查API连接状态
     * @return 是否连接正常
     */
    public boolean checkConnection() {
        try {
            String testMessage = "Hello";
            String response = sendSimpleMessage(testMessage, "You are a helpful assistant.");
            return response != null && !response.contains("AI服务");
        } catch (Exception e) {
            logger.error("Error checking OpenAI connection", e);
            return false;
        }
    }
    
    /**
     * 获取可用模型列表
     * @return 模型列表
     */
    public List<String> getAvailableModels() {
        try {
            String url = baseUrl + "/models";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode data = jsonNode.get("data");
                
                List<String> models = new ArrayList<>();
                if (data != null && data.isArray()) {
                    for (JsonNode modelNode : data) {
                        String modelId = modelNode.get("id").asText();
                        if (modelId.startsWith("gpt-")) {
                            models.add(modelId);
                        }
                    }
                }
                return models;
            }
            
        } catch (Exception e) {
            logger.error("Error getting available models", e);
        }
        
        // 返回默认模型列表
        return Arrays.asList("gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview");
    }
}