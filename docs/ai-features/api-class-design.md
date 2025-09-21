# AI功能API和类设计

> 详细的后端架构设计、API接口规范和核心类设计方案

## 🏗️ 整体架构设计

### 分层架构理念

#### 经典三层架构升级版
```
┌─────────────────────────────────────────┐
│            展示层 (Presentation)          │
│  Controller + DTO + Validator + Doc     │
├─────────────────────────────────────────┤
│              业务层 (Business)           │
│    Service + Agent + Strategy + Event   │
├─────────────────────────────────────────┤
│             数据层 (Data Access)         │
│   Mapper + Entity + Cache + Vector DB   │
├─────────────────────────────────────────┤
│           基础设施层 (Infrastructure)     │
│   Config + Utils + Security + Monitor   │
└─────────────────────────────────────────┘
```

#### 核心设计原则
- **单一职责**: 每个类只负责一个特定功能
- **开闭原则**: 对扩展开放，对修改关闭
- **依赖倒置**: 依赖抽象而非具体实现
- **接口隔离**: 使用小而专一的接口
- **里氏替换**: 子类能够替换父类

### 模块化组织结构
```
org.dromara.ai/
├── config/                 # 配置管理
│   ├── LangChain4jConfig.java
│   ├── QdrantConfig.java
│   ├── AiProperties.java
│   └── AgentConfig.java
├── controller/             # 控制器层
│   ├── AiChatController.java
│   ├── AiKnowledgeController.java
│   ├── AiAgentController.java
│   └── AiModelController.java
├── service/               # 服务层
│   ├── chat/
│   ├── knowledge/
│   ├── agent/
│   ├── model/
│   └── vector/
├── domain/                # 领域模型
│   ├── entity/            # 实体类
│   ├── dto/               # 数据传输对象
│   └── vo/                # 视图对象
├── mapper/                # 数据访问层
├── agent/                 # AI智能体
│   ├── framework/         # Agent框架
│   ├── tools/             # 工具集成
│   └── impl/              # 具体实现
├── enums/                 # 枚举类
├── exception/             # 异常处理
└── utils/                 # 工具类
```

## 🔌 RESTful API设计规范

### API设计原则

#### 统一的URL规范
```
基础路径: /api/v1/ai
资源命名: 使用复数形式的名词
HTTP动词: GET(查询) POST(创建) PUT(更新) DELETE(删除)
状态码: 标准HTTP状态码
```

#### API路径设计
```
聊天对话模块:
GET    /api/v1/ai/chat/sessions          # 获取会话列表
POST   /api/v1/ai/chat/sessions          # 创建新会话
GET    /api/v1/ai/chat/sessions/{id}     # 获取会话详情
PUT    /api/v1/ai/chat/sessions/{id}     # 更新会话
DELETE /api/v1/ai/chat/sessions/{id}     # 删除会话
POST   /api/v1/ai/chat/sessions/{id}/messages  # 发送消息
GET    /api/v1/ai/chat/sessions/{id}/messages  # 获取消息历史

知识库模块:
GET    /api/v1/ai/knowledge/bases        # 获取知识库列表
POST   /api/v1/ai/knowledge/bases        # 创建知识库
GET    /api/v1/ai/knowledge/bases/{id}   # 获取知识库详情
POST   /api/v1/ai/knowledge/bases/{id}/documents  # 上传文档
GET    /api/v1/ai/knowledge/bases/{id}/documents  # 获取文档列表
POST   /api/v1/ai/knowledge/search       # 知识检索

Agent模块:
GET    /api/v1/ai/agents                 # 获取Agent列表
POST   /api/v1/ai/agents                 # 创建Agent
GET    /api/v1/ai/agents/{id}            # 获取Agent详情
POST   /api/v1/ai/agents/{id}/execute    # 执行Agent任务
GET    /api/v1/ai/agents/executions/{id} # 获取执行结果

模型管理模块:
GET    /api/v1/ai/models                 # 获取模型列表
POST   /api/v1/ai/models                 # 添加模型配置
GET    /api/v1/ai/models/{id}/health     # 检查模型健康状态
GET    /api/v1/ai/models/usage           # 获取使用统计
```

### 统一响应格式

#### 标准响应结构
```json
{
  "code": 200,                    // 业务状态码
  "message": "操作成功",            // 消息说明
  "data": {},                     // 响应数据
  "timestamp": 1703123456789,     // 时间戳
  "traceId": "uuid-trace-id"      // 链路追踪ID
}
```

