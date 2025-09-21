# 数据库架构深度分析

## 数据库技术栈

### 核心数据库
- **主数据库**: PostgreSQL 15+
- **数据库驱动**: PostgreSQL JDBC Driver
- **连接池**: HikariCP (高性能连接池)
- **ORM框架**: MyBatis Plus 3.5.12

### 缓存层
- **分布式缓存**: Redis 7.0+
- **本地缓存**: Caffeine (可选)
- **缓存框架**: Spring Cache + Redisson

### 数据源配置
```yaml
spring:
  datasource:
    dynamic:
      primary: postgres
      strict: true
      datasource:
        postgres:
          type: com.zaxxer.hikari.HikariDataSource
          driverClassName: org.postgresql.Driver
          url: jdbc:postgresql://localhost:5432/plate?currentSchema=plate&useUnicode=true&characterEncoding=utf8&useSSL=true&autoReconnect=true&reWriteBatchedInserts=true
          username: postgres
          password: postgres
      hikari:
        maxPoolSize: 20          # 最大连接数
        minIdle: 10              # 最小空闲连接数
        connectionTimeout: 30000  # 连接超时时间
        validationTimeout: 5000   # 验证超时时间
        idleTimeout: 600000      # 空闲连接存活时间
        maxLifetime: 1800000     # 连接最长生命周期
```

## 多租户架构设计

### 租户隔离策略
- **隔离级别**: 行级数据隔离 (Row-Level Security)
- **隔离字段**: `tenant_id VARCHAR(20) DEFAULT '000000'`
- **默认租户**: 000000 (系统默认租户)

### 租户配置
```yaml
tenant:
  enable: true
  excludes:
    - sys_menu          # 系统菜单表 (全局共享)
    - sys_tenant        # 租户信息表
    - sys_tenant_package # 租户套餐表
    - sys_role_dept     # 角色部门关联表
    - sys_role_menu     # 角色菜单关联表
    - sys_user_post     # 用户岗位关联表
    - sys_user_role     # 用户角色关联表
    - sys_client        # 客户端配置表
    - sys_oss_config    # 对象存储配置表
```

### 租户数据流转
```sql
-- 自动注入租户条件示例
-- 原始SQL: SELECT * FROM sys_user WHERE status = '0'
-- 实际执行: SELECT * FROM sys_user WHERE status = '0' AND tenant_id = '000001'
```

## 核心数据表设计

### 用户权限体系

#### 用户表 (sys_user)
```sql
CREATE TABLE sys_user (
    user_id BIGSERIAL PRIMARY KEY,
    dept_id BIGINT,                          -- 部门ID
    user_name VARCHAR(30) NOT NULL UNIQUE,   -- 用户账号
    nick_name VARCHAR(30) NOT NULL,          -- 用户昵称
    user_type VARCHAR(10) DEFAULT 'sys',     -- 用户类型 sys/custom
    email VARCHAR(50),                       -- 邮箱
    phonenumber VARCHAR(11),                 -- 手机号
    sex CHAR(1) DEFAULT '0',                 -- 性别 0=男 1=女 2=未知
    avatar VARCHAR(100),                     -- 头像地址
    password VARCHAR(100),                   -- 密码
    status CHAR(1) DEFAULT '0',              -- 状态 0=正常 1=停用
    del_flag CHAR(1) DEFAULT '0',            -- 删除标志
    login_ip VARCHAR(128),                   -- 最后登录IP
    login_date TIMESTAMP,                    -- 最后登录时间
    tenant_id VARCHAR(20) DEFAULT '000000',  -- 租户ID
    create_dept BIGINT,                      -- 创建部门
    create_by BIGINT,                        -- 创建者
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,                        -- 更新者
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remark VARCHAR(500)                      -- 备注
);

-- 索引设计
CREATE INDEX idx_sys_user_dept_id ON sys_user(dept_id);
CREATE INDEX idx_sys_user_tenant_id ON sys_user(tenant_id);
CREATE INDEX idx_sys_user_status ON sys_user(status);
CREATE UNIQUE INDEX uk_sys_user_username_tenant ON sys_user(user_name, tenant_id);
```

