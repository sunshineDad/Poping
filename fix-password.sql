-- 修复admin用户密码
DELETE FROM users WHERE email='admin@poping.com';

INSERT INTO users (user_id, username, email, password, status) 
VALUES ('user_001', 'admin', 'admin@poping.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxIh0Ca5gZb8Vaa', 'active');