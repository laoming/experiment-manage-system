-- 系统初始化SQL,包括数据库表结构和数据

-- 创建数据库
CREATE DATABASE ems;
-- 使用数据库
USE ems;

-- 1. 用户表
CREATE TABLE user
(
    id           VARCHAR(64) PRIMARY KEY COMMENT '用户ID',
    username     VARCHAR(50)                        NOT NULL UNIQUE COMMENT '用户名（账号）',
    password     VARCHAR(100)                       NOT NULL COMMENT '密码（摘要值）',
    display_name VARCHAR(30)                        NOT NULL COMMENT '显示名称',
    role_id      VARCHAR(64)                        NOT NULL COMMENT '角色ID',
    org_id       VARCHAR(64)                        NOT NULL COMMENT '组织ID',
    status       INT                                NOT NULL COMMENT '状态：0-禁用，1-正常',
    create_time  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间'
) COMMENT '系统用户表';

INSERT INTO `USER` (`id`, `username`, `password`, `display_name`, `role_id`, `org_id`, `status`)
VALUES ('1', 'admin', '$2a$10$iuFatogHkRpBbDJMllKluejzho/7Favm0zBQ.PUEeDTC1Bs301hZW', '超级管理员', '1', '0', '1'),
       ('2', 'lm', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '刘明', '2', '1100000', '1'),
       ('3', 'feifei', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '菲菲', '3', '1100001', '1');


-- 2. 角色表
CREATE TABLE role
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '角色ID',
    role_name   VARCHAR(50)                        NOT NULL COMMENT '角色名称',
    role_code   VARCHAR(50)                        NOT NULL COMMENT '角色编码',
    status      INT                                NOT NULL COMMENT '状态：0-禁用，1-正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间'
) COMMENT '系统角色表';

INSERT INTO role(id, role_name, role_code, status)
VALUES ("1", "管理员", "admin", 1),
       ("2", "老师", "teacher", 1),
       ("3", "学生", "student", 1);

-- 3. 菜单表
CREATE TABLE menu
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '菜单ID',
    parent_id   VARCHAR(64) DEFAULT 0 COMMENT '父菜单ID（0为顶级菜单）',
    menu_name   VARCHAR(50)                           NOT NULL COMMENT '菜单名称',
    menu_code   VARCHAR(100) COMMENT '菜单编码',
    path        VARCHAR(200) COMMENT '菜单路径/URL',
    menu_type   CHAR(1) COMMENT '类型：M-菜单，D-目录',
    sort        INT         DEFAULT 0 COMMENT '排序',
    create_time TIMESTAMP   DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间'
) COMMENT '系统菜单表';

-- 更新菜单表，添加组织管理、角色管理、菜单管理菜单
INSERT INTO menu(id, parent_id, menu_name, menu_code, path, menu_type, sort)
VALUES ('100', '0', '身份管理', 'auth_management', '', 'D', 1),
       ('101', '100', '用户管理', 'user_management', '/ems/modules/user/user.html', 'M', 1),
       ('102', '100', '组织管理', 'organization_management', '/ems/modules/organization/organization.html', 'M', 2),
       ('103', '100', '角色管理', 'role_management', '/ems/modules/role/role.html', 'M', 3),
       ('104', '100', '菜单管理', 'menu_management', '/ems/modules/menu/menu.html', 'M', 4),
       ('200', '0', '系统管理', 'system_management', '', 'D', 2),
       ('201', '200', '公告管理', 'notice_management', '/ems/modules/notice-manage/notice-manage.html', 'M', 1),
       ('202', '200', '消息管理', 'message_management', '/ems/modules/message-manage/message-manage.html', 'M', 2),
       ('300', '0', '课堂管理', 'class_management', '', 'D', 3),
       ('301', '300', '课程管理', 'course_management', '/ems/modules/course-list/course-list.html', 'M', 1),
       ('302', '300', '我的课程', 'my_course', '/ems/modules/my-course/my-course.html', 'M', 2),
       ('400', '0', '实验管理', 'experiment_management', '', 'D', 4),
       ('401', '400', '实验模板管理', 'experiment_template_management', '/ems/modules/experiment-template-list/experiment-template-list.html', 'M', 1),
       ('402', '400', '实验报告管理', 'experiment_report_management', '/ems/modules/experiment-report/experiment-report.html', 'M', 2);