#### 角色表 (sys_role)
```sql
CREATE TABLE sys_role (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL,          -- 角色名称
    role_key VARCHAR(100) NOT NULL,          -- 角色权限字符串
    role_sort INTEGER NOT NULL,              -- 显示顺序
    data_scope CHAR(1) DEFAULT '1',          -- 数据范围 1=全部 2=自定义 3=本部门 4=本部门及以下 5=仅本人
    menu_check_strictly BOOLEAN DEFAULT TRUE,-- 菜单树选择项是否关联显示
    dept_check_strictly BOOLEAN DEFAULT TRUE,-- 部门树选择项是否关联显示
    status CHAR(1) NOT NULL,                 -- 角色状态 0=正常 1=停用
    del_flag CHAR(1) DEFAULT '0',            -- 删除标志
    tenant_id VARCHAR(20) DEFAULT '000000',  -- 租户ID
    create_dept BIGINT,
    create_by BIGINT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remark VARCHAR(500)
);

-- 索引设计
CREATE INDEX idx_sys_role_tenant_id ON sys_role(tenant_id);
CREATE UNIQUE INDEX uk_sys_role_key_tenant ON sys_role(role_key, tenant_id);
```

#### 权限表 (sys_menu)
```sql
CREATE TABLE sys_menu (
    menu_id BIGSERIAL PRIMARY KEY,
    menu_name VARCHAR(50) NOT NULL,          -- 菜单名称
    parent_id BIGINT DEFAULT 0,              -- 父菜单ID
    order_num INTEGER DEFAULT 0,             -- 显示顺序
    path VARCHAR(200),                       -- 路由地址
    component VARCHAR(255),                  -- 组件路径
    query_param VARCHAR(255),                -- 路由参数
    is_frame INTEGER DEFAULT 1,             -- 是否为外链 0=是 1=否
    is_cache INTEGER DEFAULT 0,             -- 是否缓存 0=缓存 1=不缓存
    menu_type CHAR(1),                       -- 菜单类型 M=目录 C=菜单 F=按钮
    visible CHAR(1) DEFAULT '0',             -- 显示状态 0=显示 1=隐藏
    status CHAR(1) DEFAULT '0',              -- 菜单状态 0=正常 1=停用
    perms VARCHAR(100),                      -- 权限标识
    icon VARCHAR(100),                       -- 菜单图标
    create_dept BIGINT,
    create_by BIGINT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remark VARCHAR(500)
);

-- 索引设计
CREATE INDEX idx_sys_menu_parent_id ON sys_menu(parent_id);
CREATE INDEX idx_sys_menu_status ON sys_menu(status);
```

### 租户管理体系

#### 租户表 (sys_tenant)
```sql
CREATE TABLE sys_tenant (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(20) NOT NULL UNIQUE,   -- 租户编号
    contact_user_name VARCHAR(20),           -- 联系人
    contact_phone VARCHAR(20),               -- 联系电话
    company_name VARCHAR(30),                -- 企业名称
    license_number VARCHAR(30),              -- 统一社会信用代码
    address VARCHAR(200),                    -- 地址
    intro VARCHAR(200),                      -- 企业简介
    domain VARCHAR(200),                     -- 域名
    remark VARCHAR(200),                     -- 备注
    package_id BIGINT,                       -- 租户套餐编号
    expire_time TIMESTAMP,                   -- 过期时间
    account_count INTEGER DEFAULT -1,        -- 用户数量 -1=不限制
    status CHAR(1) DEFAULT '0',              -- 租户状态 0=正常 1=停用
    del_flag CHAR(1) DEFAULT '0',            -- 删除标志
    create_dept BIGINT,
    create_by BIGINT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引设计
CREATE UNIQUE INDEX uk_sys_tenant_id ON sys_tenant(tenant_id);
CREATE INDEX idx_sys_tenant_status ON sys_tenant(status);
```

