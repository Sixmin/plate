# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目架构

这是一个基于 RuoYi-Vue-Plus 的前后端分离管理系统：

- **后端**: Spring Boot 3.4.7 + MyBatis-Plus + Sa-Token + PostgreSQL，位于 `server/` 目录
- **前端**: Vue 3.5.13 + TypeScript + Vben5 + Ant Design Vue，位于 `client/` 目录
- **数据库**: PostgreSQL 作为主数据库，数据库名 `plate`，Schema `plate`

## 常用开发命令

### 后端 (server/)

```bash
# 编译项目
mvn clean compile

# 打包项目（跳过测试）
mvn clean package -DskipTests

# 运行项目（开发环境）
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 运行测试
mvn test

# 清理构建
mvn clean

# PostgreSQL 数据库连接测试
psql -h localhost -p 5432 -U postgres -d plate

# 数据库初始化（执行 SQL 脚本）
psql -h localhost -p 5432 -U postgres -d plate -f script/sql/postgres/postgres_ry_vue_5.X.sql
```

### 前端 (client/)

```bash
# 安装依赖（必须使用 pnpm）
pnpm install

# 启动开发服务器
pnpm dev:antd

# 构建生产版本
pnpm build:antd

# 构建测试版本
pnpm build:antd:test

# 代码检查
pnpm lint

# 格式化代码
pnpm format

# 类型检查
pnpm check:type
```

## 项目结构

### 后端模块化架构

- `ruoyi-admin`: 主启动模块，入口类 `DromaraApplication`
- `ruoyi-common`: 公共组件库，按功能分包
  - `ruoyi-common-core`: 核心基础组件
  - `ruoyi-common-mybatis`: 数据库组件
  - `ruoyi-common-redis`: 缓存组件
  - `ruoyi-common-satoken`: 权限认证组件
- `ruoyi-modules`: 业务模块
  - `ruoyi-system`: 系统管理模块
  - `ruoyi-generator`: 代码生成模块
  - `ruoyi-workflow`: 工作流模块
  - `ruoyi-demo`: 示例模块

### 前端 Monorepo 架构

- `apps/web-antd`: 主应用，基于 Vben5 框架
- `packages`: 共享包
- `docs`: 文档站点
- `playground`: 开发测试环境

## 技术栈特性

### 后端技术栈

- **框架**: Spring Boot 3.4.7，支持 JDK 17/21
- **ORM**: MyBatis-Plus 3.5.12，支持多数据源
- **权限**: Sa-Token 1.44.0，支持 JWT
- **缓存**: Redisson 3.50.0
- **数据库**: PostgreSQL 14+（主数据库），同时支持 MySQL、Oracle、SQL Server
- **任务调度**: SnailJob 1.5.0
- **工作流**: Warm-Flow 1.7.4

### 前端技术栈

- **框架**: Vue 3.5.13 + TypeScript
- **UI库**: Ant Design Vue 4.2.6
- **构建**: Vite + Turbo
- **状态管理**: Pinia
- **路由**: Vue Router
- **包管理**: pnpm（必须）

## 开发注意事项

### 后端开发

1. 数据库配置：使用 PostgreSQL 作为主数据库，支持动态数据源切换
2. 多租户支持：内置租户隔离机制，基于 Schema 级别隔离
3. 数据权限：基于 MyBatis-Plus 插件实现
4. API文档：使用 SpringDoc + Javadoc 零注解生成
5. 缓存策略：使用 Spring Cache 注解 + Redisson
6. PostgreSQL 特性：支持 JSON 字段类型、数组类型、全文搜索等高级功能

### 前端开发

1. 包管理器：只能使用 pnpm，不支持 npm/yarn
2. Node.js 版本：要求 >= 20.10.0
3. 代码规范：使用 ESLint + Prettier + Stylelint
4. 组件库：基于 Vben5 封装的业务组件
5. 路由权限：基于角色和菜单的动态路由

