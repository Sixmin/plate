package org.dromara.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AI智能化模块配置属性
 * 
 * <p>企业级AI配置管理，支持6大配置域的分层架构：</p>
 * <ul>
 *   <li>AI核心配置域: 模型选择、API密钥管理</li>
 *   <li>LangChain4j配置域: 聊天模型、嵌入模型配置</li>
 *   <li>Qdrant配置域: 向量数据库连接和集合配置</li>
 *   <li>Model配置域: 模型参数和性能配置</li>
 *   <li>Cache配置域: 缓存策略和过期时间配置</li>
 *   <li>Monitor配置域: 监控指标和日志配置</li>
 * </ul>
 * 
 * @author Plate Team
 * @since 2025-09-24
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiProperties {

    /**
     * AI模块是否启用
     */
    private boolean enabled = false;

    /**
     * AI核心配置域
     */
    private Core core = new Core();

    /**
     * LangChain4j配置域
     */
    private LangChain4j langchain4j = new LangChain4j();

    /**
     * Qdrant向量数据库配置域
     */
    private Qdrant qdrant = new Qdrant();

    /**
     * 模型配置域
     */
    private Model model = new Model();

    /**
     * 缓存配置域
     */
    private Cache cache = new Cache();

    /**
     * 监控配置域
     */
    private Monitor monitor = new Monitor();

    /**
     * AI核心配置域
     */
    @Data
    public static class Core {
        /**
         * 默认模型提供商 (openai, ollama, dashscope)
         */
        private String defaultProvider = "openai";

        /**
         * API密钥 (支持ENC()加密)
         */
        private String apiKey;

        /**
         * API基础URL
         */
        private String baseUrl;

        /**
         * 请求超时时间(秒)
         */
        private int timeout = 60;

        /**
         * 重试次数
         */
        private int maxRetries = 3;
    }

    /**
     * LangChain4j配置域
     */
    @Data
    public static class LangChain4j {
        /**
         * 聊天模型配置
         */
        private ChatModel chatModel = new ChatModel();

        /**
         * 嵌入模型配置
         */
        private EmbeddingModel embeddingModel = new EmbeddingModel();

        /**
         * 聊天模型配置
         */
        @Data
        public static class ChatModel {
            /**
             * 模型名称
             */
            private String modelName = "gpt-3.5-turbo";

            /**
             * 温度参数 (0.0-2.0)
             */
            private double temperature = 0.7;

            /**
             * 最大token数
             */
            private int maxTokens = 4000;

            /**
             * 是否启用流式响应
             */
            private boolean streamingEnabled = true;
        }

        /**
         * 嵌入模型配置
         */
        @Data
        public static class EmbeddingModel {
            /**
             * 嵌入模型名称
             */
            private String modelName = "text-embedding-ada-002";

            /**
             * 批量处理大小
             */
            private int batchSize = 100;

            /**
             * 向量维度 (自动检测)
             */
            private int dimensions = 1536;
        }
    }

    /**
     * Qdrant向量数据库配置域
     */
    @Data
    public static class Qdrant {
        /**
         * 服务器地址
         */
        private String host = "localhost";

        /**
         * gRPC端口
         */
        private int port = 6334;

        /**
         * 是否使用TLS
         */
        private boolean useTls = false;

        /**
         * API密钥
         */
        private String apiKey;

        /**
         * 默认集合名称
         */
        private String defaultCollectionName = "ai_knowledge_base";

        /**
         * 向量距离算法 (Cosine, Euclid, Dot)
         */
        private String distanceFunction = "Cosine";

        /**
         * 连接池配置
         */
        private Pool pool = new Pool();

        /**
         * 连接池配置
         */
        @Data
        public static class Pool {
            /**
             * 最大连接数
             */
            private int maxConnections = 10;

            /**
             * 连接超时时间(毫秒)
             */
            private long connectTimeoutMs = 5000;

            /**
             * 空闲超时时间(毫秒)
             */
            private long idleTimeoutMs = 300000;
        }
    }

    /**
     * 模型配置域
     */
    @Data
    public static class Model {
        /**
         * 本地模型配置
         */
        private Local local = new Local();

        /**
         * 云端模型配置
         */
        private Cloud cloud = new Cloud();

        /**
         * 本地模型配置 (Ollama)
         */
        @Data
        public static class Local {
            /**
             * 是否启用本地模型
             */
            private boolean enabled = false;

            /**
             * Ollama服务地址
             */
            private String baseUrl = "http://localhost:11434";

            /**
             * 默认本地模型
             */
            private String defaultModel = "llama2";

            /**
             * 模型下载超时时间(秒)
             */
            private int downloadTimeout = 3600;
        }

        /**
         * 云端模型配置
         */
        @Data
        public static class Cloud {
            /**
             * OpenAI配置
             */
            private OpenAI openai = new OpenAI();

            /**
             * 通义千问配置
             */
            private DashScope dashscope = new DashScope();

            /**
             * OpenAI配置
             */
            @Data
            public static class OpenAI {
                /**
                 * 是否启用
                 */
                private boolean enabled = true;

                /**
                 * API密钥
                 */
                private String apiKey;

                /**
                 * 组织ID
                 */
                private String organizationId;

                /**
                 * 代理地址
                 */
                private String proxyHost;

                /**
                 * 代理端口
                 */
                private int proxyPort;
            }

            /**
             * 通义千问配置
             */
            @Data
            public static class DashScope {
                /**
                 * 是否启用
                 */
                private boolean enabled = false;

                /**
                 * API密钥
                 */
                private String apiKey;

                /**
                 * 工作空间
                 */
                private String workspace;
            }
        }
    }

    /**
     * 缓存配置域
     */
    @Data
    public static class Cache {
        /**
         * 是否启用缓存
         */
        private boolean enabled = true;

        /**
         * 聊天结果缓存时间(秒)
         */
        private int chatCacheTtl = 3600;

        /**
         * 嵌入向量缓存时间(秒)
         */
        private int embeddingCacheTtl = 86400;

        /**
         * 最大缓存条目数
         */
        private int maxCacheSize = 10000;

        /**
         * 缓存清理策略 (LRU, LFU, FIFO)
         */
        private String evictionPolicy = "LRU";
    }

    /**
     * 监控配置域
     */
    @Data
    public static class Monitor {
        /**
         * 是否启用监控
         */
        private boolean enabled = true;

        /**
         * 性能指标收集
         */
        private Metrics metrics = new Metrics();

        /**
         * 健康检查配置
         */
        private HealthCheck healthCheck = new HealthCheck();

        /**
         * 性能指标配置
         */
        @Data
        public static class Metrics {
            /**
             * 是否收集响应时间
             */
            private boolean responseTime = true;

            /**
             * 是否收集token使用量
             */
            private boolean tokenUsage = true;

            /**
             * 是否收集错误率
             */
            private boolean errorRate = true;

            /**
             * 指标导出间隔(秒)
             */
            private int exportInterval = 60;
        }

        /**
         * 健康检查配置
         */
        @Data
        public static class HealthCheck {
            /**
             * 检查间隔(秒)
             */
            private int interval = 30;

            /**
             * 超时时间(秒)
             */
            private int timeout = 10;

            /**
             * 失败阈值
             */
            private int failureThreshold = 3;

            /**
             * 恢复阈值
             */
            private int recoveryThreshold = 2;
        }
    }
}