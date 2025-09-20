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

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * AIGents外部API集成服务
 * 提供会话管理、AI查询、资源管理等核心功能
 */
@Service
public class AIGentsService {
    
    private static final Logger logger = LoggerFactory.getLogger(AIGentsService.class);
    
    @Value("${app.external.aigents.base-url}")
    private String baseUrl;
    
    @Value("${app.external.aigents.timeout}")
    private int timeout;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public AIGentsService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * 创建AIGents会话
     * @param userId 用户ID
     * @param projectName 项目名称
     * @return 会话ID
     */
    public String createSession(String userId, String projectName) {
        try {
            String url = baseUrl + "/api/sessions";
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> config = new HashMap<>();
            Map<String, Boolean> features = new HashMap<>();
            
            // 配置功能特性
            features.put("memories", true);
            features.put("events", true);
            features.put("docs", true);
            features.put("texts", true);
            features.put("images", true);
            features.put("retrieval", false);
            
            Map<String, Object> system = new HashMap<>();
            system.put("system_prompt", "你是一个专业的AI智能助手，为用户提供高质量的对话服务。");
            
            config.put("features", features);
            config.put("system", system);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("user_id", userId);
            metadata.put("project_name", projectName);
            
            requestBody.put("config", config);
            requestBody.put("metadata", metadata);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                if (jsonNode.get("success").asBoolean()) {
                    return jsonNode.get("data").get("session_id").asText();
                }
            }
            
            logger.error("Failed to create AIGents session: {}", response.getBody());
            return null;
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("HTTP error creating AIGents session: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            logger.error("Error creating AIGents session", e);
            return null;
        }
    }
    
    /**
     * 获取会话信息
     * @param sessionId 会话ID
     * @return 会话信息
     */
    public JsonNode getSessionInfo(String sessionId) {
        try {
            String url = baseUrl + "/api/sessions/" + sessionId;
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                if (jsonNode.get("success").asBoolean()) {
                    return jsonNode.get("data");
                }
            }
            
            logger.error("Failed to get AIGents session info: {}", response.getBody());
            return null;
            
        } catch (Exception e) {
            logger.error("Error getting AIGents session info", e);
            return null;
        }
    }
    
    /**
     * 发送AI查询（同步方式）
     * @param sessionId 会话ID
     * @param query 查询内容
     * @param context 上下文信息
     * @return AI响应
     */
    public String sendQuery(String sessionId, String query, Map<String, Object> context) {
        try {
            String url = baseUrl + "/api/sessions/" + sessionId + "/query";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            
            if (context != null && !context.isEmpty()) {
                requestBody.put("context", context);
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                // AI服务返回的是Server-Sent Events格式，需要解析
                String responseBody = response.getBody();
                return parseSSEResponse(responseBody);
            }
            
            logger.error("Failed to send AIGents query: {}", response.getBody());
            return "抱歉，AI服务暂时不可用，请稍后再试。";
            
        } catch (Exception e) {
            logger.error("Error sending AIGents query", e);
            return "抱歉，AI服务出现错误，请稍后再试。";
        }
    }
    
    /**
     * 解析Server-Sent Events响应
     * @param sseResponse SSE格式的响应
     * @return 提取的AI响应内容
     */
    private String parseSSEResponse(String sseResponse) {
        try {
            StringBuilder result = new StringBuilder();
            String[] lines = sseResponse.split("\n");
            
            for (String line : lines) {
                if (line.startsWith("data: ")) {
                    String jsonData = line.substring(6); // 移除"data: "前缀
                    if (!jsonData.trim().isEmpty()) {
                        JsonNode eventNode = objectMapper.readTree(jsonData);
                        String type = eventNode.get("type").asText();
                        
                        if ("message".equals(type)) {
                            JsonNode dataNode = eventNode.get("data");
                            if (dataNode != null && dataNode.has("content")) {
                                result.append(dataNode.get("content").asText());
                            }
                        } else if ("result".equals(type)) {
                            JsonNode dataNode = eventNode.get("data");
                            if (dataNode != null && dataNode.has("result")) {
                                // 如果有最终结果，使用最终结果
                                return dataNode.get("result").asText();
                            }
                        }
                    }
                }
            }
            
            return result.length() > 0 ? result.toString() : "抱歉，未能获取到AI响应。";
            
        } catch (Exception e) {
            logger.error("Error parsing SSE response", e);
            return "抱歉，解析AI响应时出现错误。";
        }
    }
    
    /**
     * 删除会话
     * @param sessionId 会话ID
     * @return 是否成功
     */
    public boolean deleteSession(String sessionId) {
        try {
            String url = baseUrl + "/api/sessions/" + sessionId;
            
            restTemplate.delete(url);
            return true;
            
        } catch (Exception e) {
            logger.error("Error deleting AIGents session", e);
            return false;
        }
    }
    
    /**
     * 上传资源到AIGents
     * @param sessionId 会话ID
     * @param fileName 文件名
     * @param fileContent 文件内容
     * @param resourceType 资源类型
     * @return 资源ID
     */
    public String uploadResource(String sessionId, String fileName, byte[] fileContent, String resourceType) {
        try {
            String url = baseUrl + "/api/sessions/" + sessionId + "/resources/upload";
            
            // 这里需要实现multipart/form-data上传
            // 由于RestTemplate处理文件上传较复杂，这里先返回模拟ID
            // 实际实现时需要使用MultiValueMap和FileSystemResource
            
            logger.info("Uploading resource {} to AIGents session {}", fileName, sessionId);
            return UUID.randomUUID().toString();
            
        } catch (Exception e) {
            logger.error("Error uploading resource to AIGents", e);
            return null;
        }
    }
    
    /**
     * 获取会话的记忆列表
     * @param sessionId 会话ID
     * @param limit 限制数量
     * @return 记忆列表
     */
    public JsonNode getMemories(String sessionId, int limit) {
        try {
            String url = baseUrl + "/api/sessions/" + sessionId + "/memories?limit=" + limit;
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                if (jsonNode.get("success").asBoolean()) {
                    return jsonNode.get("data");
                }
            }
            
            return null;
            
        } catch (Exception e) {
            logger.error("Error getting AIGents memories", e);
            return null;
        }
    }
}