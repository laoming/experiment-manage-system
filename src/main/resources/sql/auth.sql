-- 1. 用户表
CREATE TABLE user
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '用户ID',
    username    VARCHAR(50)                        NOT NULL UNIQUE COMMENT '用户名',
    password    VARCHAR(100)                       NOT NULL COMMENT '密码（摘要值）',
    status      INT                                NOT NULL COMMENT '状态：0-禁用，1-正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间'
) COMMENT '系统用户表';

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

-- 3. 用户-角色关联表
CREATE TABLE user_role_relation
(
    id      VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    role_id VARCHAR(64) NOT NULL COMMENT '角色ID',
    UNIQUE KEY (user_id, role_id)
) COMMENT '用户-角色关联表';

-- 4. 菜单表
CREATE TABLE menu
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '菜单ID',
    parent_id   VARCHAR(64) DEFAULT 0 COMMENT '父菜单ID（0为顶级菜单）',
    menu_name   VARCHAR(50)                           NOT NULL COMMENT '菜单名称',
    menu_code   VARCHAR(100) COMMENT '菜单编码',
    path        VARCHAR(200) COMMENT '菜单路径/URL',
    menu_type   CHAR(1) COMMENT '类型：M-菜单，D-目录',
    sort        INT         DEFAULT 0 COMMENT '排序',
    create_time DATETIME    DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间'
) COMMENT '系统菜单表';

-- 5. 角色-菜单关联表
CREATE TABLE role_menu_relation
(
    id      VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    role_id VARCHAR(64) NOT NULL COMMENT '角色ID',
    menu_id VARCHAR(64) NOT NULL COMMENT '菜单ID',
    UNIQUE KEY (role_id, menu_id)
) COMMENT '角色-菜单关联表';


-- TODO 初始化数据
INSERT INTO sys_user (username, password, nickname)
VALUES ('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '超级管理员'); -- 密码：123456

INSERT INTO sys_role (role_name, role_key)
VALUES ('超级管理员', 'ADMIN');

INSERT INTO user_role_relation (user_id, role_id)
VALUES (1, 1);

INSERT INTO menu (parent_id, menu_name, path, permission, menu_type, visible)
VALUES (0, '系统管理', '/system', '', 'F', 1),
       (1, '用户管理', '/system/user', 'sys:user:list', 'M', 1),
       (1, '菜单管理', '/system/menu', 'sys:menu:list', 'M', 1),
       (2, '新增用户', '', 'sys:user:add', 'B', 0),
       (2, '编辑用户', '', 'sys:user:edit', 'B', 0);

INSERT INTO role_menu_relation (role_id, menu_id)
VALUES (1, 1),
       (1, 2),
       (1, 3),
       (1, 4),
       (1, 5);