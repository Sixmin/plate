# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 RuoYi-Vue-Plus 5.4.1 构建的AI增强型企业管理平台，采用前后端分离架构，集成了AI智能化功能。项目分为 `client`（前端）和 `server`（后端）两个主要部分。

## 开发环境要求

- **Java**: 17+
- **Node.js**: 20.10.0+
- **PNPM**: 9.12.0+
- **MySQL**: 8.0+
- **Redis**: 5.0+
- **Qdrant**: 1.7+ (向量数据库，用于AI功能)

## 常用开发命令

### 前端 (client/)

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 启动特定应用
pnpm dev:antd    # Ant Design Vue应用
pnpm dev:play    # Playground应用

# 构建
pnpm build
pnpm build:antd  # 构建Ant Design Vue应用

# 代码检查和格式化
pnpm lint
pnpm format

# 类型检查
pnpm check:type

# 测试
pnpm test:unit   # 单元测试
pnpm test:e2e    # E2E测试

# 清理
pnpm clean
```

### 后端 (server/)

```bash
# 编译打包
mvn clean install

# 跳过测试打包
mvn clean install -DskipTests

# 启动应用
mvn spring-boot:run -pl ruoyi-admin

# 不同环境打包
mvn clean install -P dev   # 开发环境
mvn clean install -P prod  # 生产环境

# 单元测试
mvn test

# 生成API文档
# 启动后访问: http://localhost:8080/doc.html
```

## 核心架构

### 前端架构 (Monorepo)
- **框架**: Vue 3 + TypeScript + Vite
- **UI库**: Ant Design Vue
- **状态管理**: Pinia
- **构建工具**: Turbo + PNPM Workspace
- **代码规范**: ESLint + Prettier + Stylelint

### 后端架构 (Maven多模块)
- **核心框架**: Spring Boot 3.4.7 + Java 17
- **权限认证**: Sa-Token + JWT
- **数据层**: MyBatis-Plus + 动态多数据源
- **缓存**: Redis + Redisson
- **数据库**: MySQL/PostgreSQL/Oracle/SQLServer
- **任务调度**: SnailJob
- **工作流**: Warm-Flow
- **AI集成**: LangChain4j (规划中)

### AI功能模块
- **向量数据库**: Qdrant (用于RAG检索)
- **大语言模型**: 支持OpenAI、Azure、本地模型
- **Agent系统**: 基于MCP协议的智能体框架
- **知识库**: 支持PDF、Word、Excel等文档格式

## 项目结构

### 前端项目结构
```
client/
├── apps/
│   ├── web-antd/          # 主应用 (Ant Design Vue)
│   ├── backend-mock/      # Mock API服务
│   └── playground/        # 开发测试应用
├── packages/              # 共享包
├── internal/              # 内部工具
├── docs/                  # 文档
└── scripts/               # 构建脚本
```

### 后端项目结构
```
server/
├── ruoyi-admin/           # 启动模块
├── ruoyi-common/          # 公共模块
├── ruoyi-modules/         # 业务模块
│   ├── ruoyi-system/      # 系统管理
│   ├── ruoyi-workflow/    # 工作流
│   ├── ruoyi-generator/   # 代码生成
│   └── ruoyi-demo/        # 示例模块
├── ruoyi-extend/          # 扩展模块
└── script/               # 数据库脚本
```

## 数据库设置

### 初始化数据库
```sql
# 创建数据库
CREATE DATABASE ruoyi_vue_plus_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入基础数据
mysql -u root -p ruoyi_vue_plus_ai < server/script/sql/ry_vue_5.X.sql

# 导入工作流数据
mysql -u root -p ruoyi_vue_plus_ai < server/script/sql/ry_workflow.sql
```

### 多租户支持
- 数据基于 `tenant_id` 字段进行租户隔离
- 支持动态多数据源配置
- 内置多租户数据权限控制

## 开发规范

### 代码风格
- 严格遵守Alibaba Java编码规范
- 前端遵循Vue 3官方风格指南
- 使用ESLint + Prettier进行代码格式化
- 禁止使用emoji字符（特殊要求）

### Git提交规范
- 使用Conventional Commits规范
- 配置了lefthook进行提交前检查
- 支持changeset进行版本管理

### 测试规范
- 单元测试使用Vitest (前端) / JUnit 5 (后端)
- E2E测试使用Playwright
- 测试覆盖率要求达到80%+

## AI功能开发

### 当前开发阶段
按照 `docs/ai-transformation/ROADMAP.md` 中的规划：
- ✅ Phase 0: 项目规划 (已完成)
- 🚧 Phase 1: LangChain4j集成 (进行中)
- 📋 Phase 2: Qdrant RAG (计划中)
- 📋 Phase 3: Agent系统 (计划中)

### AI模块结构
```
ruoyi-modules/ruoyi-ai/    # AI模块 (新增)
├── controller/            # API控制器
├── service/              # 业务服务
├── domain/               # 实体类
└── config/               # AI配置
```

## 部署相关

### Docker部署
- 项目根目录提供了Docker Compose配置
- 支持一键启动所有环境依赖
- 包含MySQL、Redis、Qdrant等服务

### 生产部署
- 支持Kubernetes部署
- 配置了nginx反向代理
- 具备完整的监控和日志体系

## 重要注意事项

1. **多租户隔离**: 所有数据操作必须考虑租户隔离
2. **权限控制**: 基于RBAC的细粒度权限验证
3. **数据安全**: 敏感数据需要脱敏处理
4. **性能优化**: 使用Redis缓存和数据库连接池
5. **AI安全**: 防止Prompt注入和内容安全过滤

## 常见问题排查

### 启动问题
- 检查Java版本是否为17+
- 确保Redis和MySQL服务正常运行
- 验证配置文件中的数据库连接信息

### 前端构建问题
- 使用Node.js 20+和PNPM 9+
- 清理node_modules后重新安装依赖
- 检查Turbo缓存是否冲突

### AI功能问题
- 确保Qdrant服务正常运行
- 检查API密钥配置是否正确
- 验证向量数据库连接状态