-- 4. 角色-菜单关联表
CREATE TABLE role_menu_relation
(
    id      VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    role_id VARCHAR(64) NOT NULL COMMENT '角色ID',
    menu_id VARCHAR(64) NOT NULL COMMENT '菜单ID',
    UNIQUE KEY (role_id, menu_id)
) COMMENT '角色-菜单关联表';

-- 为管理员角色分配所有菜单权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('1', '1', '100'),   -- 身份管理（管理员）
       ('2', '1', '101'),   -- 用户管理
       ('3', '1', '102'),   -- 组织管理
       ('4', '1', '103'),   -- 角色管理
       ('5', '1', '104'),   -- 菜单管理
       ('6', '1', '200'),   -- 系统管理
       ('901', '1', '201'), -- 公告管理
       ('902', '1', '202'), -- 消息管理
       ('7', '1', '300'),   -- 课堂管理
       ('8', '1', '400'),   -- 实验管理
       ('301', '1', '301'), -- 课程管理
       ('302', '1', '302'), -- 我的课程
       ('401', '1', '401'), -- 实验模板管理
       ('402', '1', '402'), -- 实验报告管理
       ('403', '1', '403'); -- 模板编辑器

-- 为老师分配权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('2001', '2', '200'), -- 系统管理（目录）
       ('2002', '2', '300'), -- 课堂管理（目录）
       ('2003', '2', '400'), -- 实验管理（目录）

       ('202', '2', '202'), -- 消息管理
       ('303', '2', '301'), -- 课程管理
       ('304', '2', '302'), -- 我的课程
       ('404', '2', '401'), -- 实验模板管理
       ('405', '2', '402'), -- 实验报告管理
       ('406', '2', '403'); -- 模板编辑器

-- 为学生分配权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('3001', '3', '200'), -- 系统管理（目录）
       ('3002', '3', '300'), -- 课堂管理（目录）
       ('3003', '3', '400'), -- 实验管理（目录）

       ('305', '3', '302'), -- 我的课程
       ('407', '3', '402'); -- 实验报告管理

-- 5. 组织表
CREATE TABLE organization
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '组织ID',
    parent_id   VARCHAR(64) COMMENT '父组织ID（0为顶级组织）',
    org_name    VARCHAR(100)                       NOT NULL COMMENT '组织名称',
    org_code    VARCHAR(50)                        NOT NULL COMMENT '组织编码',
    full_path   VARCHAR(500)                       NOT NULL COMMENT '组织名称全路径',
    description VARCHAR(500) COMMENT '组织描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    UNIQUE KEY (org_code)
) COMMENT '组织表';

-- 插入组织数据
INSERT INTO organization(id, parent_id, org_name, org_code, full_path, description)
VALUES ('0', null, '广州软件学院', 'gzus', '/广州软件学院', '根组织'),
       ('1100000', '0', '计算机学院', 'cs', '/广州软件学院/计算机学院', ''),
       ('1200000', '0', '物理学院', 'ph', '/广州软件学院/物理学院', ''),
       ('1100001', '1100000', '计科2601班', 'cs2601', '/广州软件学院/计算机学院/计科2601班', ''),
       ('1100002', '1100000', '计科2602班', 'cs2602', '/广州软件学院/计算机学院/计科2602班', ''),
       ('1100003', '1100000', '计科2603班', 'cs2603', '/广州软件学院/计算机学院/计科2603班', ''),
       ('1200001', '1200000', '物理2601班', 'ph2601', '/广州软件学院/物理学院/物理2601班', ''),
       ('1200002', '1200000', '物理2602班', 'ph2602', '/广州软件学院/物理学院/物理2602班', '');

