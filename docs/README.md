# Plate项目技术文档

> 基于Vue3 + Spring Boot 3 + PostgreSQL的企业级管理系统

## 📖 文档导航

### 🏗️ 架构设计文档
- [**项目总体架构**](./architecture/overview.md) - 系统整体设计和技术选型
- [**前端架构分析**](./architecture/frontend-analysis.md) - Vue3 + Vben Admin技术栈深度解析
- [**后端架构分析**](./architecture/backend-analysis.md) - Spring Boot + 若依Plus框架分析
- [**数据库架构分析**](./architecture/database-analysis.md) - PostgreSQL多租户数据库设计

### 📝 编码规范文档
- [**前端编码规范**](./coding-standards/frontend-standards.md) - Vue3 + TypeScript开发规范
- [**后端编码规范**](./coding-standards/backend-standards.md) - Java + Spring Boot编码规范
- [**API设计规范**](./coding-standards/api-standards.md) - RESTful API设计和文档规范


## 🚀 快速开始

### 环境要求
- **Node.js**: ≥ 20.10.0
- **pnpm**: ≥ 9.12.0
- **Java**: 17+
- **Maven**: 3.8+
- **PostgreSQL**: 15+
- **Redis**: 7.0+

### 开发环境搭建

#### 1. 前端环境
```bash
# 进入前端目录
cd client

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:antd
```

#### 2. 后端环境
```bash
# 进入后端目录
cd server

# 编译项目
mvn clean compile

# 启动应用
mvn spring-boot:run -pl ruoyi-admin
```

#### 3. 数据库初始化
参考CLAUDE.md文件中的数据库初始化步骤

### 开发流程

#### 新功能开发流程
1. **需求分析** → 阅读业务需求，理解功能目标
2. **架构设计** → 参考[架构文档](./architecture/overview.md)，设计技术方案
3. **数据库设计** → 参考[数据库规范](./architecture/database-analysis.md)，设计表结构
4. **API设计** → 参考[API规范](./coding-standards/api-standards.md)，设计接口
5. **后端开发** → 参考[后端规范](./coding-standards/backend-standards.md)，实现业务逻辑
6. **前端开发** → 参考[前端规范](./coding-standards/frontend-standards.md)，实现用户界面
7. **测试验证** → 单元测试 + 集成测试
8. **代码审查** → 代码质量检查
9. **部署上线** → 生产环境部署


## 🎯 技术架构概览

### 前端技术栈
- **框架**: Vue 3.x + TypeScript
- **UI框架**: Ant Design Vue
- **管理框架**: Vben Admin 5.5.7
- **构建工具**: Vite + Turbo
- **包管理**: pnpm (Monorepo)
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **样式方案**: TailwindCSS

### 后端技术栈
- **框架**: Spring Boot 3.4.7 + Java 17
- **管理框架**: 若依Plus 5.4.1
- **ORM框架**: MyBatis Plus 3.5.12
- **安全框架**: Sa-Token 1.44.0
- **数据库**: PostgreSQL + HikariCP
- **缓存**: Redis + Redisson
- **任务调度**: SnailJob 1.5.0
- **工作流**: Warm-Flow 1.7.4
- **API文档**: SpringDoc OpenAPI 3.0

### 核心特性
- ✅ **多租户架构**: 完整的租户数据隔离
- 🔒 **权限控制**: RBAC + 数据权限控制
- 📊 **实时通信**: WebSocket + SSE支持
- 🔐 **数据安全**: 字段加密 + 内容审核
- 📈 **监控告警**: 完整的性能监控体系

## 📋 开发规范速查

### 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| Vue组件文件 | PascalCase | `UserProfile.vue` |
| 页面文件 | kebab-case | `user-list.vue` |
| Java类 | PascalCase | `UserService.java` |
| 数据库表 | snake_case | `ai_chat_session` |
| API路径 | kebab-case | `/api/v1/ai/sessions` |

### 代码提交规范
- **提交格式**: `<type>(<scope>): <subject>`
- **类型说明**:
  - feat: 新功能
  - fix: 修复bug
  - docs: 文档更新
  - style: 代码格式调整
  - refactor: 代码重构
  - test: 测试相关
  - chore: 构建/配置相关

