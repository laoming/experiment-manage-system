-- 课程管理相关表

-- 课程表
CREATE TABLE course
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '课程ID',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    description VARCHAR(500) COMMENT '课程简介',
    creator_id  VARCHAR(64) NOT NULL COMMENT '创建者ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    INDEX idx_creator (creator_id)
) COMMENT '课程表';

-- 课程-用户关联表
CREATE TABLE course_user_relation
(
    id        VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    course_id VARCHAR(64) NOT NULL COMMENT '课程ID',
    user_id   VARCHAR(64) NOT NULL COMMENT '用户ID',
    user_type INT DEFAULT 2 NOT NULL COMMENT '用户类型：1-管理者，2-普通用户（学生）',
    UNIQUE KEY (course_id, user_id),
    INDEX idx_user_type (user_type)
) COMMENT '课程-用户关联表';

-- 课程-实验模板关联表
CREATE TABLE course_template_relation
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    course_id   VARCHAR(64) NOT NULL COMMENT '课程ID',
    template_id VARCHAR(64) NOT NULL COMMENT '实验模板ID',
    UNIQUE KEY (course_id, template_id)
) COMMENT '课程-实验模板关联表';

