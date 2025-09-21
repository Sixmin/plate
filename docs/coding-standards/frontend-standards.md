# 前端编码规范

## Vue 3 Composition API 规范

### 组件结构规范

#### 标准组件结构
组件文件应按以下顺序组织：
1. **template区域**: 模板内容
2. **script setup区域**: 
   - 导入依赖（按类型分组）
   - 定义Props和Emits
   - 响应式数据定义
   - 计算属性
   - 监听器
   - 组合式函数
   - 生命周期钩子
   - 方法定义（按功能分组）
   - 暴露方法给父组件
3. **style区域**: 样式定义

#### 导入依赖分组顺序
- Vue相关导入
- 第三方库导入
- 类型导入
- 本地API导入

### TypeScript 类型定义规范

#### 类型文件组织
- **types/api.ts**: API相关类型
- **types/user.ts**: 用户相关类型
- **types/form.ts**: 表单相关类型
- **types/common.ts**: 通用类型

#### 接口命名规范
- **API响应**: `ApiResponse<T>`
- **分页结果**: `PageResult<T>`
- **查询参数**: `{Entity}QueryParams`
- **创建参数**: `{Entity}CreateDto`
- **更新参数**: `{Entity}UpdateDto`
- **视图对象**: `{Entity}Info`

#### 组件Props类型规范
- 基础Props继承 `BaseProps`
- 表单组件Props继承 `FormProps`
- 表格组件Props继承 `TableProps`
- 使用泛型提高复用性

### 组件命名规范

#### 文件命名规范
- **组件文件**: PascalCase，如 `UserProfile.vue`
- **页面文件**: kebab-case，如 `user-list.vue`
- **工具文件**: camelCase，如 `userUtils.ts`

#### 组件使用规范
- 模板中使用 kebab-case
- 导入时使用 PascalCase
- 组件注册使用 PascalCase

### 状态管理规范 (Pinia)

#### Store定义规范
- 使用 `defineStore` 创建store
- Store名称使用 kebab-case
- State使用 `ref` 或 `reactive`
- Getters使用 `computed`
- Actions使用普通函数

#### Store文件组织
- **stores/user.ts**: 用户相关状态
- **stores/auth.ts**: 认证相关状态
- **stores/dict.ts**: 字典数据状态
- **stores/common.ts**: 通用状态

#### Store使用规范
- 在组件中使用 `computed` 访问state
- 直接调用actions方法
- 避免在组件中直接修改state
- 使用 `readonly` 包装敏感状态

### API请求规范

#### 请求封装规范
- 统一的请求配置
- 请求和响应拦截器
- 错误处理机制
- 认证头自动添加
- 租户信息自动注入

#### API模块化组织
- 按业务模块组织API文件
- 使用TypeScript类型约束
- 统一的API响应格式
- 合理的错误处理

#### 接口命名规范
- **查询列表**: `get{Entity}List`
- **查询详情**: `get{Entity}Info`
- **创建**: `create{Entity}`
- **更新**: `update{Entity}`
- **删除**: `delete{Entity}`
- **批量删除**: `batchDelete{Entity}`

### 样式规范

#### TailwindCSS使用规范
- 优先使用TailwindCSS工具类
- 复杂样式定义为CSS类
- 使用 `@apply` 指令复用样式
- 响应式设计使用断点前缀

#### CSS组织规范
- 全局样式定义在 `src/styles/`
- 组件样式使用 `scoped`
- 工具类样式使用 `@apply`
- 避免深层选择器

#### CSS变量使用
- 定义全局CSS变量
- 主题色彩统一管理
- 组件中使用CSS变量
- 支持暗色模式切换

### 性能优化规范

#### 组件懒加载
- 路由级别懒加载
- 组件级别懒加载
- 使用 `defineAsyncComponent`
- 合理的代码分割

#### 计算属性和监听器优化
- 优先使用计算属性缓存
- 避免在模板中调用函数
- 合理使用watch选项
- 使用防抖节流优化

#### 渲染性能优化
- 使用 `v-memo` 缓存渲染
- 合理使用 `key` 属性
- 避免不必要的响应式
- 使用 `shallowRef` 优化大对象

### 错误处理规范

#### 统一错误处理
- 全局错误处理器
- API错误统一处理
- 用户友好的错误提示
- 错误日志记录

#### 异步错误处理
- 使用 try-catch 包装异步操作
- 提供错误恢复机制
- 避免错误传播到全局
- 合理的重试策略

### 测试规范

#### 组件测试
- 使用 Vue Test Utils
- 测试组件的行为而非实现
- Mock外部依赖
- 测试用户交互

#### 单元测试规范
- 测试文件命名 `{Component}.test.ts`
- 使用 describe 和 it 组织测试
- 清晰的测试用例命名
- 充分的测试覆盖

#### E2E测试规范
- 使用 Playwright 进行E2E测试
- 测试关键业务流程
- 使用Page Object模式
- 稳定的选择器策略

### 代码注释规范

#### JSDoc注释
- 所有导出函数添加JSDoc
- 描述函数功能和参数
- 提供使用示例
- 说明返回值类型

#### 行内注释
- 复杂逻辑添加注释
- 业务规则说明
- TODO和FIXME标记
- 临时代码说明

### 工程化规范

#### 项目结构规范
- **src/views**: 页面组件
- **src/components**: 公共组件
- **src/layouts**: 布局组件
- **src/stores**: 状态管理
- **src/api**: API接口
- **src/utils**: 工具函数
- **src/types**: 类型定义

#### 构建配置规范
- Vite配置优化
- 环境变量管理
- 代理配置
- 构建优化

#### 代码质量工具
- ESLint规则配置
- Prettier格式化
- Stylelint样式检查
- Husky Git钩子

### 国际化规范

#### 多语言文件组织
- 按模块组织语言文件
- 使用命名空间避免冲突
- 支持动态语言切换
- 懒加载语言包

#### 国际化最佳实践
- 所有文本通过i18n函数
- 避免硬编码文本
- 支持复数形式
- 考虑文本长度变化

### 安全规范

#### XSS防护
- 避免使用 `v-html`
- 输入数据验证
- 输出数据转义
- CSP策略配置

#### 数据安全
- 敏感数据加密传输
- 避免在前端存储敏感信息
- 合理的会话管理
- 安全的跨域请求

### 浏览器兼容性

#### 兼容性策略
- 支持现代浏览器
- 使用Polyfill处理兼容性
- 渐进式增强
- 优雅降级

#### 特性检测
- 使用特性检测而非浏览器检测
- 提供备用方案
- 合理的错误提示
- 兼容性测试

### 部署规范

#### 构建优化
- 代码分割策略
- 资源压缩
- 缓存策略
- CDN配置

#### 环境管理
- 开发环境配置
- 测试环境配置
- 生产环境配置
- 环境变量管理

这套前端编码规范确保代码质量、可维护性和团队协作效率，所有规范都基于Vue 3 + Vben Admin的最佳实践。