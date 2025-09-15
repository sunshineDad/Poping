package com.poping.service.impl;

import com.poping.dto.ProviderConfigDTO;
import com.poping.dto.ProviderConfigResponseDTO;
import com.poping.entity.Provider;
import com.poping.entity.ProviderConfig;
import com.poping.repository.ProviderRepository;
import com.poping.repository.ProviderConfigRepository;
import com.poping.service.ProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * [文件概览]
 * - 目的: 供应商服务实现类
 * - 数据流: Controller → ServiceImpl → Repository → 数据库
 * - 核心数据: 供应商配置管理和API调用
 * - 关系: 实现ProviderService接口
 */
@Service
@Transactional
public class ProviderServiceImpl implements ProviderService {
    
    @Autowired
    private ProviderRepository providerRepository;
    
    @Autowired
    private ProviderConfigRepository providerConfigRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Override
    public List<Provider> getAllProviders() {
        return providerRepository.findAllActive();
    }
    
    @Override
    public List<ProviderConfigResponseDTO> getUserProviderConfigs(String userId) {
        List<ProviderConfig> configs = providerConfigRepository.findByUserId(userId);
        
        return configs.stream().map(config -> {
            Provider provider = providerRepository.findByProviderId(config.getProviderId());
            ProviderConfigResponseDTO dto = new ProviderConfigResponseDTO();
            dto.setConfigId(config.getConfigId());
            dto.setProviderId(config.getProviderId());
            dto.setProviderName(provider != null ? provider.getName() : "Unknown");
            dto.setApiUrl(config.getApiUrl());
            dto.setApiKeyMask(maskApiKey(config.getApiKey()));
            dto.setStatus(config.getStatus());
            dto.setCreatedAt(config.getCreatedAt());
            dto.setUpdatedAt(config.getUpdatedAt());
            dto.setExtConfig(config.getExtConfig());
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Override
    public ProviderConfigResponseDTO saveProviderConfig(String userId, ProviderConfigDTO configDTO) {
        // 验证供应商存在
        Provider provider = providerRepository.findByProviderId(configDTO.getProviderId());
        if (provider == null) {
            throw new RuntimeException("供应商不存在: " + configDTO.getProviderId());
        }
        
        // 检查是否已有配置
        ProviderConfig existingConfig = providerConfigRepository.findByUserIdAndProviderId(userId, configDTO.getProviderId());
        
        ProviderConfig config;
        if (existingConfig != null) {
            // 更新现有配置
            config = existingConfig;
            config.setApiUrl(configDTO.getApiUrl());
            config.setApiKey(configDTO.getApiKey());
            config.setExtConfig(configDTO.getExtConfig());
            config.setUpdatedAt(LocalDateTime.now());
        } else {
            // 创建新配置
            config = new ProviderConfig();
            config.setConfigId(UUID.randomUUID().toString());
            config.setUserId(userId);
            config.setProviderId(configDTO.getProviderId());
            config.setApiUrl(configDTO.getApiUrl());
            config.setApiKey(configDTO.getApiKey());
            config.setExtConfig(configDTO.getExtConfig());
            config.setStatus("active");
            config.setCreatedAt(LocalDateTime.now());
            config.setUpdatedAt(LocalDateTime.now());
        }
        
        // 保存配置
        if (existingConfig != null) {
            providerConfigRepository.updateById(config);
        } else {
            providerConfigRepository.insert(config);
        }
        
        // 返回响应DTO
        ProviderConfigResponseDTO responseDTO = new ProviderConfigResponseDTO();
        responseDTO.setConfigId(config.getConfigId());
        responseDTO.setProviderId(config.getProviderId());
        responseDTO.setProviderName(provider.getName());
        responseDTO.setApiUrl(config.getApiUrl());
        responseDTO.setApiKeyMask(maskApiKey(config.getApiKey()));
        responseDTO.setStatus(config.getStatus());
        responseDTO.setCreatedAt(config.getCreatedAt());
        responseDTO.setUpdatedAt(config.getUpdatedAt());
        responseDTO.setExtConfig(config.getExtConfig());
        
        return responseDTO;
    }
    
    @Override
    public boolean deleteProviderConfig(String userId, String providerId) {
        int affected = providerConfigRepository.deactivateByUserIdAndProviderId(userId, providerId);
        return affected > 0;
    }
    
    @Override
    public Map<String, Object> testProviderConnection(String userId, String providerId) {
        ProviderConfig config = providerConfigRepository.findByUserIdAndProviderId(userId, providerId);
        if (config == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "供应商配置不存在");
            return result;
        }
        
        try {
            // 构建测试请求
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getApiKey());
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>("{}", headers);
            
            // 发送测试请求（通常是获取模型列表的轻量级请求）
            String testUrl = config.getApiUrl() + "/models";
            ResponseEntity<String> response = restTemplate.exchange(
                testUrl, HttpMethod.GET, entity, String.class
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "连接成功");
            result.put("statusCode", response.getStatusCodeValue());
            return result;
            
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "连接失败: " + e.getMessage());
            return result;
        }
    }
    
    @Override
    public List<Map<String, Object>> getProviderModels(String userId, String providerId) {
        ProviderConfig config = providerConfigRepository.findByUserIdAndProviderId(userId, providerId);
        if (config == null) {
            throw new RuntimeException("供应商配置不存在");
        }
        
        try {
            // 构建请求
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getApiKey());
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>("{}", headers);
            
            // 获取模型列表
            String modelsUrl = config.getApiUrl() + "/models";
            ResponseEntity<Map> response = restTemplate.exchange(
                modelsUrl, HttpMethod.GET, entity, Map.class
            );
            
            // 解析响应
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("data")) {
                List<Map<String, Object>> models = (List<Map<String, Object>>) responseBody.get("data");
                return models.stream().map(model -> {
                    Map<String, Object> modelInfo = new HashMap<>();
                    modelInfo.put("id", model.get("id"));
                    modelInfo.put("name", model.get("id"));
                    modelInfo.put("description", model.get("description"));
                    modelInfo.put("created", model.get("created"));
                    return modelInfo;
                }).collect(Collectors.toList());
            }
            
            return new ArrayList<>();
            
        } catch (Exception e) {
            throw new RuntimeException("获取模型列表失败: " + e.getMessage());
        }
    }
    
    /**
     * [函数: maskApiKey]
     * - 输入: String apiKey - 原始API密钥
     * - 输出: String - 掩码后的API密钥
     * - 角色: 保护敏感信息显示
     * - 逻辑: 1. 保留前4位和后4位 2. 中间用*替代
     */
    private String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.length() <= 8) {
            return "****";
        }
        
        String prefix = apiKey.substring(0, 4);
        String suffix = apiKey.substring(apiKey.length() - 4);
        int maskLength = apiKey.length() - 8;
        // Java 8兼容：使用StringBuilder替代String.repeat
        StringBuilder maskBuilder = new StringBuilder();
        int repeatCount = Math.min(maskLength, 20);
        for (int i = 0; i < repeatCount; i++) {
            maskBuilder.append("*");
        }
        String mask = maskBuilder.toString();
        
        return prefix + mask + suffix;
    }
}