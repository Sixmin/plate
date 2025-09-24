package org.dromara.ai.config;

import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

/**
 * AI模块核心配置类
 * 
 * <p>AI功能模块的基础配置，包括模块启用状态、基础参数等</p>
 * 
 * @author Plate Team
 * @since 2025-09-23
 */
@Slf4j
@Configuration
public class AiConfig {

    /**
     * AI模块初始化
     */
    public AiConfig() {
        log.info("AI智能化模块已启动 - ruoyi-ai module initialized");
        log.info("支持功能: 智能对话、知识库管理、AI Agent、向量检索");
    }
}