#### 分页响应格式
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [],                   // 数据列表
    "total": 100,                 // 总数
    "pageNum": 1,                 // 当前页
    "pageSize": 20,               // 页大小
    "pages": 5                    // 总页数
  },
  "timestamp": 1703123456789
}
```

#### 流式响应格式(SSE)
```
data: {"type": "message", "content": "部分响应内容", "finished": false}

data: {"type": "message", "content": "完整响应内容", "finished": true}

data: {"type": "error", "message": "错误信息"}
```

## 🎛️ 控制器层设计

### 基础控制器抽象

#### BaseAiController
```java
/**
 * AI模块基础控制器
 * 提供统一的响应处理、异常处理和权限验证
 */
@RestController
@Validated
@RequiredArgsConstructor
public abstract class BaseAiController {
    
    /**
     * 统一成功响应
     */
    protected <T> R<T> success(T data) {
        return R.ok(data);
    }
    
    /**
     * 统一分页响应
     */
    protected <T> TableDataInfo<T> success(Page<T> page) {
        return TableDataInfo.build(page);
    }
    
    /**
     * 统一失败响应
     */
    protected <T> R<T> fail(String message) {
        return R.fail(message);
    }
    
    /**
     * 获取当前用户ID
     */
    protected Long getCurrentUserId() {
        return SecurityUtils.getUserId();
    }
    
    /**
     * 获取当前租户ID
     */
    protected String getCurrentTenantId() {
        return TenantHelper.getTenantId();
    }
}
```

### 核心控制器设计

#### AiChatController (聊天对话控制器)
```java
/**
 * AI聊天对话控制器
 * 处理会话管理、消息发送、流式响应等功能
 */
@RestController
@RequestMapping("/api/v1/ai/chat")
@Tag(name = "AI聊天对话", description = "AI聊天对话相关接口")
@RequiredArgsConstructor
public class AiChatController extends BaseAiController {
    
    private final IAiChatService chatService;
    private final IAiSessionService sessionService;
    
    /**
     * 获取会话列表
     */
    @GetMapping("/sessions")
    @Operation(summary = "获取会话列表")
    @PreAuthorize("@ss.hasPermi('ai:chat:list')")
    public TableDataInfo<AiChatSessionVo> listSessions(AiChatSessionQueryDto queryDto) {
        return success(sessionService.selectSessionList(queryDto));
    }
    
    /**
     * 创建新会话
     */
    @PostMapping("/sessions")
    @Operation(summary = "创建新会话")
    @PreAuthorize("@ss.hasPermi('ai:chat:add')")
    @Log(title = "AI会话", businessType = BusinessType.INSERT)
    public R<AiChatSessionVo> createSession(@Valid @RequestBody AiChatSessionCreateDto createDto) {
        return success(sessionService.createSession(createDto));
    }
    
    /**
     * 发送消息(同步)
     */
    @PostMapping("/sessions/{sessionId}/messages")
    @Operation(summary = "发送消息")
    @PreAuthorize("@ss.hasPermi('ai:chat:send')")
    @Log(title = "AI消息", businessType = BusinessType.INSERT)
    public R<AiChatMessageVo> sendMessage(
            @PathVariable Long sessionId,
            @Valid @RequestBody AiChatMessageSendDto sendDto) {
        return success(chatService.sendMessage(sessionId, sendDto));
    }
    
    /**
     * 发送消息(流式响应)
     */
    @PostMapping(value = "/sessions/{sessionId}/messages/stream", 
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "发送消息(流式)")
    @PreAuthorize("@ss.hasPermi('ai:chat:send')")
    public SseEmitter sendMessageStream(
            @PathVariable Long sessionId,
            @Valid @RequestBody AiChatMessageSendDto sendDto) {
        return chatService.sendMessageStream(sessionId, sendDto);
    }
    
    /**
     * 获取消息历史
     */
    @GetMapping("/sessions/{sessionId}/messages")
    @Operation(summary = "获取消息历史")
    @PreAuthorize("@ss.hasPermi('ai:chat:list')")
    public TableDataInfo<AiChatMessageVo> getMessages(
            @PathVariable Long sessionId,
            AiChatMessageQueryDto queryDto) {
        queryDto.setSessionId(sessionId);
        return success(chatService.selectMessageList(queryDto));
    }
}
```

#### AiKnowledgeController (知识库控制器)
```java
/**
 * AI知识库控制器
 * 处理知识库管理、文档上传、知识检索等功能
 */
