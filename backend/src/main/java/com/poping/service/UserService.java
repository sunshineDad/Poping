package com.poping.service;

import com.poping.entity.User;
import com.poping.entity.UserRole;
import com.poping.repository.UserRepository;
import com.poping.repository.UserRoleRepository;
import com.poping.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * [文件概览]
 * - 目的: 用户服务层，处理用户相关的业务逻辑
 * - 数据流: Controller → UserService → Repository → 数据库
 * - 核心数据: 用户信息、认证令牌、角色权限
 * - 关系: 被Controller调用，调用Repository进行数据操作
 */
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserRoleRepository userRoleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * [函数: registerUser]
     * - 输入: String email, String password, String username - 邮箱、密码、用户名
     * - 输出: User - 注册成功的用户对象
     * - 角色: 用户注册业务逻辑
     * - 逻辑: 1. 检查邮箱是否存在 2. 创建用户 3. 分配默认角色 4. 保存到数据库
     */
    public User registerUser(String email, String password, String username) {
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("邮箱已被注册");
        }
        
        // 创建新用户
        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setUsername(username);
        user.setStatus("active");
        
        // 保存用户
        int result = userRepository.insert(user);
        if (result > 0) {
            // 分配默认角色（注册用户）
            assignDefaultRole(user.getUserId());
            return user;
        } else {
            throw new RuntimeException("用户注册失败");
        }
    }
    
    /**
     * [函数: authenticateUser]
     * - 输入: String email, String password - 邮箱和密码
     * - 输出: String - JWT访问令牌
     * - 角色: 用户登录认证
     * - 逻辑: 1. 查找用户 2. 验证密码 3. 生成JWT令牌 4. 返回令牌
     */
    public String authenticateUser(String email, String password) {
        // 查找用户
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 检查用户状态
        if (!"active".equals(user.getStatus())) {
            throw new RuntimeException("用户账户已被禁用");
        }
        
        // 验证密码
        String storedPassword = user.getPasswordHash();
        System.out.println("DEBUG: Stored password hash: " + storedPassword);
        System.out.println("DEBUG: Stored password length: " + (storedPassword != null ? storedPassword.length() : "null"));
        System.out.println("DEBUG: Input password: " + password);
        
        if (storedPassword == null || storedPassword.trim().isEmpty()) {
            throw new RuntimeException("用户密码未设置");
        }
        
        if (!passwordEncoder.matches(password, storedPassword)) {
            throw new RuntimeException("密码错误");
        }
        
        // 生成JWT令牌
        return jwtUtil.generateToken(user.getUserId(), user.getEmail());
    }
    
    /**
     * [函数: generatePasswordHash]
     * - 输入: String password - 明文密码
     * - 输出: String - BCrypt哈希
     * - 角色: 生成密码哈希用于调试
     * - 逻辑: 1. 使用BCrypt编码器生成哈希 2. 返回哈希值
     */
    public String generatePasswordHash(String password) {
        String hash = passwordEncoder.encode(password);
        System.out.println("Generated hash for password '" + password + "': " + hash);
        return hash;
    }

    /**
     * [函数: getUserById]
     * - 输入: String userId - 用户业务ID
     * - 输出: User - 用户对象
     * - 角色: 根据ID获取用户信息
     * - 逻辑: 1. 根据userId查询 2. 返回用户信息
     */
    public User getUserById(String userId) {
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }
    
    /**
     * [函数: getUserByEmail]
     * - 输入: String email - 用户邮箱
     * - 输出: User - 用户对象
     * - 角色: 根据邮箱获取用户信息
     * - 逻辑: 1. 根据email查询 2. 返回用户信息
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * [函数: updateUserProfile]
     * - 输入: String userId, String username, String avatarUrl - 用户ID、用户名、头像
     * - 输出: User - 更新后的用户对象
     * - 角色: 更新用户资料
     * - 逻辑: 1. 查找用户 2. 更新信息 3. 保存到数据库
     */
    public User updateUserProfile(String userId, String username, String avatarUrl) {
        User user = getUserById(userId);
        
        if (username != null) {
            user.setUsername(username);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        
        return userRepository.updateById(user) > 0 ? user : null;
    }
    
    /**
     * [函数: changePassword]
     * - 输入: String userId, String oldPassword, String newPassword - 用户ID、旧密码、新密码
     * - 输出: boolean - 是否修改成功
     * - 角色: 修改用户密码
     * - 逻辑: 1. 验证旧密码 2. 加密新密码 3. 更新到数据库
     */
    public boolean changePassword(String userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);
        
        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("原密码错误");
        }
        
        // 更新密码
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        return userRepository.updateById(user) > 0;
    }
    
    /**
     * [函数: getUserRoles]
     * - 输入: String userId - 用户业务ID
     * - 输出: List<UserRole> - 用户角色列表
     * - 角色: 获取用户的所有角色
     * - 逻辑: 1. 查询用户角色关联 2. 返回角色列表
     */
    public List<UserRole> getUserRoles(String userId) {
        return userRoleRepository.findUserRolesByUserId(userId);
    }
    
    /**
     * [函数: refreshToken]
     * - 输入: String refreshToken - 刷新令牌
     * - 输出: String - 新的访问令牌
     * - 角色: 刷新访问令牌
     * - 逻辑: 1. 验证刷新令牌 2. 提取用户信息 3. 生成新的访问令牌
     */
    public String refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new RuntimeException("无效的刷新令牌");
        }
        
        String userId = jwtUtil.getUserIdFromToken(refreshToken);
        User user = getUserById(userId);
        
        return jwtUtil.generateToken(user.getUserId(), user.getEmail());
    }
    
    /**
     * [函数: assignDefaultRole]
     * - 输入: String userId - 用户业务ID
     * - 输出: void
     * - 角色: 为新注册用户分配默认角色
     * - 逻辑: 1. 查找注册用户角色 2. 创建用户角色关联 3. 保存到数据库
     */
    private void assignDefaultRole(String userId) {
        UserRole registeredRole = userRoleRepository.findByRoleName("registered");
        if (registeredRole != null) {
            // 这里需要插入到user_user_roles关联表
            // 由于MyBatis-Plus没有直接的关联表操作，需要手动执行SQL
            // 暂时跳过，在实际项目中需要创建关联表的Repository
        }
    }
    
    /**
     * [函数: validateToken]
     * - 输入: String token - JWT令牌
     * - 输出: User - 令牌对应的用户
     * - 角色: 验证令牌并返回用户信息
     * - 逻辑: 1. 验证令牌有效性 2. 提取用户ID 3. 查询用户信息
     */
    public User validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("无效的访问令牌");
        }
        
        String userId = jwtUtil.getUserIdFromToken(token);
        return getUserById(userId);
    }
}