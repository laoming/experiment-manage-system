-- 创建数据库
CREATE
DATABASE ems;
-- 使用数据库
USE
ems;

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

-- 更新菜单表，添加组织管理菜单
INSERT INTO menu(id, parent_id, menu_name, menu_code, path, menu_type, sort)
VALUES ('100', '0', '身份管理', 'auth_management', '', 'D', 1),
       ('101', '100', '用户管理', 'user_management', '/ems/pages/user.html', 'M', 1),
       ('102', '100', '组织管理', 'organization_management', '/ems/pages/organization.html', 'M', 2),
       ('200', '0', '系统管理', 'system_management', '', 'D', 2),
       ('300', '0', '课堂管理', 'class_management', '', 'D', 3),
       ('400', '0', '实验管理', 'experiment_management', '', 'D', 4);


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
VALUES ('1', '1', '100'), -- 系统管理（管理员）
       ('2', '1', '101'), -- 用户管理
       ('3', '1', '102'), -- 角色管理
       ('4', '1', '200'),
       ('5', '1', '300'),
       ('6', '1', '400');
-- 组织管理

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