@RestController
@RequestMapping("/api/v1/ai/knowledge")
@Tag(name = "AI知识库", description = "AI知识库相关接口")
@RequiredArgsConstructor
public class AiKnowledgeController extends BaseAiController {
    
    private final IAiKnowledgeBaseService knowledgeBaseService;
    private final IAiDocumentService documentService;
    private final IAiSearchService searchService;
    
    /**
     * 获取知识库列表
     */
    @GetMapping("/bases")
    @Operation(summary = "获取知识库列表")
    @PreAuthorize("@ss.hasPermi('ai:knowledge:list')")
    public TableDataInfo<AiKnowledgeBaseVo> listKnowledgeBases(AiKnowledgeBaseQueryDto queryDto) {
        return success(knowledgeBaseService.selectKnowledgeBaseList(queryDto));
    }
    
    /**
     * 创建知识库
     */
    @PostMapping("/bases")
    @Operation(summary = "创建知识库")
    @PreAuthorize("@ss.hasPermi('ai:knowledge:add')")
    @Log(title = "AI知识库", businessType = BusinessType.INSERT)
    public R<AiKnowledgeBaseVo> createKnowledgeBase(@Valid @RequestBody AiKnowledgeBaseCreateDto createDto) {
        return success(knowledgeBaseService.createKnowledgeBase(createDto));
    }
    
    /**
     * 上传文档
     */
    @PostMapping("/bases/{kbId}/documents")
    @Operation(summary = "上传文档")
    @PreAuthorize("@ss.hasPermi('ai:knowledge:upload')")
    @Log(title = "文档上传", businessType = BusinessType.INSERT)
    public R<AiDocumentVo> uploadDocument(
            @PathVariable Long kbId,
            @RequestParam("file") MultipartFile file,
            @Valid AiDocumentUploadDto uploadDto) {
        uploadDto.setKbId(kbId);
        return success(documentService.uploadDocument(file, uploadDto));
    }
    
    /**
     * 知识检索
     */
    @PostMapping("/search")
    @Operation(summary = "知识检索")
    @PreAuthorize("@ss.hasPermi('ai:knowledge:search')")
    public R<List<AiSearchResultVo>> searchKnowledge(@Valid @RequestBody AiSearchQueryDto queryDto) {
        return success(searchService.searchKnowledge(queryDto));
    }
    
    /**
     * 批量处理文档
     */
    @PostMapping("/bases/{kbId}/documents/batch")
    @Operation(summary = "批量处理文档")
    @PreAuthorize("@ss.hasPermi('ai:knowledge:batch')")
    public R<String> batchProcessDocuments(
            @PathVariable Long kbId,
            @Valid @RequestBody AiDocumentBatchDto batchDto) {
        return success(documentService.batchProcessDocuments(kbId, batchDto));
    }
}
```

#### AiAgentController (智能体控制器)
```java
/**
 * AI智能体控制器
 * 处理Agent管理、执行、监控等功能
 */
@RestController
@RequestMapping("/api/v1/ai/agents")
@Tag(name = "AI智能体", description = "AI智能体相关接口")
@RequiredArgsConstructor
public class AiAgentController extends BaseAiController {
    
    private final IAiAgentService agentService;
    private final IAiAgentExecutionService executionService;
    
    /**
     * 获取Agent列表
     */
    @GetMapping
    @Operation(summary = "获取Agent列表")
    @PreAuthorize("@ss.hasPermi('ai:agent:list')")
    public TableDataInfo<AiAgentConfigVo> listAgents(AiAgentConfigQueryDto queryDto) {
        return success(agentService.selectAgentConfigList(queryDto));
    }
    
    /**
     * 创建Agent
     */
    @PostMapping
    @Operation(summary = "创建Agent")
    @PreAuthorize("@ss.hasPermi('ai:agent:add')")
    @Log(title = "AI智能体", businessType = BusinessType.INSERT)
    public R<AiAgentConfigVo> createAgent(@Valid @RequestBody AiAgentConfigCreateDto createDto) {
        return success(agentService.createAgentConfig(createDto));
    }
    
