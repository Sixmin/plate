# 后端编码规范

## Java代码风格规范

### 包结构设计

#### 标准包结构
```
org.dromara.{module}/
├── controller/                 # 控制器层
├── service/                    # 业务逻辑层
│   ├── I{Service}Service.java  # 服务接口
│   └── impl/                   # 服务实现
├── domain/                     # 领域对象
│   ├── entity/                 # 数据库实体
│   ├── dto/                    # 数据传输对象
│   │   ├── request/            # 请求DTO
│   │   └── response/           # 响应DTO
│   └── vo/                     # 视图对象
├── mapper/                     # 数据访问层
├── config/                     # 配置类
├── enums/                      # 枚举类
├── exception/                  # 异常类
├── utils/                      # 工具类
└── constants/                  # 常量类
```

### 命名规范

#### 类命名
- **实体类**: 使用名词，PascalCase，如 `UserInfo`、`SysRole`
- **服务接口**: 以 `I` 开头，以 `Service` 结尾，如 `IUserService`
- **服务实现**: 以 `ServiceImpl` 结尾，如 `UserServiceImpl`
- **控制器**: 以 `Controller` 结尾，如 `UserController`
- **Mapper接口**: 以 `Mapper` 结尾，如 `UserMapper`

#### 方法命名
- **查询方法**: `select`、`get`、`find` 开头
- **新增方法**: `insert`、`add`、`create` 开头
- **修改方法**: `update`、`modify` 开头
- **删除方法**: `delete`、`remove` 开头
- **验证方法**: `validate`、`check` 开头

#### 变量命名
- **常量**: 全大写，下划线分隔，如 `MAX_USER_COUNT`
- **成员变量**: camelCase，如 `userName`、`createTime`
- **局部变量**: camelCase，语义明确
- **集合变量**: 使用复数形式，如 `users`、`roleList`

### 实体类设计规范

#### 数据库实体规范
- 继承 `BaseEntity` 基类
- 使用 `@TableName` 指定表名
- 主键使用 `@TableId` 注解
- 字段使用 `@TableField` 注解
- 添加必要的 `@Schema` 注解用于API文档
- 添加 JSR303 验证注解

#### DTO设计规范
- **请求DTO**: 包含验证注解，继承分页查询基类（如需要）
- **响应DTO**: 只包含需要返回的字段
- **查询DTO**: 继承 `BasePageQuery`，包含查询条件
- 使用 `@Schema` 注解描述字段含义

#### VO设计规范
- 用于前端展示的视图对象
- 可包含格式化后的字段（如状态名称）
- 使用 `@JsonFormat` 处理日期格式
- 不包含敏感信息

### Service层设计规范

#### 接口设计原则
- 继承 `IService<T>` 基接口
- 方法命名要语义明确
- 参数使用DTO对象
- 返回值使用VO对象
- 添加完整的JavaDoc注释
- 定义明确的异常抛出

#### 实现类规范
- 继承 `ServiceImpl<Mapper, Entity>`
- 使用 `@Service` 注解
- 使用 `@RequiredArgsConstructor` 注入依赖
- 添加 `@Slf4j` 日志支持
- 事务方法使用 `@Transactional` 注解

#### 业务逻辑组织
- **参数验证**: 方法开始时进行参数校验
- **业务校验**: 验证业务规则
- **数据操作**: 执行具体的数据库操作
- **后处理**: 清除缓存、发送消息等
- **异常处理**: 统一的异常处理和日志记录

### Controller层设计规范

#### 标准实现
- 使用 `@RestController` 注解
- 添加 `@RequestMapping` 路径映射
- 使用 `@Tag` 和 `@Operation` 注解用于API文档
- 使用 `@RequiredArgsConstructor` 注入服务
- 添加 `@Validated` 进行参数验证

#### 接口设计原则
- RESTful风格的URL设计
- 统一的响应格式 `R<T>`
- 合理的HTTP状态码
- 完整的接口文档注解
- 必要的权限控制注解

