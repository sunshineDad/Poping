package com.poping.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * [文件概览]
 * - 目的: JWT令牌工具类，处理令牌生成、验证、解析
 * - 数据流: 用户认证 → 生成JWT → 请求验证 → 解析JWT
 * - 核心数据: JWT令牌、用户信息、过期时间
 * - 关系: 被Security组件和Controller使用
 */
@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;
    
    /**
     * 获取签名密钥
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    /**
     * [函数: generateToken]
     * - 输入: String userId, String email - 用户ID和邮箱
     * - 输出: String - JWT令牌
     * - 角色: 生成访问令牌
     * - 逻辑: 1. 构建Claims 2. 设置过期时间 3. 签名生成令牌
     */
    public String generateToken(String userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("type", "access");
        
        return createToken(claims, userId, expiration);
    }
    
    /**
     * [函数: generateRefreshToken]
     * - 输入: String userId - 用户ID
     * - 输出: String - 刷新令牌
     * - 角色: 生成刷新令牌
     * - 逻辑: 1. 构建Claims 2. 设置长过期时间 3. 签名生成令牌
     */
    public String generateRefreshToken(String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("type", "refresh");
        
        return createToken(claims, userId, refreshExpiration);
    }
    
    /**
     * [函数: createToken]
     * - 输入: Map<String, Object> claims, String subject, Long expiration - 声明、主题、过期时间
     * - 输出: String - JWT令牌
     * - 角色: 创建JWT令牌的核心方法
     * - 逻辑: 1. 设置Claims 2. 设置主题和时间 3. 签名生成
     */
    private String createToken(Map<String, Object> claims, String subject, Long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * [函数: getUserIdFromToken]
     * - 输入: String token - JWT令牌
     * - 输出: String - 用户ID
     * - 角色: 从令牌中提取用户ID
     * - 逻辑: 1. 解析令牌 2. 获取Claims 3. 提取userId
     */
    public String getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null ? claims.get("userId", String.class) : null;
    }
    
    /**
     * [函数: getEmailFromToken]
     * - 输入: String token - JWT令牌
     * - 输出: String - 用户邮箱
     * - 角色: 从令牌中提取用户邮箱
     * - 逻辑: 1. 解析令牌 2. 获取Claims 3. 提取email
     */
    public String getEmailFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null ? claims.get("email", String.class) : null;
    }
    
    /**
     * [函数: getExpirationDateFromToken]
     * - 输入: String token - JWT令牌
     * - 输出: Date - 过期时间
     * - 角色: 从令牌中获取过期时间
     * - 逻辑: 1. 解析令牌 2. 获取Claims 3. 提取过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null ? claims.getExpiration() : null;
    }
    
    /**
     * [函数: getClaimsFromToken]
     * - 输入: String token - JWT令牌
     * - 输出: Claims - 令牌声明
     * - 角色: 解析令牌获取Claims
     * - 逻辑: 1. 使用密钥解析 2. 验证签名 3. 返回Claims
     */
    private Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
    
    /**
     * [函数: isTokenExpired]
     * - 输入: String token - JWT令牌
     * - 输出: Boolean - 是否过期
     * - 角色: 检查令牌是否过期
     * - 逻辑: 1. 获取过期时间 2. 与当前时间比较 3. 返回结果
     */
    public Boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return expiration != null && expiration.before(new Date());
    }
    
    /**
     * [函数: validateToken]
     * - 输入: String token, String userId - 令牌和用户ID
     * - 输出: Boolean - 是否有效
     * - 角色: 验证令牌有效性
     * - 逻辑: 1. 提取用户ID 2. 检查是否匹配 3. 检查是否过期
     */
    public Boolean validateToken(String token, String userId) {
        String tokenUserId = getUserIdFromToken(token);
        return tokenUserId != null && 
               tokenUserId.equals(userId) && 
               !isTokenExpired(token);
    }
    
    /**
     * [函数: validateToken]
     * - 输入: String token - JWT令牌
     * - 输出: Boolean - 是否有效
     * - 角色: 验证令牌基本有效性
     * - 逻辑: 1. 解析令牌 2. 检查是否过期 3. 返回结果
     */
    public Boolean validateToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return claims != null && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * [函数: isRefreshToken]
     * - 输入: String token - JWT令牌
     * - 输出: Boolean - 是否为刷新令牌
     * - 角色: 检查令牌类型
     * - 逻辑: 1. 解析令牌 2. 检查type字段 3. 返回结果
     */
    public Boolean isRefreshToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null && "refresh".equals(claims.get("type", String.class));
    }
}