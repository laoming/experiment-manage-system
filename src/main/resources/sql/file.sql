
-- 文件信息表
CREATE TABLE file_info
(
    id            VARCHAR(64) PRIMARY KEY COMMENT '文件ID',
    object_name   VARCHAR(100) NOT NULL COMMENT '文件对象名称（MinIO中的objectName）',
    original_name VARCHAR(255) COMMENT '原始文件名',
    file_size     BIGINT COMMENT '文件大小（字节）',
    content_type  VARCHAR(100) COMMENT '文件类型',
    uploader_id   VARCHAR(64) COMMENT '上传者ID',
    create_time   DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    UNIQUE INDEX idx_object_name (object_name),
    INDEX idx_uploader (uploader_id)
) COMMENT '文件信息表';