#### 参数处理
- 路径参数使用 `@PathVariable`
- 查询参数使用 `@RequestParam`
- 请求体使用 `@RequestBody`
- 文件上传使用 `@RequestPart`
- 添加 `@Valid` 进行参数验证

### 异常处理规范

#### 自定义异常设计
- 业务异常继承 `RuntimeException`
- 包含错误码和错误信息
- 支持国际化错误消息
- 提供构造方法重载

#### 全局异常处理
- 使用 `@RestControllerAdvice` 注解
- 处理常见的系统异常
- 处理业务异常
- 记录异常日志
- 返回统一的错误响应格式

### 数据访问层规范

#### Mapper接口设计
- 继承 `BaseMapperPlus<Entity, VO>`
- 使用 `@Mapper` 注解
- 复杂查询定义专门的方法
- 使用 `@DataPermission` 注解实现数据权限
- 参数使用 `@Param` 注解

#### SQL编写规范
- 优先使用MyBatis Plus提供的方法
- 复杂查询使用XML映射文件
- SQL语句要格式化良好
- 避免使用 `SELECT *`
- 合理使用索引和分页

### 缓存使用规范

#### 缓存策略
- 读多写少的数据使用缓存
- 合理设置缓存过期时间
- 使用 `@Cacheable`、`@CacheEvict`、`@CachePut` 注解
- 缓存键要有明确的命名规范
- 避免缓存雪崩和击穿

#### 缓存命名规范
- 缓存名称要有业务含义
- 使用冒号分隔层级
- 包含版本信息（如需要）
- 示例：`sys:user:info:v1`

### 安全编码规范

#### 数据验证
- 所有输入参数都要验证
- 使用JSR303验证注解
- 自定义复杂的验证逻辑
- 防止SQL注入和XSS攻击

#### 权限控制
- 使用 `@SaCheckPermission` 注解
- 数据权限使用 `@DataPermission` 注解
- 敏感操作记录操作日志
- 使用 `@Log` 注解记录业务操作

#### 数据安全
- 敏感字段使用加密存储
- 日志中不输出敏感信息
- 接口响应不包含敏感数据
- 使用HTTPS传输敏感数据

### 性能优化规范

#### 数据库优化
- 合理使用索引
- 避免N+1查询问题
- 使用分页查询大数据集
- 批量操作大量数据
- 连接池配置优化

#### 代码优化
- 避免在循环中查询数据库
- 合理使用缓存减少数据库压力
- 使用异步处理耗时操作
- 优化字符串拼接操作
- 及时释放资源

### 日志规范

#### 日志级别使用
- **ERROR**: 系统错误，需要立即处理
- **WARN**: 警告信息，需要关注
- **INFO**: 重要的业务信息
- **DEBUG**: 调试信息，生产环境关闭

#### 日志内容规范
- 记录关键业务操作
- 包含必要的上下文信息
- 不记录敏感信息
- 格式化日志消息
- 使用占位符而非字符串拼接

### 测试规范

#### 单元测试
- 使用JUnit 5编写测试
- Service层要有完整的单元测试
- 使用Mock对象隔离依赖
- 测试覆盖率要达到80%以上
- 测试方法命名要清晰

#### 集成测试
- 使用 `@SpringBootTest` 注解
- 测试完整的业务流程
- 使用测试数据库
- 清理测试数据
- 验证业务结果

### 代码注释规范

#### JavaDoc注释
- 所有public方法都要有JavaDoc
- 描述方法的功能和参数
- 说明返回值和异常
- 提供使用示例（如需要）

#### 行内注释
- 复杂逻辑要有注释说明
- 业务规则要有注释
- 临时代码要有TODO标记
- 已知问题要有FIXME标记

### 代码审查规范

#### 审查要点
- 代码是否符合编码规范
- 业务逻辑是否正确
- 是否有安全漏洞
- 性能是否有问题
- 测试是否充分

#### 审查流程
- 提交前自查代码
- 同事代码审查
- 通过后合并代码
- 记录审查意见
- 持续改进规范

这套后端编码规范确保代码质量、可维护性和团队协作效率，所有规范都基于若依Plus框架的最佳实践。