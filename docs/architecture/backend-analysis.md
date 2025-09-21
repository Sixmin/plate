# 后端技术栈深度分析

## 核心技术架构

### 基础框架
- **Spring Boot 3.4.7**: 基于Java 17的现代化Spring Boot框架
- **若依Plus 5.4.1**: 基于Spring Boot的企业级快速开发框架
- **Maven**: 项目构建和依赖管理工具

### 数据访问层
- **MyBatis Plus 3.5.12**: 增强版MyBatis，提供更多便捷功能
- **Dynamic DataSource 4.3.1**: 动态数据源，支持主从分离和多数据源
- **HikariCP**: 高性能数据库连接池
- **p6spy 3.9.1**: SQL性能分析和监控

### 安全认证
- **Sa-Token 1.44.0**: 轻量级Java权限认证框架
- **JWT**: JSON Web Token认证机制
- **Spring Security**: 安全框架集成

### 缓存和消息
- **Redis**: 分布式缓存
- **Redisson 3.50.0**: Redis分布式锁和集合
- **Lock4j 2.2.7**: 分布式锁框架

### 任务调度
- **SnailJob 1.5.0**: 分布式任务调度平台
- **定时任务**: 基于Spring Task的定时任务

### 工作流引擎
- **Warm-Flow 1.7.4**: 国产轻量级工作流引擎

## 模块化架构设计

### 项目结构
- **ruoyi-admin**: 启动模块
  - 包含启动类和配置文件
- **ruoyi-common**: 公共模块集合
  - ruoyi-common-core: 核心工具类
  - ruoyi-common-security: 安全认证
  - ruoyi-common-redis: Redis配置
  - ruoyi-common-mybatis: MyBatis配置
  - ruoyi-common-web: Web相关配置
  - ruoyi-common-oss: 对象存储
  - ruoyi-common-satoken: Sa-Token集成
  - ruoyi-common-tenant: 多租户支持
  - ruoyi-common-encrypt: 数据加密
  - ruoyi-common-excel: Excel处理
  - ruoyi-common-job: 任务调度
  - ruoyi-common-mail: 邮件发送
  - ruoyi-common-sms: 短信发送
  - ruoyi-common-social: 社交登录
  - ruoyi-common-sse: Server-Sent Events
  - ruoyi-common-websocket: WebSocket
  - ruoyi-common-log: 日志记录
- **ruoyi-modules**: 业务模块
  - ruoyi-system: 系统管理模块
  - ruoyi-demo: 演示模块
  - ruoyi-generator: 代码生成模块
  - ruoyi-job: 任务调度模块
  - ruoyi-workflow: 工作流模块
- **ruoyi-extend**: 扩展模块
  - ruoyi-monitor-admin: 监控管理
  - ruoyi-snailjob-server: 任务调度服务

