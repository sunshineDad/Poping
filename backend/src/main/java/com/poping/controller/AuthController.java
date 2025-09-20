package com.poping.controller;

import com.poping.dto.*;
import com.poping.entity.User;
import com.poping.service.UserService;
import com.poping.util.ApiResponse;
import com.poping.util.JwtUtil;
// Swagger imports removed
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * [文件概览]
 * - 目的: 用户认证控制器，处理注册、登录、令牌刷新等认证相关请求
 * - 数据流: 前端请求 → Controller → Service → Repository → 数据库
 * - 核心数据: 用户认证信息、JWT令牌、用户资料
 * - 关系: 接收前端请求，调用UserService处理业务逻辑
 */
@RestController
@RequestMapping("/api/auth")
// @Api(tags = "用户认证管理") - Swagger annotation removed
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Value("${jwt.expiration}")
    private Long jwtExpiration;
    
    /**
     * [函数: register]
     * - 输入: UserRegisterRequest request - 用户注册请求
     * - 输出: ResponseEntity<ApiResponse<AuthResponse>> - 注册响应
     * - 角色: 处理用户注册请求
     * - 逻辑: 1. 验证请求参数 2. 调用服务注册用户 3. 生成JWT令牌 4. 返回认证信息
     */
    @PostMapping("/register")
    // @ApiOperation("用户注册") - Swagger annotation removed
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody UserRegisterRequest request) {
        try {
            // 注册用户
            User user = userService.registerUser(request.getEmail(), request.getPassword(), request.getUsername());
            
            // 生成JWT令牌
            String accessToken = jwtUtil.generateToken(user.getUserId(), user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());
            
            // 构建响应
            UserResponse userResponse = UserResponse.fromUser(user);
            AuthResponse authResponse = AuthResponse.create(
                accessToken, 
                refreshToken, 
                jwtExpiration / 1000, 
                userResponse
            );
            
            return ResponseEntity.ok(ApiResponse.success("注册成功", authResponse));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * [函数: login]
     * - 输入: UserLoginRequest request - 用户登录请求
     * - 输出: ResponseEntity<ApiResponse<AuthResponse>> - 登录响应
     * - 角色: 处理用户登录请求
     * - 逻辑: 1. 验证登录凭据 2. 生成JWT令牌 3. 返回认证信息
     */
    @PostMapping("/generate-hash")
    public ResponseEntity<Map<String, Object>> generateHash(@RequestBody Map<String, String> request) {
        try {
            String password = request.get("password");
            String hash = userService.generatePasswordHash(password);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hash", hash);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    // @ApiOperation("用户登录") - Swagger annotation removed
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody UserLoginRequest request) {
        try {
            System.out.println("DEBUG: Login attempt for email: " + request.getEmail());
            
            // 认证用户并生成访问令牌
            String accessToken = userService.authenticateUser(request.getEmail(), request.getPassword());
            
            // 获取用户信息
            User user = userService.getUserByEmail(request.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());
            
            // 构建响应
            UserResponse userResponse = UserResponse.fromUser(user);
            AuthResponse authResponse = AuthResponse.create(
                accessToken, 
                refreshToken, 
                jwtExpiration / 1000, 
                userResponse
            );
            
            return ResponseEntity.ok(ApiResponse.success("登录成功", authResponse));
            
        } catch (Exception e) {
            System.out.println("DEBUG: Login failed with exception: " + e.getClass().getSimpleName());
            System.out.println("DEBUG: Exception message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * [函数: refreshToken]
     * - 输入: RefreshTokenRequest request - 刷新令牌请求
     * - 输出: ResponseEntity<ApiResponse<AuthResponse>> - 刷新响应
     * - 角色: 处理令牌刷新请求
     * - 逻辑: 1. 验证刷新令牌 2. 生成新的访问令牌 3. 返回新令牌
     */
    @PostMapping("/refresh")
    // @ApiOperation("刷新访问令牌") - Swagger annotation removed
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            // 刷新访问令牌
            String newAccessToken = userService.refreshToken(request.getRefreshToken());
            
            // 获取用户信息
            String userId = jwtUtil.getUserIdFromToken(request.getRefreshToken());
            User user = userService.getUserById(userId);
            
            // 构建响应
            UserResponse userResponse = UserResponse.fromUser(user);
            AuthResponse authResponse = AuthResponse.create(
                newAccessToken, 
                request.getRefreshToken(), 
                jwtExpiration / 1000, 
                userResponse
            );
            
            return ResponseEntity.ok(ApiResponse.success("令牌刷新成功", authResponse));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * [函数: logout]
     * - 输入: 无
     * - 输出: ResponseEntity<ApiResponse<Void>> - 登出响应
     * - 角色: 处理用户登出请求
     * - 逻辑: 1. 清除客户端令牌 2. 返回成功响应
     */
    @PostMapping("/logout")
    // @ApiOperation("用户登出") - Swagger annotation removed
    public ResponseEntity<ApiResponse<Void>> logout() {
        // 由于JWT是无状态的，服务端不需要特殊处理
        // 客户端需要清除本地存储的令牌
        return ResponseEntity.ok(ApiResponse.success("登出成功", null));
    }
    
    /**
     * [函数: validateToken]
     * - 输入: HttpServletRequest request - HTTP请求（包含Authorization头）
     * - 输出: ResponseEntity<ApiResponse<UserResponse>> - 验证响应
     * - 角色: 验证当前用户的令牌有效性
     * - 逻辑: 1. 提取JWT令牌 2. 验证令牌 3. 返回用户信息
     */
    @GetMapping("/validate")
    // @ApiOperation("验证令牌有效性") - Swagger annotation removed
    public ResponseEntity<ApiResponse<UserResponse>> validateToken(
            @RequestHeader("Authorization") String authHeader) {
        try {
            // 提取JWT令牌
            String token = authHeader.substring(7); // 移除"Bearer "前缀
            
            // 验证令牌并获取用户信息
            User user = userService.validateToken(token);
            UserResponse userResponse = UserResponse.fromUser(user);
            
            return ResponseEntity.ok(ApiResponse.success("令牌有效", userResponse));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * [函数: getCurrentUser]
     * - 输入: HttpServletRequest request - HTTP请求
     * - 输出: ResponseEntity<ApiResponse<UserResponse>> - 当前用户信息
     * - 角色: 获取当前登录用户的信息
     * - 逻辑: 1. 从请求属性获取用户ID 2. 查询用户信息 3. 返回用户数据
     */
    @GetMapping("/me")
    // @ApiOperation("获取当前用户信息") - Swagger annotation removed
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestAttribute("userId") String userId) {
        try {
            User user = userService.getUserById(userId);
            UserResponse userResponse = UserResponse.fromUser(user);
            
            return ResponseEntity.ok(ApiResponse.success(userResponse));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}