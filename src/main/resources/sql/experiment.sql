-- 实验模板表
CREATE TABLE experiment_template
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '模板ID',
    template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
    template_content TEXT NOT NULL COMMENT '模板内容(JSON格式,包含拖拽组件配置)',
    description VARCHAR(500) COMMENT '模板描述',
    creator_id  VARCHAR(64) NOT NULL COMMENT '创建者ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    INDEX idx_creator (creator_id)
) COMMENT '实验模板表';

-- 实验报告表
CREATE TABLE experiment_report
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '报告ID',
    template_id VARCHAR(64) NOT NULL COMMENT '使用的模板ID',
    report_name VARCHAR(100) NOT NULL COMMENT '报告名称',
    report_content TEXT NOT NULL COMMENT '报告内容(JSON格式)',
    student_id  VARCHAR(64) NOT NULL COMMENT '学生ID',
    submit_time DATETIME COMMENT '提交时间',
    score       INT COMMENT '分数',
    comment     TEXT COMMENT '评语',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    INDEX idx_template (template_id),
    INDEX idx_student (student_id)
) COMMENT '实验报告表';

