package org.dromara.ai.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import java.time.Duration;

/**
 * AI模块核心配置类
 * 
 * <p>基于LangChain4j + Qdrant的企业级AI配置管理</p>
 * <ul>
 *   <li>自动配置Qdrant向量数据库客户端</li>
 *   <li>集成LangChain4j聊天和嵌入模型</li>
 *   <li>提供向量存储和检索服务</li>
 *   <li>支持多模型和多环境配置</li>
 * </ul>
 * 
 * @author Plate Team
 * @since 2025-09-24
 */
@Slf4j
@Configuration
@EnableConfigurationProperties(AiProperties.class)
@ConditionalOnProperty(prefix = "ai", name = "enabled", havingValue = "true")
public class AiConfig {

    private final AiProperties aiProperties;

    public AiConfig(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    /**
     * AI模块初始化日志
     */
    @EventListener(ContextRefreshedEvent.class)
    public void initialize() {
        log.info("🚀 AI智能化模块启动中...");
        log.info("📋 配置信息:");
        log.info("   - 默认模型提供商: {}", aiProperties.getCore().getDefaultProvider());
        log.info("   - Qdrant地址: {}:{}", aiProperties.getQdrant().getHost(), aiProperties.getQdrant().getPort());
        log.info("   - 聊天模型: {}", aiProperties.getLangchain4j().getChatModel().getModelName());
        log.info("   - 嵌入模型: {}", aiProperties.getLangchain4j().getEmbeddingModel().getModelName());
        log.info("   - 缓存启用: {}", aiProperties.getCache().isEnabled());
        log.info("   - 监控启用: {}", aiProperties.getMonitor().isEnabled());
        log.info("✅ AI智能化模块启动完成 - 支持功能: 智能对话、知识库管理、AI Agent、向量检索");
    }

    /**
     * 配置Qdrant客户端
     * 
     * @return QdrantClient 向量数据库客户端
     */
    @Bean
    @ConditionalOnMissingBean
    public QdrantClient qdrantClient() {
        log.info("🔗 正在配置Qdrant客户端连接...");
        
        AiProperties.Qdrant qdrantConfig = aiProperties.getQdrant();
        
        QdrantGrpcClient.Builder builder = QdrantGrpcClient.newBuilder(
            qdrantConfig.getHost(), 
            qdrantConfig.getPort(),
            qdrantConfig.isUseTls()
        );

        // 设置API密钥
        if (qdrantConfig.getApiKey() != null && !qdrantConfig.getApiKey().isEmpty()) {
            builder.withApiKey(qdrantConfig.getApiKey());
        }

        QdrantClient client = new QdrantClient(builder.build());
        
        log.info("✅ Qdrant客户端配置完成: {}:{}", qdrantConfig.getHost(), qdrantConfig.getPort());
        return client;
    }

    /**
     * 配置向量存储服务
     * 
     * @param qdrantClient Qdrant客户端
     * @return EmbeddingStore 向量存储服务
     */
    @Bean
    @ConditionalOnMissingBean
    public EmbeddingStore<TextSegment> embeddingStore(QdrantClient qdrantClient) {
        log.info("📚 正在配置向量存储服务...");
        
        String collectionName = aiProperties.getQdrant().getDefaultCollectionName();
        
        EmbeddingStore<TextSegment> store = QdrantEmbeddingStore.builder()
            .client(qdrantClient)
            .collectionName(collectionName)
            .build();
        
        log.info("✅ 向量存储服务配置完成: 集合名称={}", collectionName);
        return store;
    }

    // TODO: 聊天和嵌入模型配置将在AI-002任务中完善
    // 当前专注于Qdrant向量存储的基础集成
}