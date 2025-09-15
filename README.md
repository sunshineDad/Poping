# 智能体服务平台 (Poping Platform)

基于 Vue 3 + Spring Boot 2.7 的智能体服务平台，提供用户管理、智能体服务、数据管理等完整功能。

## 项目结构

```
poping/
├── frontend/          # Vue 3 前端项目
├── backend/           # Spring Boot 后端项目
├── docs/             # 项目文档
│   ├── api/          # API接口文档
│   ├── ui-docs/      # 前端页面文档
│   └── db/           # 数据库设计文档
└── README.md         # 项目说明
```

## 技术栈

### 前端技术栈
- **Vue 3.4+** - 渐进式JavaScript框架
- **TypeScript 5.0+** - 类型安全的JavaScript超集
- **Vite 5.0+** - 快速的前端构建工具
- **Pinia** - Vue 3状态管理库
- **Vue Router 4** - Vue.js官方路由管理器
- **Radix UI** - 无样式、可访问的UI组件库
- **Tailwind CSS** - 实用优先的CSS框架

### 后端技术栈
- **Spring Boot 2.7.18** - Java企业级应用框架
- **Java 8** - 编程语言
- **MyBatis-Plus 3.5.3** - MyBatis增强工具
- **MySQL 8.0** - 关系型数据库
- **Spring Security 5.7** - 安全框架
- **JWT** - JSON Web Token认证
- **Redis** - 缓存数据库
- **Swagger 3.0** - API文档生成工具

## 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **Java** >= 8
- **Maven** >= 3.6.0
- **MySQL** >= 8.0
- **Redis** >= 6.0 (可选)

### 数据库初始化

1. 创建MySQL数据库：
```sql
CREATE DATABASE poping DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

2. 执行数据库初始化脚本：
```bash
mysql -u root -p poping < backend/init-database.sql
```

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 修改配置文件 `src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/poping?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=GMT%2B8
    username: your_username
    password: your_password
```

3. 编译并启动：
```bash
mvn clean compile
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动。

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 启动。

## API文档

启动后端服务后，可以通过以下地址访问API文档：
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- API Docs: `http://localhost:8080/api-docs`

## 核心功能

### 已实现功能

✅ **用户认证系统**
- 用户注册、登录
- JWT令牌认证
- 密码加密存储
- 令牌刷新机制

✅ **基础架构**
- Spring Boot后端框架
- Vue 3前端框架
- MySQL数据库设计
- Redis缓存支持
- 统一异常处理
- API响应格式标准化

### 开发中功能

🚧 **智能体服务**
- 智能体创建和配置
- Playground交互界面
- AIGents API集成
- MCP协议支持

🚧 **数据管理**
- 数据集上传和处理
- 文件格式支持
- 数据预处理流程

🚧 **前端界面**
- 用户认证页面
- 智能体管理界面
- 数据管理界面
- 个人中心页面

## 开发规范

### 代码规范
- 后端遵循阿里巴巴Java开发手册
- 前端使用ESLint + Prettier代码格式化
- 所有代码必须包含完整的注释文档
- 遵循RESTful API设计规范

### 提交规范
```bash
# 功能提交
feat(module): 添加新功能描述

# 修复提交
fix(module): 修复问题描述

# 文档提交
docs(module): 更新文档描述
```

## 项目状态

当前版本：**v1.0.0-alpha**

- ✅ 后端基础架构完成
- ✅ 用户认证系统完成
- ✅ 数据库设计完成
- 🚧 智能体服务开发中
- 🚧 前端界面开发中

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目地址: [https://github.com/poping-ai/platform](https://github.com/poping-ai/platform)
- 问题反馈: [Issues](https://github.com/poping-ai/platform/issues)
- 邮箱: dev@poping.ai

---

**注意**: 这是一个开发中的项目，部分功能可能不稳定。生产环境使用前请充分测试。
>>>>>>> master
