-- API Key 增强字段：权限范围 + 过期时间
ALTER TABLE `n_apikeys` ADD COLUMN `n_scopes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'threads:read' COMMENT '权限范围，逗号分隔' AFTER `n_ipstatus`;
ALTER TABLE `n_apikeys` ADD COLUMN `n_expires` datetime NULL DEFAULT NULL COMMENT '过期时间，NULL表示永不过期' AFTER `n_scopes`;

-- 为 n_key 字段添加索引以加速API Key鉴权查询
ALTER TABLE `n_apikeys` ADD INDEX `idx_n_key` (`n_key`);