#### 租户套餐表 (sys_tenant_package)
```sql
CREATE TABLE sys_tenant_package (
    package_id BIGSERIAL PRIMARY KEY,
    package_name VARCHAR(20) NOT NULL,       -- 套餐名称
    menu_ids TEXT,                           -- 关联菜单ID集合
    remark VARCHAR(200),                     -- 备注
    menu_check_strictly BOOLEAN DEFAULT TRUE,-- 菜单树选择项是否关联显示
    status CHAR(1) DEFAULT '0',              -- 状态 0=正常 1=停用
    del_flag CHAR(1) DEFAULT '0',            -- 删除标志
    create_dept BIGINT,
    create_by BIGINT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 社交登录体系

#### 社交关系表 (sys_social)
```sql
CREATE TABLE sys_social (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,                 -- 用户ID
    tenant_id VARCHAR(20) DEFAULT '000000',  -- 租户ID
    auth_id VARCHAR(255) NOT NULL,           -- 平台+平台唯一ID
    source VARCHAR(255) NOT NULL,            -- 用户来源
    open_id VARCHAR(255),                    -- 平台编号唯一ID
    user_name VARCHAR(30) NOT NULL,          -- 登录账号
    nick_name VARCHAR(30) DEFAULT '',        -- 用户昵称
    email VARCHAR(255) DEFAULT '',           -- 用户邮箱
    avatar VARCHAR(500) DEFAULT '',          -- 头像地址
    access_token VARCHAR(2000) NOT NULL,     -- 用户的授权令牌
    expire_in INTEGER,                       -- 授权令牌有效期
    refresh_token VARCHAR(255),              -- 刷新令牌
    access_code VARCHAR(2000),               -- 平台授权信息
    union_id VARCHAR(255),                   -- 用户的unionid
    scope VARCHAR(255),                      -- 授予的权限
    token_type VARCHAR(255),                 -- 授权信息类型
    id_token VARCHAR(2000),                  -- id token
    mac_algorithm VARCHAR(255),              -- 小米平台附带属性
    mac_key VARCHAR(255),                    -- 小米平台附带属性
    code VARCHAR(255),                       -- 用户授权code
    oauth_token VARCHAR(255),                -- Twitter平台附带属性
    oauth_token_secret VARCHAR(255),         -- Twitter平台附带属性
    create_dept BIGINT,
    create_by BIGINT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_by BIGINT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    del_flag CHAR(1) DEFAULT '0'
);

-- 索引设计
CREATE INDEX idx_sys_social_user_id ON sys_social(user_id);
CREATE INDEX idx_sys_social_tenant_id ON sys_social(tenant_id);
CREATE UNIQUE INDEX uk_sys_social_auth_id ON sys_social(auth_id);
```

## 数据权限设计

### 部门数据权限
```sql
-- 数据权限控制策略
-- 1. 全部数据权限
SELECT * FROM sys_user WHERE tenant_id = '000001';

-- 2. 自定义数据权限
SELECT * FROM sys_user u 
WHERE u.tenant_id = '000001' 
AND u.dept_id IN (SELECT dept_id FROM sys_role_dept WHERE role_id = ?);

-- 3. 部门数据权限
SELECT * FROM sys_user u 
WHERE u.tenant_id = '000001' 
AND u.dept_id = ?;

-- 4. 部门及以下数据权限
SELECT * FROM sys_user u 
WHERE u.tenant_id = '000001' 
AND u.dept_id IN (SELECT dept_id FROM sys_dept WHERE find_in_set(?, ancestors));

-- 5. 仅本人数据权限
SELECT * FROM sys_user u 
WHERE u.tenant_id = '000001' 
AND u.user_id = ?;
```

## 性能优化策略

### 索引设计原则
1. **主键索引**: 所有表都有BIGSERIAL主键
2. **租户索引**: 所有多租户表都有tenant_id索引
3. **状态索引**: 经常查询的状态字段建索引
4. **外键索引**: 关联查询的外键字段建索引
5. **唯一索引**: 业务唯一约束建唯一索引

### 查询优化
```sql
-- 1. 分页查询优化
SELECT * FROM sys_user 
WHERE tenant_id = '000001' 
AND status = '0'
ORDER BY create_time DESC 
LIMIT 20 OFFSET 0;

-- 2. 使用覆盖索引
CREATE INDEX idx_sys_user_cover ON sys_user(tenant_id, status, create_time) 
INCLUDE (user_name, nick_name);

-- 3. 分区表设计 (大数据量场景)
CREATE TABLE sys_log (
    log_id BIGSERIAL,
    tenant_id VARCHAR(20),
    create_time TIMESTAMP,
    -- other columns
    PRIMARY KEY (log_id, create_time)
) PARTITION BY RANGE (create_time);

-- 按月分区
CREATE TABLE sys_log_202401 PARTITION OF sys_log 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 连接池优化
```yaml
# HikariCP优化配置
hikari:
  maxPoolSize: 20                    # 最大连接数
  minIdle: 10                        # 最小空闲连接数
  connectionTimeout: 30000           # 连接超时 30秒
  validationTimeout: 5000            # 验证超时 5秒
  idleTimeout: 600000               # 空闲超时 10分钟
  maxLifetime: 1800000              # 最大生命周期 30分钟
  keepaliveTime: 30000              # 保活时间 30秒
  connectionTestQuery: SELECT 1      # 连接测试查询
```

## 数据安全