-- 6. 公告表
CREATE TABLE notice
(
    id           VARCHAR(64) PRIMARY KEY COMMENT '公告ID',
    title        VARCHAR(200)                       NOT NULL COMMENT '公告标题',
    content      TEXT                               NOT NULL COMMENT '公告内容',
    creator_id   VARCHAR(64)                        NOT NULL COMMENT '发布人ID',
    creator_name VARCHAR(50)                        NOT NULL COMMENT '发布人名称',
    create_time  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间'
) COMMENT '公告表';

-- 7. 消息表
CREATE TABLE message
(
    id            VARCHAR(64) PRIMARY KEY COMMENT '消息ID',
    title         VARCHAR(200)                       NOT NULL COMMENT '消息标题',
    content       TEXT                               NOT NULL COMMENT '消息内容',
    receiver_id   VARCHAR(64)                        NOT NULL COMMENT '接收人ID',
    receiver_name VARCHAR(50)                        NOT NULL COMMENT '接收人名称',
    status        INT         DEFAULT 0              NOT NULL COMMENT '状态：0-未读，1-已读',
    creator_id    VARCHAR(64)                        NOT NULL COMMENT '创建人ID',
    creator_name  VARCHAR(50)                        NOT NULL COMMENT '创建人名称',
    create_time   DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间'
) COMMENT '消息表';


-- 8. 课程表
CREATE TABLE course
(
    id             VARCHAR(64) PRIMARY KEY COMMENT '课程ID',
    course_name    VARCHAR(100) NOT NULL COMMENT '课程名称',
    description    VARCHAR(500) COMMENT '课程简介',
    creator_id     VARCHAR(64) NOT NULL COMMENT '创建者ID',
    admin_count    INT DEFAULT 0 NOT NULL COMMENT '管理者数量',
    student_count  INT DEFAULT 0 NOT NULL COMMENT '学生数量',
    template_count INT DEFAULT 0 NOT NULL COMMENT '实验模板数量',
    create_time    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    INDEX idx_creator (creator_id)
) COMMENT '课程表';


-- 9. 课程-用户关联表
CREATE TABLE course_user_relation
(
    id        VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    course_id VARCHAR(64) NOT NULL COMMENT '课程ID',
    user_id   VARCHAR(64) NOT NULL COMMENT '用户ID',
    user_type INT DEFAULT 2 NOT NULL COMMENT '用户类型：1-管理者，2-普通用户（学生）',
    UNIQUE KEY (course_id, user_id),
    INDEX idx_user_type (user_type)
) COMMENT '课程-用户关联表';


-- 10. 课程-实验模板关联表
CREATE TABLE course_template_relation
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    course_id   VARCHAR(64) NOT NULL COMMENT '课程ID',
    template_id VARCHAR(64) NOT NULL COMMENT '实验模板ID',
    UNIQUE KEY (course_id, template_id)
) COMMENT '课程-实验模板关联表';


-- 11. 实验模板表
CREATE TABLE experiment_template
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '模板ID',
    template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
    template_content TEXT NOT NULL COMMENT '模板内容',
    description VARCHAR(500) COMMENT '模板描述',
    creator_id  VARCHAR(64) NOT NULL COMMENT '创建者ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    INDEX idx_creator (creator_id)
) COMMENT '实验模板表';

