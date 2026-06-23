-- API Key 增强字段：权限范围 + 过期时间 + 最后使用时间 + key前缀（哈希存储替代明文）
ALTER TABLE `n_apikeys` ADD COLUMN `n_key_prefix` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Key前8位明文，用于展示' AFTER `n_key`;
ALTER TABLE `n_apikeys` ADD COLUMN `n_scopes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'threads:read' COMMENT '权限范围，逗号分隔' AFTER `n_ipstatus`;
ALTER TABLE `n_apikeys` ADD COLUMN `n_expires` datetime NULL DEFAULT NULL COMMENT '过期时间，NULL表示永不过期' AFTER `n_scopes`;
ALTER TABLE `n_apikeys` ADD COLUMN `n_last_used_at` datetime NULL DEFAULT NULL COMMENT '最后使用时间' AFTER `n_expires`;

-- 为 n_key 字段添加索引以加速API Key鉴权查询（现在是SHA256哈希值）
ALTER TABLE `n_apikeys` ADD INDEX `idx_n_key` (`n_key`);