    /**
     * 执行Agent任务(同步)
     */
    @PostMapping("/{agentId}/execute")
    @Operation(summary = "执行Agent任务")
    @PreAuthorize("@ss.hasPermi('ai:agent:execute')")
    @Log(title = "Agent执行", businessType = BusinessType.OTHER)
    public R<AiAgentExecutionVo> executeAgent(
            @PathVariable Long agentId,
            @Valid @RequestBody AiAgentExecuteDto executeDto) {
        return success(executionService.executeAgent(agentId, executeDto));
    }
    
    /**
     * 异步执行Agent任务
     */
    @PostMapping("/{agentId}/execute/async")
    @Operation(summary = "异步执行Agent任务")
    @PreAuthorize("@ss.hasPermi('ai:agent:execute')")
    public R<String> executeAgentAsync(
            @PathVariable Long agentId,
            @Valid @RequestBody AiAgentExecuteDto executeDto) {
        return success(executionService.executeAgentAsync(agentId, executeDto));
    }
    
    /**
     * 获取执行结果
     */
    @GetMapping("/executions/{executionId}")
    @Operation(summary = "获取执行结果")
    @PreAuthorize("@ss.hasPermi('ai:agent:result')")
    public R<AiAgentExecutionVo> getExecutionResult(@PathVariable Long executionId) {
        return success(executionService.getExecutionResult(executionId));
    }
}
```

## 🔧 服务层设计

### 服务接口抽象

#### 基础服务接口
```java
/**
 * AI模块基础服务接口
 * 提供通用的CRUD操作和权限检查
 */
public interface BaseAiService<T extends BaseEntity, V, Q, C, U> {
    
    /**
     * 查询列表
     */
    TableDataInfo<V> selectList(Q queryDto);
    
    /**
     * 根据ID查询
     */
    V selectById(Long id);
    
    /**
     * 创建
     */
    V create(C createDto);
    
    /**
     * 更新
     */
    V update(U updateDto);
    
    /**
     * 删除
     */
    Boolean deleteById(Long id);
    
    /**
     * 批量删除
     */
    Boolean deleteByIds(Collection<Long> ids);
}
```

### 核心服务实现

#### IAiChatService (聊天服务接口)
```java
/**
 * AI聊天服务接口
 */
public interface IAiChatService {
    
    /**
     * 发送消息(同步)
     */
    AiChatMessageVo sendMessage(Long sessionId, AiChatMessageSendDto sendDto);
    
    /**
     * 发送消息(流式)
     */
    SseEmitter sendMessageStream(Long sessionId, AiChatMessageSendDto sendDto);
    
    /**
     * 获取消息列表
     */
    TableDataInfo<AiChatMessageVo> selectMessageList(AiChatMessageQueryDto queryDto);
    
    /**
     * 清理会话上下文
     */
    Boolean clearSessionContext(Long sessionId);
    
    /**
     * 重新生成回答
     */
    AiChatMessageVo regenerateAnswer(Long messageId);
}
```

#### IAiKnowledgeBaseService (知识库服务接口)
```java
/**
 * AI知识库服务接口
 */
public interface IAiKnowledgeBaseService 
    extends BaseAiService<AiKnowledgeBase, AiKnowledgeBaseVo, AiKnowledgeBaseQueryDto, 
                         AiKnowledgeBaseCreateDto, AiKnowledgeBaseUpdateDto> {
    
    /**
     * 重建索引
     */
    Boolean rebuildIndex(Long kbId);
    
    /**
     * 获取索引状态
     */
    AiIndexStatusVo getIndexStatus(Long kbId);
    
    /**
     * 导入知识库
     */
    Boolean importKnowledgeBase(AiKnowledgeBaseImportDto importDto);
    
    /**
     * 导出知识库
     */
    String exportKnowledgeBase(Long kbId);
}
```

#### IAiAgentService (智能体服务接口)
```java
/**
 * AI智能体服务接口
 */