### 模块依赖关系
- **ruoyi-admin** (启动模块) 依赖于：
  - ruoyi-modules/* (业务模块)
  - ruoyi-common/* (公共模块)
  - ruoyi-extend/* (扩展模块)

## 核心特性分析

### 多租户架构
多租户配置包括：
- **启用状态**: 支持开启/关闭
- **排除表**: 配置不参与租户隔离的表
  - sys_menu: 菜单表
  - sys_tenant: 租户表
  - sys_role_dept: 角色部门关联表
  - sys_client: 客户端配置表

#### 实现机制
- **数据隔离**: 基于tenant_id字段的行级数据隔离
- **自动注入**: MyBatis Plus拦截器自动注入租户条件
- **排除配置**: 系统核心表可配置排除租户隔离
- **动态切换**: 支持运行时动态切换租户

### 权限控制系统

#### RBAC权限模型
权限模型关系：
- **用户(User)** → **角色(Role)** → **权限(Permission)** → **资源(Resource)**
- **部门(Dept)** → **岗位(Post)** → **菜单(Menu)** → **操作(Action)**
- 支持多对多关系的权限继承和数据权限控制

#### Sa-Token集成
```java
// 权限验证注解
@SaCheckPermission("system:user:list")
@GetMapping("/list")
public TableDataInfo<UserVo> list(UserQueryDto queryDto) {
    return userService.selectUserList(queryDto);
}

// 角色验证注解
@SaCheckRole("admin")
@PostMapping("/admin/operation")
public R<Void> adminOperation() {
    // 管理员操作
}
```

### 数据权限控制
```java
// 数据权限配置
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "user_id")
})
public List<UserVo> selectUserList(UserQueryDto queryDto) {
    // 查询会自动添加数据权限条件
}
```

### API接口加密
```yaml
# 接口加密配置
api-decrypt:
  enabled: true
  headerFlag: encrypt-key
  publicKey: MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJnNwrj4hi...
  privateKey: MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6...
```

#### 加密流程
1. 前端使用公钥加密请求数据
2. 后端使用私钥解密请求数据
3. 后端使用私钥加密响应数据
4. 前端使用公钥解密响应数据

## 数据库设计模式

### 基础实体设计
```java
@Data
@EqualsAndHashCode(callSuper = true)
public abstract class BaseEntity {
    
    @TableField(value = "create_dept", fill = FieldFill.INSERT)
    private Long createDept;
    
    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private Long createBy;
    
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private Date createTime;
    
    @TableField(value = "update_by", fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;
    
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
    
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("tenant_id")
    private String tenantId;
    
    @TableLogic
    @TableField("del_flag")
    private String delFlag;
}
```

### MyBatis Plus配置
```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 多租户插件
        TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor();
        tenantInterceptor.setTenantLineHandler(new TenantLineHandler() {
            @Override
            public Expression getTenantId() {
                return new StringValue(TenantHelper.getTenantId());
            }
        });
        interceptor.addInnerInterceptor(tenantInterceptor);
        
        // 数据权限插件
        DataPermissionInterceptor dataPermissionInterceptor = new DataPermissionInterceptor();
        interceptor.addInnerInterceptor(dataPermissionInterceptor);
        
        // 分页插件
        PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor();
        paginationInterceptor.setDbType(DbType.POSTGRE_SQL);
        interceptor.addInnerInterceptor(paginationInterceptor);
        
        return interceptor;
    }
}
```

## 分层架构设计

### Controller层
```java
@RestController
@RequestMapping("/system/user")
@Tag(name = "用户管理")
@RequiredArgsConstructor
public class UserController {
    
    private final IUserService userService;
    
    @GetMapping("/list")
    @Operation(summary = "查询用户列表")
    @PreAuthorize("@ss.hasPermi('system:user:list')")
    public TableDataInfo<UserVo> list(UserQueryDto queryDto) {
        return userService.selectUserList(queryDto);
    }
    
    @PostMapping
    @Operation(summary = "新增用户")
    @PreAuthorize("@ss.hasPermi('system:user:add')")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    public R<Void> add(@Valid @RequestBody UserCreateDto createDto) {
        userService.insertUser(createDto);
        return R.ok();
    }
}
```

### Service层
```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {
    
    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void insertUser(UserCreateDto createDto) {
        // 参数校验
        validateUserData(createDto);
        
        // 构建用户实体
        User user = BeanUtil.toBean(createDto, User.class);
        user.setPassword(BCrypt.hashpw(createDto.getPassword(), BCrypt.gensalt()));
        
        // 保存用户
        save(user);
        
        // 保存用户角色关系
        insertUserRole(user.getId(), createDto.getRoleIds());
        
        // 清除缓存
        CacheUtils.evict(CacheNames.SYS_USER_KEY, user.getId());
    }
    
    @Override
    @DataPermission({
        @DataColumn(key = "deptName", value = "d.dept_id"),
        @DataColumn(key = "userName", value = "u.user_id")
    })
    public TableDataInfo<UserVo> selectUserList(UserQueryDto queryDto) {
        LambdaQueryWrapper<User> wrapper = buildQueryWrapper(queryDto);
        Page<User> page = page(queryDto.build(), wrapper);
        return TableDataInfo.build(page);
    }
}
```

### Mapper层
```java
@Mapper
public interface UserMapper extends BaseMapperPlus<User, UserVo> {
    
    /**
     * 根据条件分页查询用户列表
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "d.dept_id"),
        @DataColumn(key = "userName", value = "u.user_id")
    })
    Page<UserVo> selectUserList(@Param("page") Page<User> page, 
                               @Param("queryDto") UserQueryDto queryDto);
    
    /**
     * 根据用户ID查询用户详情
     */
    UserVo selectUserById(@Param("userId") Long userId);
}
```

## 缓存架构

### Redis缓存策略
```java
@Component
@RequiredArgsConstructor
public class CacheService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 设置缓存
     */
    public void set(String key, Object value, Duration timeout) {
        redisTemplate.opsForValue().set(key, value, timeout);
    }
    
    /**
     * 获取缓存
     */
    public <T> T get(String key, Class<T> clazz) {
        Object value = redisTemplate.opsForValue().get(key);
        return BeanUtil.toBean(value, clazz);
    }
    
    /**
     * 删除缓存
     */
    public Boolean delete(String key) {
        return redisTemplate.delete(key);
    }
}
```

### 缓存注解使用
```java
@Service
public class DictServiceImpl implements IDictService {
    