-- 插入预设的实验模板
INSERT  INTO `experiment_template`(`id`, `template_name`, `template_content`, `description`, `creator_id`,`create_time`, `update_time`)
VALUES ('2026675154007404545', '甲醇燃烧实验',
        '# 一、实验目的\n\n1、观察甲醇燃烧的颜色变化。 \n\n2、测定甲醇燃烧的热值。\n\n# 二、实验步骤。\n\n1、将甲醇倒入锅中。 \n\n2、点然甲醇。  \n\n3、记录然烧时间和颜色变化。  \n\n4、测量甲醇的质量。    \n\n# 三、实验数据记录与处理。\n\n1、观察到的颜色变化： *[甲醇燃烧颜色]*  \n\n2、燃烧热值计算：燃烧热值=（质量×燃烧时间×水的热容）÷燃烧温度升高。其中，水的热容为4.2J/g℃。\n\n\n\n| 质量 | 燃烧时间 | 燃烧升高温度 | 燃烧热值 |\n|----|----|----|----|\n|    |    |    |    |\n\n\n\n\n# 五、实验结论\n\n*[实验结论内容]*',
        '甲醇燃烧实验，了解热值测定的基本原理和实验方法。', '1', '2026-02-25 23:06:25', '2026-03-04 00:23:08'),
       ('2028483307435061249', '重力加速度测量实验',
        '# 1.实验目的\n\n1、学习用**自由落体法**测量当地的重力加速度 (g)，理解自由落体运动的规律。\n\n2、掌握刻度尺、秒表的正确使用方法，学会实验数据的记录与处理。\n\n# 2.实验步骤\n\n1、组装实验装置：将铁架台固定在水平桌面，用铁夹夹住重锤的悬挂线，使重锤自然下垂，标记重锤底部的初始位置（下落起点）。\n\n2、测量下落高度：用刻度尺测量从下落起点到水平地面（或固定终点）的距离，记为 (h)，测量3次，取平均值作为最终下落高度。\n\n3、测量下落时间：松开铁夹，让重锤自由下落，同时启动秒表；当重锤到达终点时，立即停止秒表，记录下落时间 (t)。\n\n4、数据处理：根据每组的 (h) 和时间 (t)，代入公式计算每组的 (g)，再求所有 (g) 的平均值，作为最终测量结果。\n\n# 3.实验数据\n\n\n\n| 下落高度 (h) | 下落时间 (t) | 重力加速度 (g) |\n|----|----|----|\n|    |    |    |\n|    |    |    |\n|    |    |    |\n\n\n\n\n# 4.实验结论\n\n*[请输入实验结论]*',
        '这是一个测试当地重力加速度g的实验', '1', '2026-03-02 22:51:23', '2026-03-04 00:22:27'),
       ('2029232264897429505', '细胞膜实验',
        '# 实验目的\n\n实验的目的为“**验证活细胞的细胞膜具有控制物质进出的作用**”。实验自变量为细胞死活状态，可用热水杀死植物细胞，达到控制自变量的目的。因变量是细胞膜对物质的控制能力，可用叶片的颜色是否褪去、水是否变红作为观察指标。在实验过程中要注意单一变量原则，其他无关变量要保持相同且适宜，如清水和开水的水量要保持一致。\n\n  \n\n# 实验步骤\n\n1\\. 将2个相同的碗，编号为甲、乙。\n\n2\\. 向甲碗中倒入一满杯清水，向乙碗中倒入一满杯已用电热水壶烧开的开水。\n\n3\\. 分别向甲、乙两碗中放入2片红色苋菜叶。\n\n4\\. 一段时间后，观察水和叶片颜色的变化。\n\n  \n\n# 实验数据\n\n  \n\n\n\n| 甲颜色 | 乙颜色 |\n|----|----|\n|    |    |\n\n\n\n\n  \n\n# 实验结论\n\n*[|请填写实验结论]*',
        '验证活细胞的细胞膜具有控制物质进出的作用', '1', '2026-03-05 00:27:28', '2026-03-05 00:27:28');


-- 12. 实验报告表
CREATE TABLE experiment_report
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '报告ID',
    template_id VARCHAR(64) NOT NULL COMMENT '使用的模板ID',
    course_id   VARCHAR(36) COMMENT '课程ID',
    report_name VARCHAR(100) NOT NULL COMMENT '报告名称',
    report_content TEXT NOT NULL COMMENT '报告内容',
    student_id  VARCHAR(64) NOT NULL COMMENT '学生ID',
    submit_time DATETIME COMMENT '提交时间',
    status      VARCHAR(20) DEFAULT 'draft' COMMENT '报告状态：draft-待提交, submitted-已提交, graded-已评价',
    score       INT COMMENT '分数',
    comment     TEXT COMMENT '评语',
    pdf_url     VARCHAR(500) COMMENT 'PDF报告文件URL',
    grade_time  DATETIME COMMENT '评价时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    INDEX idx_template (template_id),
    INDEX idx_student (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status)
) COMMENT '实验报告表';


-- 13. 文件信息表
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