### 分支管理规范
- **master**: 主分支，生产环境代码
- **develop**: 开发分支，集成测试代码
- **feature/***: 功能分支
- **hotfix/***: 紧急修复分支
- **release/***: 发布分支

## 🔧 开发工具推荐

### IDE和编辑器
- **前端**: VS Code + Vue Language Features + TypeScript
- **后端**: IntelliJ IDEA + Spring Boot插件
- **数据库**: DBeaver / DataGrip

### VS Code插件推荐
- **Vue.volar**: Vue3语言支持
- **bradlc.vscode-tailwindcss**: TailwindCSS智能提示
- **esbenp.prettier-vscode**: 代码格式化
- **dbaeumer.vscode-eslint**: ESLint检查
- **ms-vscode.vscode-typescript-next**: TypeScript支持

### IDEA插件推荐
- **Lombok**: 简化Java代码
- **MyBatis X**: MyBatis增强
- **SonarLint**: 代码质量检查
- **GitToolBox**: Git增强工具
- **Rainbow Brackets**: 彩虹括号

## 📚 学习资源

### 官方文档
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [若依Plus文档](https://plus-doc.dromara.org/)

### 技术栈学习建议
1. **前端开发者**
   - 熟悉Vue 3 Composition API
   - 掌握TypeScript基础语法
   - 了解Vite构建工具
   - 学习TailwindCSS样式方案

2. **后端开发者**
   - 掌握Spring Boot 3.x新特性
   - 熟悉MyBatis Plus用法
   - 了解Sa-Token权限框架
   - 学习PostgreSQL高级特性

3. **全栈开发者**
   - 理解前后端分离架构
   - 掌握RESTful API设计
   - 熟悉Docker容器化部署
   - 了解微服务架构理念

## ❓ 常见问题

### 环境问题
**Q: 前端启动报错 "Cannot find module"？**
A: 检查Node.js版本（需≥20.10.0），删除node_modules重新安装依赖

**Q: 后端启动连接数据库失败？**
A: 检查PostgreSQL连接配置，确认数据库已创建并执行了初始化脚本

**Q: Redis连接失败？**
A: 检查Redis服务是否启动，端口配置是否正确

### 开发问题
**Q: 如何添加新的菜单？**
A: 参考[后端开发规范](./coding-standards/backend-standards.md)中的菜单管理部分


**Q: 如何实现数据权限控制？**
A: 使用@DataPermission注解，参考数据权限设计文档

### 部署问题
**Q: 生产环境如何配置？**
A: 参考server/ruoyi-admin/src/main/resources/application-prod.yml配置文件

**Q: 如何优化数据库性能？**
A: 参考[数据库架构文档](./architecture/database-analysis.md)中的性能优化部分

## 🤝 贡献指南

### 代码贡献流程
1. Fork项目到个人仓库
2. 创建功能分支
3. 提交更改并遵循提交规范
4. 推送分支到远程仓库
5. 创建Pull Request

### 文档贡献
- 发现文档错误或不清晰的地方，欢迎提交PR
- 新增功能需要同步更新相关文档
- 技术选型变更需要更新架构文档

### 代码审查标准
- ✅ 代码符合项目编码规范
- ✅ 包含充分的单元测试
- ✅ API文档完整且准确
- ✅ 不包含安全漏洞
- ✅ 性能影响评估通过

## 📞 支持与联系

### 技术支持
- 📧 **技术问题**: 发起Issue讨论
- 💬 **即时沟通**: 项目微信群/钉钉群
- 📝 **文档问题**: 提交文档PR

### 版本发布
- 🔖 查看[CHANGELOG.md](../CHANGELOG.md)了解版本更新
- 📦 关注[Release页面](https://github.com/your-org/plate/releases)获取最新版本
- 🐛 Bug修复优先级：安全 > 功能 > 性能 > 体验

---

## 🎉 开始你的开发之旅

选择你的角色，开始探索：

- 🎨 **前端开发者** → [前端架构分析](./architecture/frontend-analysis.md)
- ⚙️ **后端开发者** → [后端架构分析](./architecture/backend-analysis.md)
- 🗄️ **数据库开发者** → [数据库架构分析](./architecture/database-analysis.md)
- 📊 **项目管理者** → [项目总体架构](./architecture/overview.md)

**记住：好的代码是写给人看的，恰好能够运行而已。让我们一起构建高质量的企业级应用！** 🚀