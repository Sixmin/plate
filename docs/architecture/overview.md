# Plate项目架构总览

## 项目基本信息

- **项目名称**: Plate
- **技术架构**: 前后端分离
- **基础框架**: 若依Plus (RuoYi-Vue-Plus) 5.4.1
- **开发语言**: Java 17 + Vue 3 + TypeScript
- **数据库**: PostgreSQL
- **版本控制**: Git

## 整体架构设计

### 系统架构图
系统采用三层架构设计：
- **前端应用层**: Vue 3 + Vben Admin + Ant Design + TypeScript
- **后端服务层**: Spring Boot 3.4 + MyBatis Plus + Sa-Token
- **数据存储层**: PostgreSQL + Redis

### 技术栈概览

#### 前端技术栈
- **框架**: Vue 3.x + Composition API
- **管理框架**: Vben Admin 5.5.7 (Monorepo架构)
- **UI组件**: Ant Design Vue
- **构建工具**: Vite + Turbo
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: TailwindCSS
- **包管理**: pnpm

#### 后端技术栈
- **基础框架**: Spring Boot 3.4.7
- **管理框架**: 若依Plus 5.4.1
- **ORM框架**: MyBatis Plus 3.5.12
- **安全框架**: Sa-Token 1.44.0 + JWT
- **缓存**: Redis + Redisson 3.50.0
- **任务调度**: SnailJob 1.5.0
- **工作流**: Warm-Flow 1.7.4
- **文档**: SpringDoc OpenAPI 3.0

#### 数据库技术栈
- **主数据库**: PostgreSQL
- **连接池**: HikariCP
- **多数据源**: Dynamic DataSource
- **缓存**: Redis

## 核心特性

### 多租户架构
- **隔离级别**: 数据行级隔离
- **租户标识**: tenant_id字段
- **配置灵活**: 支持排除表配置

### 权限控制
- **认证方式**: Sa-Token + JWT
- **权限模型**: RBAC (用户-角色-权限)
- **数据权限**: 基于部门和角色的数据权限控制
- **接口权限**: 基于注解的权限控制

### 数据安全
- **接口加密**: 支持AES/RSA加密
- **数据加密**: 支持字段级加密
- **SQL监控**: p6spy SQL性能分析
- **XSS防护**: 内置XSS攻击防护

### 系统监控
- **应用监控**: Spring Boot Admin
- **日志管理**: 完整的操作日志记录
- **性能监控**: 支持多种监控指标
- **健康检查**: Actuator健康检查

## 模块设计

### 前端模块结构
- **apps/web-antd**: 主应用
- **packages**: 公共包
- **internal**: 内部工具
- **playground**: 演示环境

### 后端模块结构
- **ruoyi-admin**: 启动模块
- **ruoyi-common**: 公共模块
- **ruoyi-modules**: 业务模块
  - ruoyi-system: 系统管理
  - ruoyi-workflow: 工作流
  - ruoyi-demo: 示例模块
- **ruoyi-extend**: 扩展模块

## 部署架构

### 开发环境
- **前端**: Vite Dev Server (端口3000)
- **后端**: Spring Boot (端口8080)
- **数据库**: PostgreSQL (端口5432)
- **缓存**: Redis (端口6379)

### 生产环境
- **Web服务器**: Nginx
- **应用服务器**: Java 17 + Spring Boot
- **数据库**: PostgreSQL 集群
- **缓存**: Redis 集群
- **监控**: Spring Boot Admin + 日志系统

## 数据流向

### 前端数据流
用户操作 → Vue组件 → Pinia状态管理 → API请求 → 后端服务

### 后端数据流
API接口 → Controller → Service → Mapper → 数据库

### 权限验证流程
请求 → Sa-Token拦截器 → 权限验证 → 业务逻辑 → 响应

## 扩展性设计

### 水平扩展
- **前端**: 支持多应用独立部署
- **后端**: 支持微服务拆分
- **数据库**: 支持读写分离和分库分表

### 垂直扩展
- **模块化**: 松耦合的模块设计
- **插件化**: 支持功能模块插件化
- **配置化**: 丰富的配置选项

## 安全架构

### 认证安全
- JWT Token机制
- 多端登录控制
- 密码策略配置

### 授权安全
- 细粒度权限控制
- 数据权限隔离
- 接口权限验证

### 数据安全
- 敏感数据加密
- SQL注入防护
- XSS攻击防护

## 性能优化

### 前端优化
- 代码分割和懒加载
- 组件级缓存
- 图片懒加载和压缩

### 后端优化
- 数据库连接池优化
- Redis缓存策略
- SQL性能监控

### 数据库优化
- 索引优化
- 查询优化
- 连接池配置

## 监控体系

### 应用监控
- Spring Boot Admin
- JVM性能监控
- 接口响应时间监控

### 业务监控
- 用户行为分析
- 业务指标统计
- 异常监控告警

### 基础设施监控
- 服务器资源监控
- 数据库性能监控
- 网络状态监控