### 字段加密
```sql
-- 敏感字段加密存储
CREATE TABLE sys_user_sensitive (
    user_id BIGINT PRIMARY KEY,
    phone_encrypted VARCHAR(200),      -- 加密后的手机号
    email_encrypted VARCHAR(200),      -- 加密后的邮箱
    id_card_encrypted VARCHAR(400),    -- 加密后的身份证
    bank_card_encrypted VARCHAR(400)   -- 加密后的银行卡
);
```

### 数据脱敏
```java
// 查询时自动脱敏
@DesensitizedField(type = DesensitizeType.PHONE)
private String phone;

@DesensitizedField(type = DesensitizeType.EMAIL)
private String email;

@DesensitizedField(type = DesensitizeType.ID_CARD)
private String idCard;
```

### 审计日志
```sql
-- 操作日志表
CREATE TABLE sys_oper_log (
    oper_id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(20) DEFAULT '000000',
    title VARCHAR(50),                 -- 模块标题
    business_type INTEGER DEFAULT 0,   -- 业务类型
    method VARCHAR(200),               -- 方法名称
    request_method VARCHAR(10),        -- 请求方式
    operator_type INTEGER DEFAULT 0,   -- 操作类别
    oper_name VARCHAR(50),             -- 操作人员
    dept_name VARCHAR(50),             -- 部门名称
    oper_url VARCHAR(255),             -- 请求URL
    oper_ip VARCHAR(128),              -- 主机地址
    oper_location VARCHAR(255),        -- 操作地点
    oper_param TEXT,                   -- 请求参数
    json_result TEXT,                  -- 返回参数
    status INTEGER DEFAULT 0,          -- 操作状态
    error_msg VARCHAR(2000),           -- 错误消息
    oper_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 操作时间
    cost_time BIGINT DEFAULT 0         -- 消耗时间
);

-- 按月分区
CREATE TABLE sys_oper_log_202401 PARTITION OF sys_oper_log 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 备份策略

### 数据备份
```bash
# PostgreSQL备份脚本
#!/bin/bash
BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="plate"

# 全量备份
pg_dump -h localhost -p 5432 -U postgres -d $DB_NAME \
  -f "$BACKUP_DIR/plate_full_$DATE.sql"

# 压缩备份文件
gzip "$BACKUP_DIR/plate_full_$DATE.sql"

# 删除7天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

### 增量备份
```bash
# WAL日志备份
archive_mode = on
archive_command = 'cp %p /backup/postgres/wal/%f'
wal_level = replica
```

## 监控告警

### 性能监控指标
```sql
-- 慢查询监控
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements 
WHERE mean_time > 1000  -- 平均执行时间超过1秒
ORDER BY mean_time DESC 
LIMIT 10;

-- 连接数监控
SELECT count(*) as active_connections,
       max_conn,
       max_conn - count(*) as available_connections
FROM pg_stat_activity, 
     (SELECT setting::int as max_conn FROM pg_settings WHERE name='max_connections') AS mc
WHERE state = 'active';

-- 表空间使用监控
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'plate'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
LIMIT 10;
```

### 告警阈值
- **连接数**: 超过最大连接数的80%
- **慢查询**: 平均执行时间超过1秒
- **表空间**: 使用率超过85%
- **锁等待**: 等待时间超过30秒

## 扩展性设计

### 读写分离
```yaml
spring:
  datasource:
    dynamic:
      datasource:
        master:
          url: jdbc:postgresql://master:5432/plate
          username: postgres
          password: postgres
        slave:
          url: jdbc:postgresql://slave:5432/plate
          username: postgres
          password: postgres
```

### 分库分表
```java
// 分表策略示例
@TableName(value = "sys_log", autoResultMap = true)
@KeySequence(value = "sys_log_id_seq", dbType = DbType.POSTGRE_SQL)
public class SysLog extends BaseEntity {
    
    @TableId(value = "log_id", type = IdType.INPUT)
    private Long logId;
    
    // 按月分表
    @TableField(exist = false)
    private String tableSuffix;
}
```

### 数据归档
```sql
-- 历史数据归档策略
-- 1. 创建归档表
CREATE TABLE sys_oper_log_archive AS 
SELECT * FROM sys_oper_log WHERE 1=0;

-- 2. 定期归档
INSERT INTO sys_oper_log_archive 
SELECT * FROM sys_oper_log 
WHERE oper_time < NOW() - INTERVAL '1 year';

-- 3. 删除已归档数据
DELETE FROM sys_oper_log 
WHERE oper_time < NOW() - INTERVAL '1 year';
```