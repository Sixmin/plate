/*
 Navicat Premium Dump SQL

 Source Server         : localhost_5432
 Source Server Type    : PostgreSQL
 Source Server Version : 170005 (170005)
 Source Host           : localhost:5432
 Source Catalog        : plate
 Source Schema         : plate

 Target Server Type    : PostgreSQL
 Target Server Version : 170005 (170005)
 File Encoding         : 65001

 Date: 24/09/2025 21:26:14
*/


-- ----------------------------
-- Table structure for ai_agent_config
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_agent_config";
CREATE TABLE "plate"."ai_agent_config" (
  "agent_id" int8 NOT NULL DEFAULT nextval('"plate".ai_agent_config_agent_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "agent_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "agent_code" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "agent_type" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "avatar_url" varchar(200) COLLATE "pg_catalog"."default",
  "system_prompt" text COLLATE "pg_catalog"."default",
  "model_config" jsonb,
  "tool_configs" jsonb,
  "knowledge_bases" int8[],
  "permissions" jsonb,
  "rate_limit" jsonb,
  "version" varchar(20) COLLATE "pg_catalog"."default" DEFAULT '1.0.0'::character varying,
  "is_public" bool DEFAULT false,
  "usage_count" int4 DEFAULT 0,
  "status" char(1) COLLATE "pg_catalog"."default" DEFAULT '1'::bpchar,
  "create_dept" int8,
  "create_by" int8,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_by" int8,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "remark" varchar(500) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "plate"."ai_agent_config"."agent_id" IS 'Agent ID';
COMMENT ON COLUMN "plate"."ai_agent_config"."agent_name" IS 'Agent名称';
COMMENT ON COLUMN "plate"."ai_agent_config"."agent_code" IS 'Agent编码';
COMMENT ON COLUMN "plate"."ai_agent_config"."agent_type" IS 'Agent类型: sql/document/code/data_analysis';
COMMENT ON COLUMN "plate"."ai_agent_config"."system_prompt" IS '系统提示词';
COMMENT ON TABLE "plate"."ai_agent_config" IS 'AI智能体配置表';

-- ----------------------------
-- Table structure for ai_agent_execution
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_agent_execution";
CREATE TABLE "plate"."ai_agent_execution" (
  "execution_id" int8 NOT NULL DEFAULT nextval('"plate".ai_agent_execution_execution_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "agent_id" int8 NOT NULL,
  "session_id" int8,
  "user_id" int8 NOT NULL,
  "execution_type" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "input_data" jsonb NOT NULL,
  "output_data" jsonb,
  "tool_calls" jsonb,
  "execution_steps" jsonb,
  "start_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "end_time" timestamp(6),
  "duration_ms" int4,
  "token_usage" jsonb,
  "execution_status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'running'::character varying,
  "error_message" text COLLATE "pg_catalog"."default",
  "metadata" jsonb
)
;
COMMENT ON COLUMN "plate"."ai_agent_execution"."execution_id" IS '执行ID';
COMMENT ON COLUMN "plate"."ai_agent_execution"."agent_id" IS 'Agent ID';
COMMENT ON COLUMN "plate"."ai_agent_execution"."execution_type" IS '执行类型: sync/async';
COMMENT ON COLUMN "plate"."ai_agent_execution"."execution_status" IS '执行状态: running/completed/error/timeout';
COMMENT ON TABLE "plate"."ai_agent_execution" IS 'AI智能体执行记录表';

-- ----------------------------
-- Table structure for ai_chat_message
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_chat_message";
CREATE TABLE "plate"."ai_chat_message" (
  "message_id" int8 NOT NULL DEFAULT nextval('"plate".ai_chat_message_message_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "session_id" int8 NOT NULL,
  "parent_message_id" int8,
  "message_type" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "role" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "content_type" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'text'::character varying,
  "model_info" jsonb,
  "usage_info" jsonb,
  "metadata" jsonb,
  "attachment_urls" text[] COLLATE "pg_catalog"."default",
  "tool_calls" jsonb,
  "error_info" jsonb,
  "status" char(1) COLLATE "pg_catalog"."default" DEFAULT '1'::bpchar,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "plate"."ai_chat_message"."message_id" IS '消息ID';
COMMENT ON COLUMN "plate"."ai_chat_message"."session_id" IS '会话ID';
COMMENT ON COLUMN "plate"."ai_chat_message"."parent_message_id" IS '父消息ID(回复消息)';
COMMENT ON COLUMN "plate"."ai_chat_message"."message_type" IS '消息类型: user/assistant/system/tool';
COMMENT ON COLUMN "plate"."ai_chat_message"."role" IS '角色: user/assistant/system';
COMMENT ON COLUMN "plate"."ai_chat_message"."content" IS '消息内容';
COMMENT ON COLUMN "plate"."ai_chat_message"."content_type" IS '内容类型: text/image/file/code';
COMMENT ON TABLE "plate"."ai_chat_message" IS 'AI对话消息表';

-- ----------------------------
-- Table structure for ai_chat_session
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_chat_session";
CREATE TABLE "plate"."ai_chat_session" (
  "session_id" int8 NOT NULL DEFAULT nextval('"plate".ai_chat_session_session_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "user_id" int8 NOT NULL,
  "session_title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "session_type" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'chat'::character varying,
  "model_type" varchar(50) COLLATE "pg_catalog"."default",
  "model_name" varchar(100) COLLATE "pg_catalog"."default",
  "session_config" jsonb,
  "message_count" int4 DEFAULT 0,
  "token_used" int4 DEFAULT 0,
  "status" char(1) COLLATE "pg_catalog"."default" DEFAULT '1'::bpchar,
  "last_message_time" timestamp(6),
  "create_dept" int8,
  "create_by" int8,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_by" int8,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "remark" varchar(500) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "plate"."ai_chat_session"."session_id" IS '会话ID';
COMMENT ON COLUMN "plate"."ai_chat_session"."tenant_id" IS '租户ID';
COMMENT ON COLUMN "plate"."ai_chat_session"."user_id" IS '用户ID';
COMMENT ON COLUMN "plate"."ai_chat_session"."session_title" IS '会话标题';
COMMENT ON COLUMN "plate"."ai_chat_session"."session_type" IS '会话类型: chat/agent/knowledge';
COMMENT ON COLUMN "plate"."ai_chat_session"."model_type" IS '模型类型: openai/ollama/qwen';
COMMENT ON COLUMN "plate"."ai_chat_session"."model_name" IS '模型名称';
COMMENT ON COLUMN "plate"."ai_chat_session"."session_config" IS '会话配置(JSON格式)';
COMMENT ON COLUMN "plate"."ai_chat_session"."message_count" IS '消息数量';
COMMENT ON COLUMN "plate"."ai_chat_session"."token_used" IS '使用的token数';
COMMENT ON COLUMN "plate"."ai_chat_session"."status" IS '状态: 1=活跃 0=归档 2=删除';
COMMENT ON TABLE "plate"."ai_chat_session" IS 'AI对话会话表';

-- ----------------------------
-- Table structure for ai_collection_config
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_collection_config";
CREATE TABLE "plate"."ai_collection_config" (
  "collection_id" int8 NOT NULL DEFAULT nextval('"plate".ai_collection_config_collection_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "collection_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "kb_id" int8,
  "vector_dimension" int4 NOT NULL,
  "distance_metric" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'cosine'::character varying,
  "index_config" jsonb,
  "shard_count" int4 DEFAULT 1,
  "replication_factor" int4 DEFAULT 1,
  "vector_count" int4 DEFAULT 0,
  "collection_status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'active'::character varying,
  "qdrant_url" varchar(200) COLLATE "pg_catalog"."default",
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "plate"."ai_collection_config"."collection_id" IS '集合ID';
COMMENT ON COLUMN "plate"."ai_collection_config"."collection_name" IS '集合名称';
COMMENT ON COLUMN "plate"."ai_collection_config"."vector_dimension" IS '向量维度';
COMMENT ON COLUMN "plate"."ai_collection_config"."distance_metric" IS '距离度量: cosine/euclidean/dot';
COMMENT ON TABLE "plate"."ai_collection_config" IS 'AI向量集合配置表';

-- ----------------------------
-- Table structure for ai_document
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_document";
CREATE TABLE "plate"."ai_document" (
  "doc_id" int8 NOT NULL DEFAULT nextval('"plate".ai_document_doc_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "kb_id" int8 NOT NULL,
  "file_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "original_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "file_path" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "file_url" varchar(500) COLLATE "pg_catalog"."default",
  "file_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "file_size" int8 NOT NULL,
  "file_hash" varchar(64) COLLATE "pg_catalog"."default",
  "encoding" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'UTF-8'::character varying,
  "language" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 'zh'::character varying,
  "doc_status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'pending'::character varying,
  "chunk_count" int4 DEFAULT 0,
  "vector_count" int4 DEFAULT 0,
  "process_log" text COLLATE "pg_catalog"."default",
  "extracted_text" text COLLATE "pg_catalog"."default",
  "metadata" jsonb,
  "tags" varchar(200)[] COLLATE "pg_catalog"."default",
  "last_process_time" timestamp(6),
  "create_dept" int8,
  "create_by" int8,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_by" int8,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "plate"."ai_document"."doc_id" IS '文档ID';
COMMENT ON COLUMN "plate"."ai_document"."kb_id" IS '知识库ID';
COMMENT ON COLUMN "plate"."ai_document"."file_name" IS '文件名';
COMMENT ON COLUMN "plate"."ai_document"."original_name" IS '原始文件名';
COMMENT ON COLUMN "plate"."ai_document"."file_path" IS '文件存储路径';
COMMENT ON COLUMN "plate"."ai_document"."file_type" IS '文件类型: pdf/docx/txt/md';
COMMENT ON COLUMN "plate"."ai_document"."doc_status" IS '文档状态: pending/processing/completed/error';
COMMENT ON TABLE "plate"."ai_document" IS 'AI文档表';

-- ----------------------------
-- Table structure for ai_document_chunk
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_document_chunk";
CREATE TABLE "plate"."ai_document_chunk" (
  "chunk_id" int8 NOT NULL DEFAULT nextval('"plate".ai_document_chunk_chunk_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "doc_id" int8 NOT NULL,
  "kb_id" int8 NOT NULL,
  "chunk_text" text COLLATE "pg_catalog"."default" NOT NULL,
  "chunk_title" varchar(200) COLLATE "pg_catalog"."default",
  "chunk_index" int4 NOT NULL,
  "chunk_hash" varchar(64) COLLATE "pg_catalog"."default",
  "token_count" int4,
  "char_count" int4,
  "start_position" int4,
  "end_position" int4,
  "vector_id" varchar(100) COLLATE "pg_catalog"."default",
  "embedding_model" varchar(100) COLLATE "pg_catalog"."default",
  "metadata" jsonb,
  "keywords" varchar(100)[] COLLATE "pg_catalog"."default",
  "similarity_hash" varchar(64) COLLATE "pg_catalog"."default",
  "status" char(1) COLLATE "pg_catalog"."default" DEFAULT '1'::bpchar,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "plate"."ai_document_chunk"."chunk_id" IS '分块ID';
COMMENT ON COLUMN "plate"."ai_document_chunk"."doc_id" IS '文档ID';
COMMENT ON COLUMN "plate"."ai_document_chunk"."kb_id" IS '知识库ID';
COMMENT ON COLUMN "plate"."ai_document_chunk"."chunk_text" IS '分块文本内容';
COMMENT ON COLUMN "plate"."ai_document_chunk"."chunk_index" IS '分块序号';
COMMENT ON COLUMN "plate"."ai_document_chunk"."vector_id" IS 'Qdrant向量ID';
COMMENT ON TABLE "plate"."ai_document_chunk" IS 'AI文档分块表';

-- ----------------------------
-- Table structure for ai_knowledge_base
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_knowledge_base";
CREATE TABLE "plate"."ai_knowledge_base" (
  "kb_id" int8 NOT NULL DEFAULT nextval('"plate".ai_knowledge_base_kb_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "kb_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "kb_code" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "kb_type" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'general'::character varying,
  "vector_dimension" int4 DEFAULT 1536,
  "collection_name" varchar(100) COLLATE "pg_catalog"."default",
  "chunk_size" int4 DEFAULT 512,
  "chunk_overlap" int4 DEFAULT 50,
  "embedding_model" varchar(100) COLLATE "pg_catalog"."default",
  "settings" jsonb,
  "document_count" int4 DEFAULT 0,
  "chunk_count" int4 DEFAULT 0,
  "index_status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'ready'::character varying,
  "last_index_time" timestamp(6),
  "status" char(1) COLLATE "pg_catalog"."default" DEFAULT '1'::bpchar,
  "create_dept" int8,
  "create_by" int8,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_by" int8,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "remark" varchar(500) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "plate"."ai_knowledge_base"."kb_id" IS '知识库ID';
COMMENT ON COLUMN "plate"."ai_knowledge_base"."kb_name" IS '知识库名称';
COMMENT ON COLUMN "plate"."ai_knowledge_base"."kb_code" IS '知识库编码';
COMMENT ON COLUMN "plate"."ai_knowledge_base"."kb_type" IS '知识库类型: general/faq/manual/code';
COMMENT ON COLUMN "plate"."ai_knowledge_base"."vector_dimension" IS '向量维度';
COMMENT ON COLUMN "plate"."ai_knowledge_base"."collection_name" IS 'Qdrant集合名称';
COMMENT ON TABLE "plate"."ai_knowledge_base" IS 'AI知识库表';

-- ----------------------------
-- Table structure for ai_model_config
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_model_config";
CREATE TABLE "plate"."ai_model_config" (
  "model_id" int8 NOT NULL DEFAULT nextval('"plate".ai_model_config_model_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "model_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "model_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "provider" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "model_version" varchar(50) COLLATE "pg_catalog"."default",
  "api_endpoint" varchar(200) COLLATE "pg_catalog"."default",
  "api_key_encrypted" varchar(500) COLLATE "pg_catalog"."default",
  "model_params" jsonb,
  "rate_limit" jsonb,
  "cost_config" jsonb,
  "max_tokens" int4 DEFAULT 4096,
  "temperature" numeric(3,2) DEFAULT 0.7,
  "is_default" bool DEFAULT false,
  "is_active" bool DEFAULT true,
  "priority" int4 DEFAULT 5,
  "health_status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'unknown'::character varying,
  "last_check_time" timestamp(6),
  "create_dept" int8,
  "create_by" int8,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_by" int8,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "remark" varchar(500) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "plate"."ai_model_config"."model_id" IS '模型ID';
COMMENT ON COLUMN "plate"."ai_model_config"."model_name" IS '模型名称';
COMMENT ON COLUMN "plate"."ai_model_config"."model_type" IS '模型类型: openai/ollama/qwen/custom';
COMMENT ON COLUMN "plate"."ai_model_config"."provider" IS '提供商: openai/alibaba/local';
COMMENT ON COLUMN "plate"."ai_model_config"."api_key_encrypted" IS '加密的API密钥';
COMMENT ON TABLE "plate"."ai_model_config" IS 'AI模型配置表';

-- ----------------------------
-- Table structure for ai_model_usage
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_model_usage";
CREATE TABLE "plate"."ai_model_usage" (
  "usage_id" int8 NOT NULL DEFAULT nextval('"plate".ai_model_usage_usage_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "model_id" int8 NOT NULL,
  "user_id" int8,
  "session_id" int8,
  "usage_date" date NOT NULL,
  "request_count" int4 DEFAULT 0,
  "input_tokens" int4 DEFAULT 0,
  "output_tokens" int4 DEFAULT 0,
  "total_tokens" int4 DEFAULT 0,
  "cost_amount" numeric(10,4) DEFAULT 0,
  "success_count" int4 DEFAULT 0,
  "error_count" int4 DEFAULT 0,
  "avg_response_time" int4 DEFAULT 0,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "plate"."ai_model_usage"."usage_id" IS '使用记录ID';
COMMENT ON COLUMN "plate"."ai_model_usage"."model_id" IS '模型ID';
COMMENT ON COLUMN "plate"."ai_model_usage"."usage_date" IS '使用日期';
COMMENT ON COLUMN "plate"."ai_model_usage"."request_count" IS '请求次数';
COMMENT ON COLUMN "plate"."ai_model_usage"."total_tokens" IS '总token数';
COMMENT ON TABLE "plate"."ai_model_usage" IS 'AI模型使用统计表';

-- ----------------------------
-- Table structure for ai_system_config
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_system_config";
CREATE TABLE "plate"."ai_system_config" (
  "config_id" int8 NOT NULL DEFAULT nextval('"plate".ai_system_config_config_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "config_key" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "config_value" text COLLATE "pg_catalog"."default",
  "config_type" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'string'::character varying,
  "config_group" varchar(50) COLLATE "pg_catalog"."default",
  "description" varchar(200) COLLATE "pg_catalog"."default",
  "is_encrypted" bool DEFAULT false,
  "is_public" bool DEFAULT false,
  "sort_order" int4 DEFAULT 0,
  "status" char(1) COLLATE "pg_catalog"."default" DEFAULT '1'::bpchar,
  "create_by" int8,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "update_by" int8,
  "update_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "remark" varchar(500) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "plate"."ai_system_config"."config_id" IS '配置ID';
COMMENT ON COLUMN "plate"."ai_system_config"."config_key" IS '配置键';
COMMENT ON COLUMN "plate"."ai_system_config"."config_value" IS '配置值';
COMMENT ON COLUMN "plate"."ai_system_config"."config_type" IS '配置类型: string/number/boolean/json';
COMMENT ON TABLE "plate"."ai_system_config" IS 'AI系统配置表';

-- ----------------------------
-- Table structure for ai_vector_index
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_vector_index";
CREATE TABLE "plate"."ai_vector_index" (
  "index_id" int8 NOT NULL DEFAULT nextval('"plate".ai_vector_index_index_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "vector_id" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "collection_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "source_type" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "source_id" int8 NOT NULL,
  "kb_id" int8,
  "embedding_model" varchar(100) COLLATE "pg_catalog"."default",
  "vector_dimension" int4 NOT NULL,
  "metadata" jsonb,
  "index_status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'active'::character varying,
  "create_time" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "plate"."ai_vector_index"."index_id" IS '索引ID';
COMMENT ON COLUMN "plate"."ai_vector_index"."vector_id" IS 'Qdrant向量ID';
COMMENT ON COLUMN "plate"."ai_vector_index"."collection_name" IS 'Qdrant集合名称';
COMMENT ON COLUMN "plate"."ai_vector_index"."source_type" IS '来源类型: document_chunk/query/message';
COMMENT ON COLUMN "plate"."ai_vector_index"."source_id" IS '来源数据ID';
COMMENT ON TABLE "plate"."ai_vector_index" IS 'AI向量索引表';

-- ----------------------------
-- Table structure for ai_operation_log_2024_09
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_operation_log_2024_09";
CREATE TABLE "plate"."ai_operation_log_2024_09" (
  "log_id" int8 NOT NULL DEFAULT nextval('"plate".ai_operation_log_log_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "user_id" int8,
  "operation_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "operation_action" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "resource_type" varchar(50) COLLATE "pg_catalog"."default",
  "resource_id" int8,
  "operation_desc" varchar(200) COLLATE "pg_catalog"."default",
  "request_params" jsonb,
  "response_data" jsonb,
  "operation_result" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'success'::character varying,
  "error_message" text COLLATE "pg_catalog"."default",
  "ip_address" varchar(50) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "execution_time" int4,
  "operation_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for ai_operation_log_2024_10
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_operation_log_2024_10";
CREATE TABLE "plate"."ai_operation_log_2024_10" (
  "log_id" int8 NOT NULL DEFAULT nextval('"plate".ai_operation_log_log_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "user_id" int8,
  "operation_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "operation_action" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "resource_type" varchar(50) COLLATE "pg_catalog"."default",
  "resource_id" int8,
  "operation_desc" varchar(200) COLLATE "pg_catalog"."default",
  "request_params" jsonb,
  "response_data" jsonb,
  "operation_result" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'success'::character varying,
  "error_message" text COLLATE "pg_catalog"."default",
  "ip_address" varchar(50) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "execution_time" int4,
  "operation_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for ai_operation_log_2024_11
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_operation_log_2024_11";
CREATE TABLE "plate"."ai_operation_log_2024_11" (
  "log_id" int8 NOT NULL DEFAULT nextval('"plate".ai_operation_log_log_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "user_id" int8,
  "operation_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "operation_action" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "resource_type" varchar(50) COLLATE "pg_catalog"."default",
  "resource_id" int8,
  "operation_desc" varchar(200) COLLATE "pg_catalog"."default",
  "request_params" jsonb,
  "response_data" jsonb,
  "operation_result" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'success'::character varying,
  "error_message" text COLLATE "pg_catalog"."default",
  "ip_address" varchar(50) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "execution_time" int4,
  "operation_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for ai_operation_log_2024_12
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_operation_log_2024_12";
CREATE TABLE "plate"."ai_operation_log_2024_12" (
  "log_id" int8 NOT NULL DEFAULT nextval('"plate".ai_operation_log_log_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "user_id" int8,
  "operation_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "operation_action" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "resource_type" varchar(50) COLLATE "pg_catalog"."default",
  "resource_id" int8,
  "operation_desc" varchar(200) COLLATE "pg_catalog"."default",
  "request_params" jsonb,
  "response_data" jsonb,
  "operation_result" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'success'::character varying,
  "error_message" text COLLATE "pg_catalog"."default",
  "ip_address" varchar(50) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "execution_time" int4,
  "operation_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for ai_operation_log_2025_01
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_operation_log_2025_01";
CREATE TABLE "plate"."ai_operation_log_2025_01" (
  "log_id" int8 NOT NULL DEFAULT nextval('"plate".ai_operation_log_log_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "user_id" int8,
  "operation_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "operation_action" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "resource_type" varchar(50) COLLATE "pg_catalog"."default",
  "resource_id" int8,
  "operation_desc" varchar(200) COLLATE "pg_catalog"."default",
  "request_params" jsonb,
  "response_data" jsonb,
  "operation_result" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'success'::character varying,
  "error_message" text COLLATE "pg_catalog"."default",
  "ip_address" varchar(50) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "execution_time" int4,
  "operation_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for ai_operation_log
-- ----------------------------
DROP TABLE IF EXISTS "plate"."ai_operation_log";
CREATE TABLE "plate"."ai_operation_log" (
  "log_id" int8 NOT NULL DEFAULT nextval('"plate".ai_operation_log_log_id_seq'::regclass),
  "tenant_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '000000'::character varying,
  "user_id" int8,
  "operation_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "operation_action" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "resource_type" varchar(50) COLLATE "pg_catalog"."default",
  "resource_id" int8,
  "operation_desc" varchar(200) COLLATE "pg_catalog"."default",
  "request_params" jsonb,
  "response_data" jsonb,
  "operation_result" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'success'::character varying,
  "error_message" text COLLATE "pg_catalog"."default",
  "ip_address" varchar(50) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "execution_time" int4,
  "operation_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
PARTITION BY RANGE (
  "operation_time" "pg_catalog"."timestamp_ops"
)
;
ALTER TABLE "plate"."ai_operation_log" ATTACH PARTITION "plate"."ai_operation_log_2024_09" FOR VALUES FROM (
'2024-09-01 00:00:00'
) TO (
'2024-10-01 00:00:00'
)
;
ALTER TABLE "plate"."ai_operation_log" ATTACH PARTITION "plate"."ai_operation_log_2024_10" FOR VALUES FROM (
'2024-10-01 00:00:00'
) TO (
'2024-11-01 00:00:00'
)
;
ALTER TABLE "plate"."ai_operation_log" ATTACH PARTITION "plate"."ai_operation_log_2024_11" FOR VALUES FROM (
'2024-11-01 00:00:00'
) TO (
'2024-12-01 00:00:00'
)
;
ALTER TABLE "plate"."ai_operation_log" ATTACH PARTITION "plate"."ai_operation_log_2024_12" FOR VALUES FROM (
'2024-12-01 00:00:00'
) TO (
'2025-01-01 00:00:00'
)
;
ALTER TABLE "plate"."ai_operation_log" ATTACH PARTITION "plate"."ai_operation_log_2025_01" FOR VALUES FROM (
'2025-01-01 00:00:00'
) TO (
'2025-02-01 00:00:00'
)
;
COMMENT ON COLUMN "plate"."ai_operation_log"."log_id" IS '日志ID';
COMMENT ON COLUMN "plate"."ai_operation_log"."operation_type" IS '操作类型: chat/knowledge/agent/config';
COMMENT ON COLUMN "plate"."ai_operation_log"."operation_action" IS '操作动作: create/update/delete/query';
COMMENT ON COLUMN "plate"."ai_operation_log"."resource_type" IS '资源类型: session/document/agent/model';
COMMENT ON TABLE "plate"."ai_operation_log" IS 'AI操作审计日志表(分区表)';

-- ----------------------------
-- Indexes structure for table ai_agent_config
-- ----------------------------
CREATE INDEX "idx_ai_agent_config_public" ON "plate"."ai_agent_config" USING btree (
  "is_public" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_agent_config_status" ON "plate"."ai_agent_config" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."bpchar_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_agent_config_tenant" ON "plate"."ai_agent_config" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_agent_config_type" ON "plate"."ai_agent_config" USING btree (
  "agent_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ai_agent_config
-- ----------------------------
ALTER TABLE "plate"."ai_agent_config" ADD CONSTRAINT "uk_agent_code_tenant" UNIQUE ("agent_code", "tenant_id");

-- ----------------------------
-- Primary Key structure for table ai_agent_config
-- ----------------------------
ALTER TABLE "plate"."ai_agent_config" ADD CONSTRAINT "ai_agent_config_pkey" PRIMARY KEY ("agent_id");

-- ----------------------------
-- Indexes structure for table ai_agent_execution
-- ----------------------------
CREATE INDEX "idx_ai_agent_execution_agent" ON "plate"."ai_agent_execution" USING btree (
  "agent_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_agent_execution_status" ON "plate"."ai_agent_execution" USING btree (
  "execution_status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_agent_execution_tenant" ON "plate"."ai_agent_execution" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_agent_execution_time" ON "plate"."ai_agent_execution" USING btree (
  "start_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_ai_agent_execution_user" ON "plate"."ai_agent_execution" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_agent_execution
-- ----------------------------
ALTER TABLE "plate"."ai_agent_execution" ADD CONSTRAINT "ai_agent_execution_pkey" PRIMARY KEY ("execution_id");

-- ----------------------------
-- Indexes structure for table ai_chat_message
-- ----------------------------
CREATE INDEX "idx_ai_chat_message_parent" ON "plate"."ai_chat_message" USING btree (
  "parent_message_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_chat_message_session" ON "plate"."ai_chat_message" USING btree (
  "session_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_chat_message_tenant" ON "plate"."ai_chat_message" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_chat_message_time" ON "plate"."ai_chat_message" USING btree (
  "create_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_ai_chat_message_type" ON "plate"."ai_chat_message" USING btree (
  "message_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_chat_message
-- ----------------------------
ALTER TABLE "plate"."ai_chat_message" ADD CONSTRAINT "ai_chat_message_pkey" PRIMARY KEY ("message_id");

-- ----------------------------
-- Indexes structure for table ai_chat_session
-- ----------------------------
CREATE INDEX "idx_ai_chat_session_status" ON "plate"."ai_chat_session" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."bpchar_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_chat_session_tenant" ON "plate"."ai_chat_session" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_chat_session_time" ON "plate"."ai_chat_session" USING btree (
  "create_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_ai_chat_session_type" ON "plate"."ai_chat_session" USING btree (
  "session_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_chat_session_user" ON "plate"."ai_chat_session" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_chat_session
-- ----------------------------
ALTER TABLE "plate"."ai_chat_session" ADD CONSTRAINT "ai_chat_session_pkey" PRIMARY KEY ("session_id");

-- ----------------------------
-- Indexes structure for table ai_collection_config
-- ----------------------------
CREATE INDEX "idx_ai_collection_config_kb" ON "plate"."ai_collection_config" USING btree (
  "kb_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_collection_config_status" ON "plate"."ai_collection_config" USING btree (
  "collection_status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_collection_config_tenant" ON "plate"."ai_collection_config" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ai_collection_config
-- ----------------------------
ALTER TABLE "plate"."ai_collection_config" ADD CONSTRAINT "uk_collection_name_tenant" UNIQUE ("collection_name", "tenant_id");

-- ----------------------------
-- Primary Key structure for table ai_collection_config
-- ----------------------------
ALTER TABLE "plate"."ai_collection_config" ADD CONSTRAINT "ai_collection_config_pkey" PRIMARY KEY ("collection_id");

-- ----------------------------
-- Indexes structure for table ai_document
-- ----------------------------
CREATE INDEX "idx_ai_document_hash" ON "plate"."ai_document" USING btree (
  "file_hash" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_kb" ON "plate"."ai_document" USING btree (
  "kb_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_status" ON "plate"."ai_document" USING btree (
  "doc_status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_tenant" ON "plate"."ai_document" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_type" ON "plate"."ai_document" USING btree (
  "file_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_document
-- ----------------------------
ALTER TABLE "plate"."ai_document" ADD CONSTRAINT "ai_document_pkey" PRIMARY KEY ("doc_id");

-- ----------------------------
-- Indexes structure for table ai_document_chunk
-- ----------------------------
CREATE INDEX "idx_ai_document_chunk_doc" ON "plate"."ai_document_chunk" USING btree (
  "doc_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_chunk_hash" ON "plate"."ai_document_chunk" USING btree (
  "chunk_hash" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_chunk_kb" ON "plate"."ai_document_chunk" USING btree (
  "kb_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_chunk_similarity" ON "plate"."ai_document_chunk" USING btree (
  "similarity_hash" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_chunk_tenant" ON "plate"."ai_document_chunk" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_document_chunk_vector" ON "plate"."ai_document_chunk" USING btree (
  "vector_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_document_chunk
-- ----------------------------
ALTER TABLE "plate"."ai_document_chunk" ADD CONSTRAINT "ai_document_chunk_pkey" PRIMARY KEY ("chunk_id");

-- ----------------------------
-- Indexes structure for table ai_knowledge_base
-- ----------------------------
CREATE INDEX "idx_ai_knowledge_base_status" ON "plate"."ai_knowledge_base" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."bpchar_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_knowledge_base_tenant" ON "plate"."ai_knowledge_base" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_knowledge_base_type" ON "plate"."ai_knowledge_base" USING btree (
  "kb_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ai_knowledge_base
-- ----------------------------
ALTER TABLE "plate"."ai_knowledge_base" ADD CONSTRAINT "uk_kb_code_tenant" UNIQUE ("kb_code", "tenant_id");

-- ----------------------------
-- Primary Key structure for table ai_knowledge_base
-- ----------------------------
ALTER TABLE "plate"."ai_knowledge_base" ADD CONSTRAINT "ai_knowledge_base_pkey" PRIMARY KEY ("kb_id");

-- ----------------------------
-- Indexes structure for table ai_model_config
-- ----------------------------
CREATE INDEX "idx_ai_model_config_active" ON "plate"."ai_model_config" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_model_config_priority" ON "plate"."ai_model_config" USING btree (
  "priority" "pg_catalog"."int4_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_ai_model_config_provider" ON "plate"."ai_model_config" USING btree (
  "provider" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_model_config_tenant" ON "plate"."ai_model_config" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_model_config_type" ON "plate"."ai_model_config" USING btree (
  "model_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_model_config
-- ----------------------------
ALTER TABLE "plate"."ai_model_config" ADD CONSTRAINT "ai_model_config_pkey" PRIMARY KEY ("model_id");

-- ----------------------------
-- Indexes structure for table ai_model_usage
-- ----------------------------
CREATE INDEX "idx_ai_model_usage_date" ON "plate"."ai_model_usage" USING btree (
  "usage_date" "pg_catalog"."date_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_ai_model_usage_model" ON "plate"."ai_model_usage" USING btree (
  "model_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_model_usage_tenant" ON "plate"."ai_model_usage" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_model_usage_user" ON "plate"."ai_model_usage" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ai_model_usage
-- ----------------------------
ALTER TABLE "plate"."ai_model_usage" ADD CONSTRAINT "uk_usage_model_date" UNIQUE ("tenant_id", "model_id", "user_id", "usage_date");

-- ----------------------------
-- Primary Key structure for table ai_model_usage
-- ----------------------------
ALTER TABLE "plate"."ai_model_usage" ADD CONSTRAINT "ai_model_usage_pkey" PRIMARY KEY ("usage_id");

-- ----------------------------
-- Indexes structure for table ai_system_config
-- ----------------------------
CREATE INDEX "idx_ai_system_config_group" ON "plate"."ai_system_config" USING btree (
  "config_group" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_system_config_status" ON "plate"."ai_system_config" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."bpchar_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_system_config_tenant" ON "plate"."ai_system_config" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ai_system_config
-- ----------------------------
ALTER TABLE "plate"."ai_system_config" ADD CONSTRAINT "uk_config_key_tenant" UNIQUE ("config_key", "tenant_id");

-- ----------------------------
-- Primary Key structure for table ai_system_config
-- ----------------------------
ALTER TABLE "plate"."ai_system_config" ADD CONSTRAINT "ai_system_config_pkey" PRIMARY KEY ("config_id");

-- ----------------------------
-- Indexes structure for table ai_vector_index
-- ----------------------------
CREATE INDEX "idx_ai_vector_index_collection" ON "plate"."ai_vector_index" USING btree (
  "collection_name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_vector_index_kb" ON "plate"."ai_vector_index" USING btree (
  "kb_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_vector_index_source" ON "plate"."ai_vector_index" USING btree (
  "source_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "source_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_vector_index_status" ON "plate"."ai_vector_index" USING btree (
  "index_status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_vector_index_tenant" ON "plate"."ai_vector_index" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ai_vector_index
-- ----------------------------
ALTER TABLE "plate"."ai_vector_index" ADD CONSTRAINT "uk_vector_id_collection" UNIQUE ("vector_id", "collection_name");

-- ----------------------------
-- Primary Key structure for table ai_vector_index
-- ----------------------------
ALTER TABLE "plate"."ai_vector_index" ADD CONSTRAINT "ai_vector_index_pkey" PRIMARY KEY ("index_id");

-- ----------------------------
-- Indexes structure for table ai_operation_log_2024_09
-- ----------------------------
CREATE INDEX "ai_operation_log_2024_09_operation_result_idx" ON "plate"."ai_operation_log_2024_09" USING btree (
  "operation_result" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_09_operation_time_idx" ON "plate"."ai_operation_log_2024_09" USING btree (
  "operation_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "ai_operation_log_2024_09_operation_type_idx" ON "plate"."ai_operation_log_2024_09" USING btree (
  "operation_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_09_tenant_id_idx" ON "plate"."ai_operation_log_2024_09" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_09_user_id_idx" ON "plate"."ai_operation_log_2024_09" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_operation_log_2024_09
-- ----------------------------
ALTER TABLE "plate"."ai_operation_log_2024_09" ADD CONSTRAINT "ai_operation_log_2024_09_pkey" PRIMARY KEY ("log_id", "operation_time");

-- ----------------------------
-- Indexes structure for table ai_operation_log_2024_10
-- ----------------------------
CREATE INDEX "ai_operation_log_2024_10_operation_result_idx" ON "plate"."ai_operation_log_2024_10" USING btree (
  "operation_result" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_10_operation_time_idx" ON "plate"."ai_operation_log_2024_10" USING btree (
  "operation_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "ai_operation_log_2024_10_operation_type_idx" ON "plate"."ai_operation_log_2024_10" USING btree (
  "operation_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_10_tenant_id_idx" ON "plate"."ai_operation_log_2024_10" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_10_user_id_idx" ON "plate"."ai_operation_log_2024_10" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_operation_log_2024_10
-- ----------------------------
ALTER TABLE "plate"."ai_operation_log_2024_10" ADD CONSTRAINT "ai_operation_log_2024_10_pkey" PRIMARY KEY ("log_id", "operation_time");

-- ----------------------------
-- Indexes structure for table ai_operation_log_2024_11
-- ----------------------------
CREATE INDEX "ai_operation_log_2024_11_operation_result_idx" ON "plate"."ai_operation_log_2024_11" USING btree (
  "operation_result" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_11_operation_time_idx" ON "plate"."ai_operation_log_2024_11" USING btree (
  "operation_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "ai_operation_log_2024_11_operation_type_idx" ON "plate"."ai_operation_log_2024_11" USING btree (
  "operation_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_11_tenant_id_idx" ON "plate"."ai_operation_log_2024_11" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_11_user_id_idx" ON "plate"."ai_operation_log_2024_11" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_operation_log_2024_11
-- ----------------------------
ALTER TABLE "plate"."ai_operation_log_2024_11" ADD CONSTRAINT "ai_operation_log_2024_11_pkey" PRIMARY KEY ("log_id", "operation_time");

-- ----------------------------
-- Indexes structure for table ai_operation_log_2024_12
-- ----------------------------
CREATE INDEX "ai_operation_log_2024_12_operation_result_idx" ON "plate"."ai_operation_log_2024_12" USING btree (
  "operation_result" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_12_operation_time_idx" ON "plate"."ai_operation_log_2024_12" USING btree (
  "operation_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "ai_operation_log_2024_12_operation_type_idx" ON "plate"."ai_operation_log_2024_12" USING btree (
  "operation_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_12_tenant_id_idx" ON "plate"."ai_operation_log_2024_12" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2024_12_user_id_idx" ON "plate"."ai_operation_log_2024_12" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_operation_log_2024_12
-- ----------------------------
ALTER TABLE "plate"."ai_operation_log_2024_12" ADD CONSTRAINT "ai_operation_log_2024_12_pkey" PRIMARY KEY ("log_id", "operation_time");

-- ----------------------------
-- Indexes structure for table ai_operation_log_2025_01
-- ----------------------------
CREATE INDEX "ai_operation_log_2025_01_operation_result_idx" ON "plate"."ai_operation_log_2025_01" USING btree (
  "operation_result" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2025_01_operation_time_idx" ON "plate"."ai_operation_log_2025_01" USING btree (
  "operation_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "ai_operation_log_2025_01_operation_type_idx" ON "plate"."ai_operation_log_2025_01" USING btree (
  "operation_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2025_01_tenant_id_idx" ON "plate"."ai_operation_log_2025_01" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ai_operation_log_2025_01_user_id_idx" ON "plate"."ai_operation_log_2025_01" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_operation_log_2025_01
-- ----------------------------
ALTER TABLE "plate"."ai_operation_log_2025_01" ADD CONSTRAINT "ai_operation_log_2025_01_pkey" PRIMARY KEY ("log_id", "operation_time");

-- ----------------------------
-- Indexes structure for table ai_operation_log
-- ----------------------------
CREATE INDEX "idx_ai_operation_log_result" ON "plate"."ai_operation_log" USING btree (
  "operation_result" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_operation_log_tenant" ON "plate"."ai_operation_log" USING btree (
  "tenant_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_operation_log_time" ON "plate"."ai_operation_log" USING btree (
  "operation_time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_ai_operation_log_type" ON "plate"."ai_operation_log" USING btree (
  "operation_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ai_operation_log_user" ON "plate"."ai_operation_log" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ai_operation_log
-- ----------------------------
ALTER TABLE "plate"."ai_operation_log" ADD CONSTRAINT "ai_operation_log_pkey" PRIMARY KEY ("log_id", "operation_time");

-- ----------------------------
-- Foreign Keys structure for table ai_agent_execution
-- ----------------------------
ALTER TABLE "plate"."ai_agent_execution" ADD CONSTRAINT "fk_execution_agent" FOREIGN KEY ("agent_id") REFERENCES "plate"."ai_agent_config" ("agent_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "plate"."ai_agent_execution" ADD CONSTRAINT "fk_execution_session" FOREIGN KEY ("session_id") REFERENCES "plate"."ai_chat_session" ("session_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ai_chat_message
-- ----------------------------
ALTER TABLE "plate"."ai_chat_message" ADD CONSTRAINT "fk_message_session" FOREIGN KEY ("session_id") REFERENCES "plate"."ai_chat_session" ("session_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ai_collection_config
-- ----------------------------
ALTER TABLE "plate"."ai_collection_config" ADD CONSTRAINT "fk_collection_kb" FOREIGN KEY ("kb_id") REFERENCES "plate"."ai_knowledge_base" ("kb_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ai_document
-- ----------------------------
ALTER TABLE "plate"."ai_document" ADD CONSTRAINT "fk_document_kb" FOREIGN KEY ("kb_id") REFERENCES "plate"."ai_knowledge_base" ("kb_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ai_document_chunk
-- ----------------------------
ALTER TABLE "plate"."ai_document_chunk" ADD CONSTRAINT "fk_chunk_document" FOREIGN KEY ("doc_id") REFERENCES "plate"."ai_document" ("doc_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "plate"."ai_document_chunk" ADD CONSTRAINT "fk_chunk_kb" FOREIGN KEY ("kb_id") REFERENCES "plate"."ai_knowledge_base" ("kb_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ai_model_usage
-- ----------------------------
ALTER TABLE "plate"."ai_model_usage" ADD CONSTRAINT "fk_usage_model" FOREIGN KEY ("model_id") REFERENCES "plate"."ai_model_config" ("model_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
