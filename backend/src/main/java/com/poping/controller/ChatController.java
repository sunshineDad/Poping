package com.poping.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.poping.dto.ChatRequest;
import com.poping.entity.Message;
import com.poping.entity.Session;
import com.poping.service.ChatService;
import com.poping.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 聊天控制器
 */
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {
    
    private final ChatService chatService;
    
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    /**
     * 发送聊天消息
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendMessage(
            @Valid @RequestBody ChatRequest request,
            @RequestHeader("User-Id") String userId) {
        try {
            Map<String, Object> response = chatService.sendMessage(request, userId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 创建新会话
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<Session>> createSession(
            @RequestParam Long agentId,
            @RequestHeader("User-Id") Long userId) {
        try {
            // 这里需要先获取Agent信息
            // 为简化，暂时返回错误提示
            return ResponseEntity.badRequest().body(ApiResponse.error("请通过发送消息自动创建会话"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取用户会话列表
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<IPage<Session>>> getUserSessions(
            @RequestHeader("User-Id") String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            IPage<Session> sessions = chatService.getUserSessions(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取会话详情
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Session>> getSessionDetail(
            @PathVariable Long sessionId,
            @RequestHeader("User-Id") Long userId) {
        try {
            Session session = chatService.getSessionDetail(sessionId, userId);
            return ResponseEntity.ok(ApiResponse.success(session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取会话消息历史
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<IPage<Message>>> getSessionMessages(
            @PathVariable Long sessionId,
            @RequestHeader("User-Id") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            IPage<Message> messages = chatService.getSessionMessages(sessionId, userId, page, size);
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 删除会话
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteSession(
            @PathVariable Long sessionId,
            @RequestHeader("User-Id") Long userId) {
        try {
            boolean success = chatService.deleteSession(sessionId, userId);
            return ResponseEntity.ok(ApiResponse.success(success));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 获取用户活跃会话
     */
    @GetMapping("/sessions/active")
    public ResponseEntity<ApiResponse<List<Session>>> getActiveSessions(
            @RequestHeader("User-Id") String userId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<Session> sessions = chatService.getUserActiveSessions(userId, limit);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}