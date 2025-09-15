package com.poping.service;

import com.poping.dto.ProviderConfigDTO;
import com.poping.dto.ProviderConfigResponseDTO;
import com.poping.entity.Provider;
import java.util.List;
import java.util.Map;

/**
 * [文件概览]
 * - 目的: 供应商服务接口定义
 * - 数据流: Controller → Service → Repository
 * - 核心数据: 供应商和配置管理
 * - 关系: 业务逻辑层接口
 */
public interface ProviderService {
    
    /**
     * [函数: getAllProviders]
     * - 输入: 无
     * - 输出: List<Provider> - 所有活跃供应商列表
     * - 角色: 获取系统中所有可用的供应商
     * - 逻辑: 1. 查询活跃供应商 2. 返回列表
     */
    List<Provider> getAllProviders();
    
    /**
     * [函数: getUserProviderConfigs]
     * - 输入: String userId - 用户ID
     * - 输出: List<ProviderConfigResponseDTO> - 用户的供应商配置列表
     * - 角色: 获取用户的所有供应商配置
     * - 逻辑: 1. 查询用户配置 2. 转换为响应DTO 3. 掩码敏感信息
     */
    List<ProviderConfigResponseDTO> getUserProviderConfigs(String userId);
    
    /**
     * [函数: saveProviderConfig]
     * - 输入: String userId, ProviderConfigDTO configDTO - 用户ID和配置信息
     * - 输出: ProviderConfigResponseDTO - 保存后的配置信息
     * - 角色: 保存或更新用户的供应商配置
     * - 逻辑: 1. 验证供应商存在 2. 检查是否已有配置 3. 保存或更新 4. 返回结果
     */
    ProviderConfigResponseDTO saveProviderConfig(String userId, ProviderConfigDTO configDTO);
    
    /**
     * [函数: deleteProviderConfig]
     * - 输入: String userId, String providerId - 用户ID和供应商ID
     * - 输出: boolean - 删除是否成功
     * - 角色: 删除用户的供应商配置
     * - 逻辑: 1. 查找配置 2. 软删除（设为inactive） 3. 返回结果
     */
    boolean deleteProviderConfig(String userId, String providerId);
    
    /**
     * [函数: testProviderConnection]
     * - 输入: String userId, String providerId - 用户ID和供应商ID
     * - 输出: Map<String, Object> - 测试结果
     * - 角色: 测试供应商API连接
     * - 逻辑: 1. 获取配置 2. 调用API测试 3. 返回连接状态
     */
    Map<String, Object> testProviderConnection(String userId, String providerId);
    
    /**
     * [函数: getProviderModels]
     * - 输入: String userId, String providerId - 用户ID和供应商ID
     * - 输出: List<Map<String, Object>> - 供应商模型列表
     * - 角色: 获取供应商的可用模型列表
     * - 逻辑: 1. 获取配置 2. 调用供应商API 3. 解析模型列表 4. 返回结果
     */
    List<Map<String, Object>> getProviderModels(String userId, String providerId);
}