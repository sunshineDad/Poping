package com.poping.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.poping.util.ApiResponse;
import com.poping.dto.AgentCreateRequest;
import com.poping.dto.AgentListResponse;
import com.poping.entity.Agent;
import com.poping.service.AgentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 智能体控制器
 */
@RestController
@RequestMapping("/api/agents")
@CrossOrigin(origins = "*")
public class AgentController {
    
    private final AgentService agentService;
    
    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }
    
    /**
     * 创建智能体
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Agent>> createAgent(
            @Valid @RequestBody AgentCreateRequest request,
            @RequestHeader("User-Id") Long userId) {
        try {
            Agent agent = agentService.createAgent(request, userId);
            return ResponseEntity.ok(ApiResponse.success(agent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取智能体详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Agent>> getAgent(@PathVariable Long id) {
        try {
            Agent agent = agentService.getAgentById(id);
            return ResponseEntity.ok(ApiResponse.success(agent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取智能体列表（默认获取公开智能体）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AgentListResponse>> getAgents(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            IPage<Agent> agentsPage = agentService.getPublicAgents(page, size);
            AgentListResponse response = new AgentListResponse();
            response.setAgents(agentsPage.getRecords());
            response.setTotal((int) agentsPage.getTotal());
            response.setPage((int) agentsPage.getCurrent());
            response.setSize((int) agentsPage.getSize());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 分页获取公开智能体
     */
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<IPage<Agent>>> getPublicAgents(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            IPage<Agent> agents = agentService.getPublicAgents(page, size);
            return ResponseEntity.ok(ApiResponse.success(agents));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取用户创建的智能体
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<IPage<Agent>>> getUserAgents(
            @RequestHeader("User-Id") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            IPage<Agent> agents = agentService.getUserAgents(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success(agents));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取用户创建的智能体（前端兼容接口）
     */
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<IPage<Agent>>> getUserAgentsCompat(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "created_desc") String sort,
            @RequestHeader("Authorization") String authorization) {
        try {
            // 从JWT token中提取用户ID（简化处理，实际应该解析JWT）
            Long userId = 1L; // 临时硬编码，实际应该从token解析
            IPage<Agent> agents = agentService.getUserAgents(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success(agents));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 搜索智能体
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Agent>>> searchAgents(
            @RequestParam String keyword) {
        try {
            List<Agent> agents = agentService.searchAgents(keyword);
            return ResponseEntity.ok(ApiResponse.success(agents));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取热门智能体
     */
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<Agent>>> getPopularAgents(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Agent> agents = agentService.getPopularAgents(limit);
            return ResponseEntity.ok(ApiResponse.success(agents));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 更新智能体
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Agent>> updateAgent(
            @PathVariable Long id,
            @Valid @RequestBody AgentCreateRequest request,
            @RequestHeader("User-Id") Long userId) {
        try {
            Agent agent = agentService.updateAgent(id, request, userId);
            return ResponseEntity.ok(ApiResponse.success(agent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 删除智能体
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Boolean>> deleteAgent(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        try {
            boolean success = agentService.deleteAgent(id, userId);
            return ResponseEntity.ok(ApiResponse.success(success));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}