    @Cacheable(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
    public List<DictDataVo> selectDictDataByType(String dictType) {
        return dictDataMapper.selectDictDataByType(dictType);
    }
    
    @CacheEvict(cacheNames = CacheNames.SYS_DICT, key = "#dictType")
    public void refreshDict(String dictType) {
        // 刷新字典缓存
    }
}
```

## 监控和日志

### 操作日志
```java
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@PostMapping
public R<Void> add(@Valid @RequestBody UserCreateDto createDto) {
    userService.insertUser(createDto);
    return R.ok();
}
```

### 系统监控
```yaml
# Actuator监控配置
management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: ALWAYS
```

### 日志配置
```xml
<!-- logback-plus.xml -->
<configuration>
    <!-- 控制台输出 -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/sys-info.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/sys-info.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>60</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

## 异常处理

### 全局异常处理
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e) {
        log.error("业务异常: {}", e.getMessage());
        return R.fail(e.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        return R.fail("参数验证失败: " + message);
    }
    
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return R.fail("系统异常，请联系管理员");
    }
}
```

## 性能优化

### SQL性能监控
```yaml
# p6spy配置
decorator:
  datasource:
    p6spy:
      enable-logging: true
```

### 连接池优化
```yaml
spring:
  datasource:
    dynamic:
      hikari:
        maxPoolSize: 20          # 最大连接池数量
        minIdle: 10              # 最小空闲线程数量
        connectionTimeout: 30000  # 连接超时时间
        idleTimeout: 600000      # 空闲连接存活时间
        maxLifetime: 1800000     # 连接最长生命周期
```

### 缓存优化
- **多级缓存**: 本地缓存 + Redis分布式缓存
- **缓存预热**: 系统启动时预加载热点数据
- **缓存更新**: 基于事件的缓存更新策略

## 安全机制

### 数据加密
```java
// 字段加密注解
@EncryptField(algorithm = EncryptAlgorithm.AES)
private String phone;

@EncryptField(algorithm = EncryptAlgorithm.RSA)
private String idCard;
```

### SQL注入防护
- **MyBatis**: 使用#{}参数绑定防止SQL注入
- **动态SQL**: 严格验证动态SQL参数
- **权限控制**: 数据权限自动注入WHERE条件

### XSS防护
```java
@RestController
@Validated
public class UserController {
    
    @PostMapping
    public R<Void> add(@Valid @RequestBody @Xss UserCreateDto createDto) {
        // XSS过滤在参数绑定时自动处理
        userService.insertUser(createDto);
        return R.ok();
    }
}
```

## 扩展性设计

### 模块化设计
- **松耦合**: 模块间通过接口交互
- **可插拔**: 支持模块的动态加载和卸载
- **配置化**: 丰富的配置选项支持不同场景

### 微服务支持
- **服务拆分**: 支持按模块拆分为微服务
- **配置中心**: 支持Nacos等配置中心
- **服务发现**: 支持Eureka/Consul等服务发现