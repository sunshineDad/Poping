package com.poping.controller;

import com.poping.dto.ProviderConfigDTO;
import com.poping.dto.ProviderConfigResponseDTO;
import com.poping.entity.Provider;
import com.poping.service.ProviderService;
import com.poping.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * [文件概览]
 * - 目的: 供应商配置REST API控制器
 * - 数据流: 前端请求 → Controller → Service → Repository
 * - 核心数据: 供应商配置CRUD操作
 * - 关系: 处理HTTP请求和响应
 */
@RestController
@RequestMapping("/api/providers")
@CrossOrigin(origins = "*")
public class ProviderController {
    
    @Autowired
    private ProviderService providerService;
    
    /**
     * [函数: getAllProviders]
     * - 输入: 无
     * - 输出: ResponseEntity<ApiResponse<List<Provider>>> - 所有供应商列表
     * - 角色: 获取系统中所有可用的供应商
     * - 逻辑: 1. 调用服务层 2. 返回供应商列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Provider>>> getAllProviders() {
        try {
            List<Provider> providers = providerService.getAllProviders();
            return ResponseEntity.ok(ApiResponse.success(providers));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取供应商列表失败: " + e.getMessage()));
        }
    }
    
    /**
     * [函数: getUserConfigs]
     * - 输入: Authentication auth - 用户认证信息
     * - 输出: ResponseEntity<ApiResponse<List<ProviderConfigResponseDTO>>> - 用户配置列表
     * - 角色: 获取当前用户的所有供应商配置
     * - 逻辑: 1. 获取用户ID 2. 调用服务层 3. 返回配置列表
     */
    @GetMapping("/configs")
    public ResponseEntity<ApiResponse<List<ProviderConfigResponseDTO>>> getUserConfigs(Authentication auth) {
        try {
            String userId = auth.getName();
            List<ProviderConfigResponseDTO> configs = providerService.getUserProviderConfigs(userId);
            return ResponseEntity.ok(ApiResponse.success(configs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取配置列表失败: " + e.getMessage()));
        }
    }
    
    /**
     * [函数: saveConfig]
     * - 输入: Authentication auth, ProviderConfigDTO configDTO - 用户认证和配置信息
     * - 输出: ResponseEntity<ApiResponse<ProviderConfigResponseDTO>> - 保存结果
     * - 角色: 保存或更新用户的供应商配置
     * - 逻辑: 1. 验证输入 2. 获取用户ID 3. 调用服务层保存 4. 返回结果
     */
    @PostMapping("/configs")
    public ResponseEntity<ApiResponse<ProviderConfigResponseDTO>> saveConfig(
            Authentication auth, 
            @Valid @RequestBody ProviderConfigDTO configDTO) {
        try {
            String userId = auth.getName();
            ProviderConfigResponseDTO result = providerService.saveProviderConfig(userId, configDTO);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("保存配置失败: " + e.getMessage()));
        }
    }
    
    /**
     * [函数: deleteConfig]
     * - 输入: Authentication auth, String providerId - 用户认证和供应商ID
     * - 输出: ResponseEntity<ApiResponse<Boolean>> - 删除结果
     * - 角色: 删除用户的供应商配置
     * - 逻辑: 1. 获取用户ID 2. 调用服务层删除 3. 返回结果
     */
    @DeleteMapping("/configs/{providerId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteConfig(
            Authentication auth, 
            @PathVariable String providerId) {
        try {
            String userId = auth.getName();
            boolean result = providerService.deleteProviderConfig(userId, providerId);
            if (result) {
                return ResponseEntity.ok(ApiResponse.success(true));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("配置不存在或删除失败"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("删除配置失败: " + e.getMessage()));
        }
    }
    
    /**
     * [函数: testConnection]
     * - 输入: Authentication auth, String providerId - 用户认证和供应商ID
     * - 输出: ResponseEntity<ApiResponse<Map<String, Object>>> - 测试结果
     * - 角色: 测试供应商API连接
     * - 逻辑: 1. 获取用户ID 2. 调用服务层测试 3. 返回连接状态
     */
    @PostMapping("/configs/{providerId}/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testConnection(
            Authentication auth, 
            @PathVariable String providerId) {
        try {
            String userId = auth.getName();
            Map<String, Object> result = providerService.testProviderConnection(userId, providerId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("测试连接失败: " + e.getMessage()));
        }
    }
    
    /**
     * [函数: getModels]
     * - 输入: Authentication auth, String providerId - 用户认证和供应商ID
     * - 输出: ResponseEntity<ApiResponse<List<Map<String, Object>>>> - 模型列表
     * - 角色: 获取供应商的可用模型列表
     * - 逻辑: 1. 获取用户ID 2. 调用服务层获取模型 3. 返回模型列表
     */
    @GetMapping("/configs/{providerId}/models")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getModels(
            Authentication auth, 
            @PathVariable String providerId) {
        try {
            String userId = auth.getName();
            List<Map<String, Object>> models = providerService.getProviderModels(userId, providerId);
            return ResponseEntity.ok(ApiResponse.success(models));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取模型列表失败: " + e.getMessage()));
        }
    }
}