public interface IAiAgentService 
    extends BaseAiService<AiAgentConfig, AiAgentConfigVo, AiAgentConfigQueryDto,
                         AiAgentConfigCreateDto, AiAgentConfigUpdateDto> {
    
    /**
     * 获取可用工具列表
     */
    List<AiToolVo> getAvailableTools();
    
    /**
     * 测试Agent配置
     */
    AiAgentTestResultVo testAgentConfig(Long agentId, AiAgentTestDto testDto);
    
    /**
     * 克隆Agent配置
     */
    AiAgentConfigVo cloneAgentConfig(Long agentId, String newName);
    
    /**
     * 获取Agent使用统计
     */
    AiAgentUsageVo getAgentUsage(Long agentId, AiUsageQueryDto queryDto);
}
```

### 服务实现示例

#### AiChatServiceImpl
```java
/**
 * AI聊天服务实现类
 */
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AiChatServiceImpl implements IAiChatService {
    
    private final AiChatMessageMapper messageMapper;
    private final AiChatSessionMapper sessionMapper;
    private final LangChain4jChatService langChain4jService;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public AiChatMessageVo sendMessage(Long sessionId, AiChatMessageSendDto sendDto) {
        // 1. 验证会话存在性和权限
        AiChatSession session = validateSession(sessionId);
        
        // 2. 保存用户消息
        AiChatMessage userMessage = saveUserMessage(sessionId, sendDto);
        
        // 3. 构建上下文
        List<ChatMessage> context = buildChatContext(sessionId);
        
        // 4. 调用大模型
        ChatResponse response = langChain4jService.chat(context, session.getModelName());
        
        // 5. 保存AI回复
        AiChatMessage aiMessage = saveAiMessage(sessionId, response);
        
        // 6. 更新会话统计
        updateSessionStats(sessionId, response.getTokenUsage());
        
        // 7. 返回结果
        return BeanUtil.toBean(aiMessage, AiChatMessageVo.class);
    }
    
    @Override
    public SseEmitter sendMessageStream(Long sessionId, AiChatMessageSendDto sendDto) {
        SseEmitter emitter = new SseEmitter(30000L);
        
        // 异步处理流式响应
        CompletableFuture.runAsync(() -> {
            try {
                // 验证和构建上下文
                AiChatSession session = validateSession(sessionId);
                List<ChatMessage> context = buildChatContext(sessionId);
                
                // 流式调用
                langChain4jService.chatStream(context, session.getModelName(), chunk -> {
                    try {
                        SseEmitter.SseEventBuilder event = SseEmitter.event()
                            .name("message")
                            .data(chunk);
                        emitter.send(event);
                    } catch (Exception e) {
                        emitter.completeWithError(e);
                    }
                });
                
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
    
    private AiChatSession validateSession(Long sessionId) {
        AiChatSession session = sessionMapper.selectById(sessionId);
        if (session == null) {
            throw new ServiceException("会话不存在");
        }
        
        // 权限检查
        if (!Objects.equals(session.getUserId(), SecurityUtils.getUserId())) {
            throw new ServiceException("无权访问此会话");
        }
        
        return session;
    }
    
    private List<ChatMessage> buildChatContext(Long sessionId) {
        // 从Redis缓存或数据库获取上下文
        String cacheKey = "ai:chat:context:" + sessionId;
        List<ChatMessage> context = (List<ChatMessage>) redisTemplate.opsForValue().get(cacheKey);
        
        if (context == null) {
            // 从数据库构建上下文
            List<AiChatMessage> messages = messageMapper.selectContextMessages(sessionId, 20);
            context = messages.stream()
                .map(this::convertToChatMessage)
                .collect(Collectors.toList());
            
            // 缓存上下文
            redisTemplate.opsForValue().set(cacheKey, context, Duration.ofMinutes(30));
        }
        
        return context;
    }
}
```

## 🏛️ 数据传输对象设计

### DTO设计原则
- **输入验证**: 所有输入DTO包含完整的参数验证
- **输出控制**: 输出VO不包含敏感信息
- **类型安全**: 使用强类型而非弱类型
- **文档完整**: 每个字段都有清晰的注释和示例

### 查询DTO设计

#### 基础查询DTO
```java
/**
 * AI模块基础查询DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public abstract class BaseAiQueryDto extends PageQuery {
    
    /** 租户ID */
    private String tenantId;
    
    /** 创建时间范围 */
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTimeStart;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTimeEnd;
    
    /** 状态 */
    private String status;
}
```

#### 聊天会话查询DTO
```java
/**
 * AI聊天会话查询DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "AI聊天会话查询参数")
public class AiChatSessionQueryDto extends BaseAiQueryDto {
    
    /** 会话标题 */
    @Schema(description = "会话标题", example = "关于Spring Boot的问题")
    private String sessionTitle;
    
    /** 会话类型 */
    @Schema(description = "会话类型", example = "chat", allowableValues = {"chat", "agent", "knowledge"})
    private String sessionType;
    
    /** 模型类型 */
    @Schema(description = "模型类型", example = "openai")
    private String modelType;
    
    /** 用户ID */
    @Schema(description = "用户ID", example = "1")
    private Long userId;
}
```

### 创建DTO设计

#### 聊天会话创建DTO
```java
/**
 * AI聊天会话创建DTO
 */
@Data
@Schema(description = "AI聊天会话创建参数")
public class AiChatSessionCreateDto {
    
    /** 会话标题 */
    @NotBlank(message = "会话标题不能为空")
    @Length(max = 200, message = "会话标题长度不能超过200字符")
    @Schema(description = "会话标题", example = "关于Java编程的讨论", required = true)
    private String sessionTitle;
    
    /** 会话类型 */
    @NotBlank(message = "会话类型不能为空")
    @Pattern(regexp = "^(chat|agent|knowledge)$", message = "会话类型只能是 chat、agent 或 knowledge")
    @Schema(description = "会话类型", example = "chat", required = true)
    private String sessionType;
    
    /** 模型名称 */
    @Schema(description = "模型名称", example = "gpt-4")
    private String modelName;
    
    /** 会话配置 */
    @Valid
    @Schema(description = "会话配置")
    private AiSessionConfigDto sessionConfig;
    
    /** 备注 */
    @Length(max = 500, message = "备注长度不能超过500字符")
    @Schema(description = "备注", example = "这是一个关于技术讨论的会话")
    private String remark;
}

/**
 * AI会话配置DTO
 */
@Data
@Schema(description = "AI会话配置")
public class AiSessionConfigDto {
    
    /** 系统提示词 */
    @Length(max = 2000, message = "系统提示词长度不能超过2000字符")
    @Schema(description = "系统提示词", example = "你是一个专业的Java编程助手")
    private String systemPrompt;
    
    /** 温度参数 */
    @DecimalMin(value = "0.0", message = "温度参数不能小于0")
    @DecimalMax(value = "2.0", message = "温度参数不能大于2")
    @Schema(description = "温度参数", example = "0.7")
    private BigDecimal temperature;
    
    /** 最大令牌数 */
    @Min(value = 1, message = "最大令牌数不能小于1")
    @Max(value = 32768, message = "最大令牌数不能大于32768")
    @Schema(description = "最大令牌数", example = "4096")
    private Integer maxTokens;
    
    /** 关联知识库ID列表 */
    @Schema(description = "关联知识库ID列表", example = "[1, 2, 3]")
    private List<Long> knowledgeBaseIds;
}
```

#### 消息发送DTO
```java
/**
 * AI聊天消息发送DTO
 */
@Data
@Schema(description = "AI聊天消息发送参数")
public class AiChatMessageSendDto {
    
    /** 消息内容 */
    @NotBlank(message = "消息内容不能为空")
    @Length(max = 10000, message = "消息内容长度不能超过10000字符")
    @Schema(description = "消息内容", example = "请帮我解释一下Spring Boot的自动配置原理", required = true)
    private String content;
    
    /** 内容类型 */
    @Pattern(regexp = "^(text|image|file|code)$", message = "内容类型只能是 text、image、file 或 code")
    @Schema(description = "内容类型", example = "text")
    private String contentType = "text";
    
    /** 父消息ID */
    @Schema(description = "父消息ID(回复消息时使用)", example = "123")
    private Long parentMessageId;
    
    /** 附件URL列表 */
    @Schema(description = "附件URL列表")
    private List<String> attachmentUrls;
    
    /** 是否流式响应 */
    @Schema(description = "是否流式响应", example = "true")
    private Boolean stream = false;
    
    /** 扩展元数据 */
    @Schema(description = "扩展元数据")
    private Map<String, Object> metadata;
}
```

### 视图对象设计

#### 会话视图对象
```java
/**
 * AI聊天会话视图对象
 */
@Data
@Schema(description = "AI聊天会话信息")
public class AiChatSessionVo {
    
    /** 会话ID */
    @Schema(description = "会话ID", example = "1")
    private Long sessionId;
    
    /** 会话标题 */
    @Schema(description = "会话标题", example = "关于Spring Boot的讨论")
    private String sessionTitle;
    
    /** 会话类型 */
    @Schema(description = "会话类型", example = "chat")
    private String sessionType;
    
    /** 模型信息 */
    @Schema(description = "模型信息")
    private AiModelInfoVo modelInfo;
    
    /** 消息数量 */
    @Schema(description = "消息数量", example = "15")
    private Integer messageCount;
    
    /** 使用的令牌数 */
    @Schema(description = "使用的令牌数", example = "1500")
    private Integer tokenUsed;
    
    /** 状态 */
    @Schema(description = "状态", example = "1")
    private String status;
    
    /** 最后消息时间 */
    @Schema(description = "最后消息时间", example = "2024-01-01 12:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastMessageTime;
    
    /** 创建时间 */
    @Schema(description = "创建时间", example = "2024-01-01 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    /** 备注 */
    @Schema(description = "备注")
    private String remark;
}

/**
 * AI模型信息视图对象
 */
@Data
@Schema(description = "AI模型信息")
public class AiModelInfoVo {
    
    /** 模型名称 */
    @Schema(description = "模型名称", example = "gpt-4")
    private String modelName;
    
    /** 模型类型 */
    @Schema(description = "模型类型", example = "openai")
    private String modelType;
    
    /** 提供商 */
    @Schema(description = "提供商", example = "OpenAI")
    private String provider;
    
    /** 模型版本 */
    @Schema(description = "模型版本", example = "2024-01-01")
    private String modelVersion;
}
```

## ⚠️ 异常处理机制

### 异常体系设计

#### AI模块异常基类
```java
/**
 * AI模块异常基类
 */
public abstract class AiException extends ServiceException {
    
    protected AiException(String message) {
        super(message);
    }
    
    protected AiException(String message, Throwable cause) {
        super(message, cause);
    }
    
    protected AiException(String code, String message) {
        super(code, message);
    }
    
    /**
     * 获取异常类型
     */
    public abstract String getExceptionType();
}
```

#### 具体异常类型
```java
/**
 * AI模型异常
 */
public class AiModelException extends AiException {
    
    public AiModelException(String message) {
        super("AI_MODEL_ERROR", message);
    }
    
    @Override
    public String getExceptionType() {
        return "MODEL_ERROR";
    }
}

/**
 * AI向量数据库异常
 */
public class AiVectorException extends AiException {
    
    public AiVectorException(String message) {
        super("AI_VECTOR_ERROR", message);
    }
    
    @Override
    public String getExceptionType() {
        return "VECTOR_ERROR";
    }
}

/**
 * AI Agent执行异常
 */
public class AiAgentException extends AiException {
    
    private final String agentId;
    private final String executionId;
    
    public AiAgentException(String agentId, String executionId, String message) {
        super("AI_AGENT_ERROR", message);
        this.agentId = agentId;
        this.executionId = executionId;
    }
    
    @Override
    public String getExceptionType() {
        return "AGENT_ERROR";
    }
}
```

### 全局异常处理器

#### AiGlobalExceptionHandler
```java
/**
 * AI模块全局异常处理器
 */
@RestControllerAdvice(basePackages = "org.dromara.ai")
@Order(1)
@Slf4j
public class AiGlobalExceptionHandler {
    
    /**
     * AI模型异常处理
     */
    @ExceptionHandler(AiModelException.class)
    public R<Void> handleAiModelException(AiModelException e) {
        log.error("AI模型异常: {}", e.getMessage(), e);
        return R.fail("AI_MODEL_ERROR", "AI模型服务异常，请稍后重试");
    }
    
    /**
     * AI向量数据库异常处理
     */
    @ExceptionHandler(AiVectorException.class)
    public R<Void> handleAiVectorException(AiVectorException e) {
        log.error("AI向量数据库异常: {}", e.getMessage(), e);
        return R.fail("AI_VECTOR_ERROR", "知识库服务异常，请稍后重试");
    }
    
    /**
     * AI Agent异常处理
     */
    @ExceptionHandler(AiAgentException.class)
    public R<Void> handleAiAgentException(AiAgentException e) {
        log.error("AI Agent异常: {}", e.getMessage(), e);
        
        // 记录Agent执行失败日志
        recordAgentExecutionFailure(e);
        
        return R.fail("AI_AGENT_ERROR", "智能助手执行异常: " + e.getMessage());
    }
    
    /**
     * 参数验证异常处理
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidationException(MethodArgumentNotValidException e) {
        List<String> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.toList());
            
        String message = String.join(", ", errors);
        return R.fail("VALIDATION_ERROR", "参数验证失败: " + message);
    }
    
    /**
     * 限流异常处理
     */
    @ExceptionHandler(RateLimitException.class)
    public R<Void> handleRateLimitException(RateLimitException e) {
        log.warn("AI服务限流: {}", e.getMessage());
        return R.fail("RATE_LIMIT_ERROR", "请求过于频繁，请稍后重试");
    }
    
    private void recordAgentExecutionFailure(AiAgentException e) {
        // 记录到数据库或监控系统
        try {
            // 实现失败记录逻辑
        } catch (Exception ex) {
            log.error("记录Agent执行失败异常", ex);
        }
    }
}
```

## 🔐 安全集成设计

### 权限注解设计

#### AI权限注解
```java
/**
 * AI功能权限检查注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AiPermission {
    
    /**
     * 权限编码
     */
    String[] value() default {};
    
    /**
     * AI功能类型
     */
    AiFunctionType type() default AiFunctionType.CHAT;
    
    /**
     * 是否检查资源所有权
     */
    boolean checkOwnership() default true;
    
    /**
     * 错误消息
     */
    String message() default "无权限访问此AI功能";
}

/**
 * AI功能类型枚举
 */
public enum AiFunctionType {
    CHAT("聊天对话"),
    KNOWLEDGE("知识库"),
    AGENT("智能体"),
    MODEL("模型管理");
    
    private final String description;
}
```

### 权限检查切面
```java
/**
 * AI权限检查切面
 */
@Aspect
@Component
@Order(1)
@Slf4j
public class AiPermissionAspect {
    
    @Around("@annotation(aiPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, AiPermission aiPermission) throws Throwable {
        
        // 1. 基础权限检查
        checkBasicPermission(aiPermission);
        
        // 2. 资源所有权检查
        if (aiPermission.checkOwnership()) {
            checkResourceOwnership(joinPoint, aiPermission);
        }
        
        // 3. 功能特定权限检查
        checkFunctionSpecificPermission(aiPermission);
        
        // 4. 执行目标方法
        return joinPoint.proceed();
    }
    
    private void checkBasicPermission(AiPermission aiPermission) {
        for (String permission : aiPermission.value()) {
            if (!SecurityUtils.hasPermission(permission)) {
                throw new ServiceException(aiPermission.message());
            }
        }
    }
    
    private void checkResourceOwnership(ProceedingJoinPoint joinPoint, AiPermission aiPermission) {
        // 实现资源所有权检查逻辑
        Object[] args = joinPoint.getArgs();
        // ... 检查逻辑
    }
    
    private void checkFunctionSpecificPermission(AiPermission aiPermission) {
        // 根据AI功能类型进行特定检查
        switch (aiPermission.type()) {
            case CHAT:
                checkChatPermission();
                break;
            case KNOWLEDGE:
                checkKnowledgePermission();
                break;
            case AGENT:
                checkAgentPermission();
                break;
            case MODEL:
                checkModelPermission();
                break;
        }
    }
}
```

## 📊 监控集成设计

### 性能监控切面
```java
/**
 * AI功能性能监控切面
 */
@Aspect
@Component
@Order(2)
@Slf4j
public class AiPerformanceAspect {
    
    private final MeterRegistry meterRegistry;
    
    @Around("execution(* org.dromara.ai.service..*.*(..))")
    public Object monitorPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            Object result = joinPoint.proceed();
            
            // 记录成功指标
            meterRegistry.counter("ai.method.success",
                "class", className,
                "method", methodName).increment();
                
            return result;
            
        } catch (Exception e) {
            // 记录失败指标
            meterRegistry.counter("ai.method.error",
                "class", className,
                "method", methodName,
                "exception", e.getClass().getSimpleName()).increment();
                
            throw e;
            
        } finally {
            // 记录执行时间
            sample.stop(Timer.builder("ai.method.duration")
                .description("AI方法执行时间")
                .tag("class", className)
                .tag("method", methodName)
                .register(meterRegistry));
        }
    }
}
```

---

**文档状态**: 初版设计，待讨论和完善  
**设计版本**: v1.0  
**最后更新**: 2025年9月20日  
**下一步**: 根据反馈调整接口设计和类结构