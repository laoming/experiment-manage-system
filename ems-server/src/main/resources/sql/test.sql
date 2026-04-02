
-- 测试空菜单
INSERT INTO menu(id, parent_id, menu_name, menu_code, path, menu_type, sort)
VALUES ('000001', '200', '测试空菜单', 'test_menus', '/ems/modules/pages/test_blank.html', 'M', 2);

-- 为管理员分配课程管理权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('test001', '1', '000001');

-- 为老师分配课程管理权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('test002', '2', '000001');