## MCP 服务器集成

项目已配置 Model Context Protocol (MCP) 服务器，提供增强的开发能力：

### 已配置的 MCP 服务

1. **postgres** - PostgreSQL 数据库服务
   - 直接查询和操作项目数据库
   - 数据库连接：`postgresql://postgres:postgres@127.0.0.1:5432/plate?currentSchema=plate`
   - 支持 SQL 查询、表结构查看、数据分析等操作

2. **word-document-server** - Word 文档处理服务
   - 本地 Python 服务，路径：`E:\AI\Office-Word-MCP-Server\word_mcp_server.py`
   - 支持 Word 文档的创建、编辑、格式化等操作
   - 可用于生成项目文档、报告等

3. **context7** - 技术文档和代码示例服务
   - 在线服务：`https://mcp.context7.com/mcp`
   - 提供最新的技术文档、库文档、代码示例
   - 支持 Spring Boot、Vue、TypeScript 等技术栈的实时文档查询

### MCP 使用注意事项

- MCP 服务器配置文件：`.mcp.json`
- postgres MCP 服务直接连接到项目数据库，可进行数据查询和分析
- word-document-server 需要确保 Python 环境和相关依赖已安装
- context7 服务需要 API 密钥，已在配置中设置

## 多环境配置

### 后端环境

- `dev`: 开发环境（默认）
- `prod`: 生产环境
- `local`: 本地环境

### 前端环境

配置文件位于 `client/apps/web-antd/.env.*`：
- `.env.development`: 开发环境
- `.env.production`: 生产环境

## 数据库初始化

### PostgreSQL 数据库（主要使用）

SQL 脚本位于 `server/script/sql/postgres/`：
- `postgres_ry_vue_5.X.sql`: PostgreSQL 基础数据表
- `postgres_ry_job.sql`: 任务调度表
- `postgres_ry_workflow.sql`: 工作流表

初始化步骤：
```bash
# 1. 创建数据库和 Schema
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE plate;"
psql -h localhost -p 5432 -U postgres -d plate -c "CREATE SCHEMA IF NOT EXISTS plate;"

# 2. 执行初始化脚本
psql -h localhost -p 5432 -U postgres -d plate -f server/script/sql/postgres/postgres_ry_vue_5.X.sql
psql -h localhost -p 5432 -U postgres -d plate -f server/script/sql/postgres/postgres_ry_job.sql
psql -h localhost -p 5432 -U postgres -d plate -f server/script/sql/postgres/postgres_ry_workflow.sql
```

### 其他数据库支持

同时支持其他数据库的脚本：
- `mysql/`: MySQL 数据库脚本（原 RuoYi 默认）
- `oracle/`: Oracle 数据库脚本
- `sqlserver/`: SQL Server 数据库脚本

## Docker 部署

Docker 配置位于 `server/script/docker/`：
- `docker-compose.yml`: 完整环境编排
- `database.yml`: 数据库服务
- 包含 Redis、MySQL/PostgreSQL 等服务配置

## 代码生成

后端支持多数据源代码生成，前端 V5 版本的代码生成模板为付费功能。

## 重要提醒

1. **数据库**: 项目使用 PostgreSQL 作为主数据库，确保 PostgreSQL 14+ 已安装并运行
2. **前端包管理**: 必须使用 pnpm 包管理器，不支持 npm/yarn
3. **后端构建**: 打包默认跳过测试（skipTests=true）
4. **架构特性**: 支持多租户和多数据源架构，基于 Schema 级别的租户隔离
5. **工作流引擎**: 内置 Warm-Flow 工作流引擎
6. **权限控制**: 使用 Sa-Token 进行权限控制，支持多种登录方式
7. **MCP 集成**: 已配置 PostgreSQL、Word 文档处理、技术文档查询等 MCP 服务
8. **数据库连接**: MCP postgres 服务直接连接项目数据库，可用于数据查询和分析