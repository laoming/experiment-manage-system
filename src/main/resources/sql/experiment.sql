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

-- 插入菜单数据
INSERT INTO menu(id, parent_id, menu_name, menu_code, path, menu_type, sort)
VALUES ('401', '400', '实验模板管理', 'experiment_template_management', '/ems/pages/experiment-template-list.html', 'M', 1),
       ('402', '400', '实验报告管理', 'experiment_report_management', '/ems/pages/experiment-report.html', 'M', 2);

-- 为管理员分配权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('401', '1', '401'), -- 实验模板管理
       ('402', '1', '402'), -- 实验报告管理
       ('403', '1', '403'); -- 模板编辑器

-- 为老师分配权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('404', '2', '401'), -- 实验模板管理
       ('405', '2', '402'), -- 实验报告管理
       ('406', '2', '403'); -- 模板编辑器

-- 为学生分配权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('407', '3', '402'); -- 实验报告管理
