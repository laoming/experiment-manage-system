-- 系统初始化SQL,包括数据库表结构和数据

-- 创建数据库
CREATE DATABASE ems_old;
-- 使用数据库
USE ems_old;

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
       -- 计算机学院老师
       ('10000', 'laoshi', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '李老师', '2', '1000000', '1'),
       ('10001', 'zhangwei', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '张伟', '2', '1000000', '1'),
       ('10002', 'lina', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '李娜', '2', '1000000', '1'),
       -- 软件学院老师
       ('10003', 'wangqiang', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '王强', '2', '2000000', '1'),
       ('10004', 'liufang', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '刘芳', '2', '2000000', '1'),
       -- 电子信息学院老师
       ('10005', 'chenming', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '陈明', '2', '3000000', '1'),
       -- 数字媒体学院老师
       ('10006', 'zhaoli', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '赵丽', '2', '4000000', '1'),
       ('10007', 'sunhao', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '孙浩', '2', '4000000', '1'),
       -- 管理学院老师
       ('10008', 'zhoujun', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '周军', '2', '5000000', '1'),
       -- 外语学院老师
       ('10009', 'wuxia', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '吴霞', '2', '6000000', '1'),
       ('10010', 'zhengyu', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '郑宇', '2', '6000000', '1'),
       -- 艺术学院老师
       ('10011', 'huangying', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '黄莺', '2', '7000000', '1'),
       -- 会计学院老师
       ('10012', 'linjie', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '林杰', '2', '8000000', '1'),
       ('10013', 'heping', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '何平', '2', '8000000', '1'),
       -- 继续教育学院老师
       ('10014', 'xujing', '$2a$10$rZS9riAbYP.cjHgGSbl2f.dsNChdE.ZgQvQDg5caoELbHGdVJuvFu', '徐静', '2', '9000000', '1'),
       -- 计算机学院学生（计科2601班）
       ('20000', 'xuesheng', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '刘同学', '3', '1000001', '1'),
       ('20001', 'cs260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '陈思远', '3', '1000001', '1'),
       ('20002', 'cs260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '王建国', '3', '1000001', '1'),
       ('20003', 'cs260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '李晓峰', '3', '1000001', '1'),
       ('20004', 'cs260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '张美玲', '3', '1000001', '1'),
       ('20005', 'cs260105', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '刘志强', '3', '1000001', '1'),
       -- 计算机学院学生（计科2602班）
       ('20006', 'cs260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '赵明辉', '3', '1000002', '1'),
       ('20007', 'cs260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '孙丽娜', '3', '1000002', '1'),
       ('20008', 'cs260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '周文斌', '3', '1000002', '1'),
       ('20009', 'cs260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '吴晓燕', '3', '1000002', '1'),
       ('20010', 'cs260205', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '郑海涛', '3', '1000002', '1'),
       -- 计算机学院学生（计科2603班）
       ('20011', 'cs260301', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '黄志伟', '3', '1000003', '1'),
       ('20012', 'cs260302', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '林小红', '3', '1000003', '1'),
       ('20013', 'cs260303', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '何俊杰', '3', '1000003', '1'),
       ('20014', 'cs260304', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '徐婉婷', '3', '1000003', '1'),
       ('20015', 'cs260305', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '马天宇', '3', '1000003', '1'),
       -- 计算机学院学生（计科2604班）
       ('20016', 'cs260401', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '杨晨曦', '3', '1000004', '1'),
       ('20017', 'cs260402', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '朱晓雯', '3', '1000004', '1'),
       ('20018', 'cs260403', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '胡志远', '3', '1000004', '1'),
       ('20019', 'cs260404', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '高雨欣', '3', '1000004', '1'),
       -- 计算机学院学生（计科2605班）
       ('20020', 'cs260501', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '罗伟民', '3', '1000005', '1'),
       ('20021', 'cs260502', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '谢婷婷', '3', '1000005', '1'),
       ('20022', 'cs260503', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '邓志强', '3', '1000005', '1'),
       ('20023', 'cs260504', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '唐晓丽', '3', '1000005', '1'),
       ('20024', 'cs260505', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '冯浩然', '3', '1000005', '1'),
       -- 软件学院学生（软工2601班）
       ('20025', 'se260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '韩志刚', '3', '2000001', '1'),
       ('20026', 'se260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '曹雨薇', '3', '2000001', '1'),
       ('20027', 'se260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '彭伟强', '3', '2000001', '1'),
       ('20028', 'se260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '董小芳', '3', '2000001', '1'),
       ('20029', 'se260105', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '蒋浩宇', '3', '2000001', '1'),
       -- 软件学院学生（软工2602班）
       ('20030', 'se260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '沈明华', '3', '2000002', '1'),
       ('20031', 'se260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '余思琪', '3', '2000002', '1'),
       ('20032', 'se260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '潘志明', '3', '2000002', '1'),
       ('20033', 'se260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '范雨萱', '3', '2000002', '1'),
       -- 软件学院学生（软工2603班）
       ('20034', 'se260301', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '石伟杰', '3', '2000003', '1'),
       ('20035', 'se260302', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '姚晓红', '3', '2000003', '1'),
       ('20036', 'se260303', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '廖志华', '3', '2000003', '1'),
       ('20037', 'se260304', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '邹丽萍', '3', '2000003', '1'),
       ('20038', 'se260305', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '熊志远', '3', '2000003', '1'),
       -- 电子信息学院学生（电信2601班）
       ('20039', 'ei260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '金伟明', '3', '3000001', '1'),
       ('20040', 'ei260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '陆小燕', '3', '3000001', '1'),
       ('20041', 'ei260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '郝志强', '3', '3000001', '1'),
       ('20042', 'ei260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '孔晓敏', '3', '3000001', '1'),
       ('20043', 'ei260105', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '白志伟', '3', '3000001', '1'),
       -- 电子信息学院学生（电信2602班）
       ('20044', 'ei260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '崔浩然', '3', '3000002', '1'),
       ('20045', 'ei260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '康雨涵', '3', '3000002', '1'),
       ('20046', 'ei260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '毛志杰', '3', '3000002', '1'),
       ('20047', 'ei260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '邱小丽', '3', '3000002', '1'),
       -- 数字媒体学院学生（数媒2601班）
       ('20048', 'dm260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '秦志刚', '3', '4000001', '1'),
       ('20049', 'dm260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '江雨婷', '3', '4000001', '1'),
       ('20050', 'dm260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '史志伟', '3', '4000001', '1'),
       ('20051', 'dm260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '顾晓芳', '3', '4000001', '1'),
       -- 数字媒体学院学生（数媒2602班）
       ('20052', 'dm260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '侯志明', '3', '4000002', '1'),
       ('20053', 'dm260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '龚雨薇', '3', '4000002', '1'),
       ('20054', 'dm260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '邵志强', '3', '4000002', '1'),
       ('20055', 'dm260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '孟小燕', '3', '4000002', '1'),
       ('20056', 'dm260205', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '龙志华', '3', '4000002', '1'),
       -- 数字媒体学院学生（数媒2603班）
       ('20057', 'dm260301', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '万志杰', '3', '4000003', '1'),
       ('20058', 'dm260302', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '段雨涵', '3', '4000003', '1'),
       ('20059', 'dm260303', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '钱志伟', '3', '4000003', '1'),
       ('20060', 'dm260304', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '汤晓丽', '3', '4000003', '1'),
       -- 管理学院学生（管理2601班）
       ('20061', 'mg260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '尹志刚', '3', '5000001', '1'),
       ('20062', 'mg260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '黎雨萱', '3', '5000001', '1'),
       ('20063', 'mg260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '易志强', '3', '5000001', '1'),
       ('20064', 'mg260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '常小芳', '3', '5000001', '1'),
       ('20065', 'mg260105', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '武志伟', '3', '5000001', '1'),
       -- 管理学院学生（管理2602班）
       ('20066', 'mg260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '乔志明', '3', '5000002', '1'),
       ('20067', 'mg260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '贺雨涵', '3', '5000002', '1'),
       ('20068', 'mg260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '赖志杰', '3', '5000002', '1'),
       ('20069', 'mg260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '龚晓敏', '3', '5000002', '1'),
       -- 外语学院学生（英语2601班）
       ('20070', 'en260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '文志刚', '3', '6000001', '1'),
       ('20071', 'en260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '庞雨薇', '3', '6000001', '1'),
       ('20072', 'en260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '樊志强', '3', '6000001', '1'),
       ('20073', 'en260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '霍小燕', '3', '6000001', '1'),
       -- 外语学院学生（英语2602班）
       ('20074', 'en260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '殷志华', '3', '6000002', '1'),
       ('20075', 'en260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '詹雨涵', '3', '6000002', '1'),
       ('20076', 'en260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '甄志伟', '3', '6000002', '1'),
       ('20077', 'en260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '仇晓丽', '3', '6000002', '1'),
       ('20078', 'en260205', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '祖志杰', '3', '6000002', '1'),
       -- 外语学院学生（英语2603班）
       ('20079', 'en260301', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '巫志刚', '3', '6000003', '1'),
       ('20080', 'en260302', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '伍雨萱', '3', '6000003', '1'),
       ('20081', 'en260303', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '符志强', '3', '6000003', '1'),
       ('20082', 'en260304', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '严小芳', '3', '6000003', '1'),
       -- 艺术学院学生（艺术2601班）
       ('20083', 'art260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '焦志明', '3', '7000001', '1'),
       ('20084', 'art260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '舒雨涵', '3', '7000001', '1'),
       ('20085', 'art260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '屈志伟', '3', '7000001', '1'),
       ('20086', 'art260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '闵晓敏', '3', '7000001', '1'),
       -- 艺术学院学生（艺术2602班）
       ('20087', 'art260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '景志杰', '3', '7000002', '1'),
       ('20088', 'art260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '晋雨薇', '3', '7000002', '1'),
       ('20089', 'art260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '柳志刚', '3', '7000002', '1'),
       ('20090', 'art260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '邢小燕', '3', '7000002', '1'),
       ('20091', 'art260205', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '路志华', '3', '7000002', '1'),
       -- 会计学院学生（会计2601班）
       ('20092', 'ac260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '岳志强', '3', '8000001', '1'),
       ('20093', 'ac260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '齐雨涵', '3', '8000001', '1'),
       ('20094', 'ac260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '左志伟', '3', '8000001', '1'),
       ('20095', 'ac260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '梅晓丽', '3', '8000001', '1'),
       ('20096', 'ac260105', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '麻志杰', '3', '8000001', '1'),
       -- 会计学院学生（会计2602班）
       ('20097', 'ac260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '简志刚', '3', '8000002', '1'),
       ('20098', 'ac260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '焦雨萱', '3', '8000002', '1'),
       ('20099', 'ac260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '童志明', '3', '8000002', '1'),
       ('20100', 'ac260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '苗小芳', '3', '8000002', '1'),
       -- 会计学院学生（会计2603班）
       ('20101', 'ac260301', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '燕志强', '3', '8000003', '1'),
       ('20102', 'ac260302', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '熊雨涵', '3', '8000003', '1'),
       ('20103', 'ac260303', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '石志伟', '3', '8000003', '1'),
       ('20104', 'ac260304', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '秦晓敏', '3', '8000003', '1'),
       -- 会计学院学生（会计2604班）
       ('20105', 'ac260401', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '乌志杰', '3', '8000004', '1'),
       ('20106', 'ac260402', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '狄雨薇', '3', '8000004', '1'),
       ('20107', 'ac260403', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '耿志刚', '3', '8000004', '1'),
       ('20108', 'ac260404', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '祝小燕', '3', '8000004', '1'),
       ('20109', 'ac260405', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '路志华', '3', '8000004', '1'),
       -- 继续教育学院学生（继教2601班）
       ('20110', 'ce260101', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '甄志明', '3', '9000001', '1'),
       ('20111', 'ce260102', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '曲雨涵', '3', '9000001', '1'),
       ('20112', 'ce260103', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '项志伟', '3', '9000001', '1'),
       ('20113', 'ce260104', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '祝晓丽', '3', '9000001', '1'),
       -- 继续教育学院学生（继教2602班）
       ('20114', 'ce260201', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '柯志刚', '3', '9000002', '1'),
       ('20115', 'ce260202', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '管雨萱', '3', '9000002', '1'),
       ('20116', 'ce260203', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '卢志强', '3', '9000002', '1'),
       ('20117', 'ce260204', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '莫小芳', '3', '9000002', '1'),
       ('20118', 'ce260205', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '房志华', '3', '9000002', '1'),
       -- 继续教育学院学生（继教2603班）
       ('20119', 'ce260301', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '裘志杰', '3', '9000003', '1'),
       ('20120', 'ce260302', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '缪雨薇', '3', '9000003', '1'),
       ('20121', 'ce260303', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '潘志明', '3', '9000003', '1'),
       ('20122', 'ce260304', '$2a$10$8DplGzd1drRR8bfGTZvY5.1E.Nq6HXI0fu3N6HWQDOQo.vRUnjVSK', '戴晓敏', '3', '9000003', '1');


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
       ('404', '2', '401'), -- 实验模板管理
       ('405', '2', '402'), -- 实验报告管理
       ('406', '2', '403'); -- 模板编辑器

-- 为学生分配权限
INSERT INTO role_menu_relation(id, role_id, menu_id)
VALUES ('3001', '3', '200'), -- 系统管理（目录）
       ('3002', '3', '300'), -- 课堂管理（目录）
       ('3003', '3', '400'), -- 实验管理（目录）

       ('304', '3', '202'), -- 消息管理
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
       -- 学院
       ('1000000', '0', '计算机学院', 'cs', '/广州软件学院/计算机学院', ''),
       ('2000000', '0', '软件学院', 'se', '/广州软件学院/软件学院', ''),
       ('3000000', '0', '电子信息学院', 'ei', '/广州软件学院/电子信息学院', ''),
       ('4000000', '0', '数字媒体学院', 'dm', '/广州软件学院/数字媒体学院', ''),
       ('5000000', '0', '管理学院', 'mg', '/广州软件学院/管理学院', ''),
       ('6000000', '0', '外语学院', 'fl', '/广州软件学院/外语学院', ''),
       ('7000000', '0', '艺术学院', 'art', '/广州软件学院/艺术学院', ''),
       ('8000000', '0', '会计学院', 'ac', '/广州软件学院/会计学院', ''),
       ('9000000', '0', '继续教育学院', 'ce', '/广州软件学院/继续教育学院', ''),
       -- 班级
       -- 计算机学院班级
       ('1000001', '1000000', '计科2601班', 'cs2601', '/广州软件学院/计算机学院/计科2601班', ''),
       ('1000002', '1000000', '计科2602班', 'cs2602', '/广州软件学院/计算机学院/计科2602班', ''),
       ('1000003', '1000000', '计科2603班', 'cs2603', '/广州软件学院/计算机学院/计科2603班', ''),
       ('1000004', '1000000', '计科2604班', 'cs2604', '/广州软件学院/计算机学院/计科2604班', ''),
       ('1000005', '1000000', '计科2605班', 'cs2605', '/广州软件学院/计算机学院/计科2605班', ''),
       -- 软件学院班级
       ('2000001', '2000000', '软工2601班', 'se2601', '/广州软件学院/软件学院/软工2601班', ''),
       ('2000002', '2000000', '软工2602班', 'se2602', '/广州软件学院/软件学院/软工2602班', ''),
       ('2000003', '2000000', '软工2603班', 'se2603', '/广州软件学院/软件学院/软工2603班', ''),
       -- 电子信息学院班级
       ('3000001', '3000000', '电信2601班', 'ei2601', '/广州软件学院/电子信息学院/电信2601班', ''),
       ('3000002', '3000000', '电信2602班', 'ei2602', '/广州软件学院/电子信息学院/电信2602班', ''),
       -- 数字媒体学院班级
       ('4000001', '4000000', '数媒2601班', 'dm2601', '/广州软件学院/数字媒体学院/数媒2601班', ''),
       ('4000002', '4000000', '数媒2602班', 'dm2602', '/广州软件学院/数字媒体学院/数媒2602班', ''),
       ('4000003', '4000000', '数媒2603班', 'dm2603', '/广州软件学院/数字媒体学院/数媒2603班', ''),
       -- 管理学院班级
       ('5000001', '5000000', '管理2601班', 'mg2601', '/广州软件学院/管理学院/管理2601班', ''),
       ('5000002', '5000000', '管理2602班', 'mg2602', '/广州软件学院/管理学院/管理2602班', ''),
       -- 外语学院班级
       ('6000001', '6000000', '英语2601班', 'en2601', '/广州软件学院/外语学院/英语2601班', ''),
       ('6000002', '6000000', '英语2602班', 'en2602', '/广州软件学院/外语学院/英语2602班', ''),
       ('6000003', '6000000', '英语2603班', 'en2603', '/广州软件学院/外语学院/英语2603班', ''),
       -- 艺术学院班级
       ('7000001', '7000000', '艺术2601班', 'art2601', '/广州软件学院/艺术学院/艺术2601班', ''),
       ('7000002', '7000000', '艺术2602班', 'art2602', '/广州软件学院/艺术学院/艺术2602班', ''),
       -- 会计学院班级
       ('8000001', '8000000', '会计2601班', 'ac2601', '/广州软件学院/会计学院/会计2601班', ''),
       ('8000002', '8000000', '会计2602班', 'ac2602', '/广州软件学院/会计学院/会计2602班', ''),
       ('8000003', '8000000', '会计2603班', 'ac2603', '/广州软件学院/会计学院/会计2603班', ''),
       ('8000004', '8000000', '会计2604班', 'ac2604', '/广州软件学院/会计学院/会计2604班', ''),
       -- 继续教育学院班级
       ('9000001', '9000000', '继教2601班', 'ce2601', '/广州软件学院/继续教育学院/继教2601班', ''),
       ('9000002', '9000000', '继教2602班', 'ce2602', '/广州软件学院/继续教育学院/继教2602班', ''),
       ('9000003', '9000000', '继教2603班', 'ce2603', '/广州软件学院/继续教育学院/继教2603班', '');

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

-- 插入公告数据
INSERT INTO notice (id, title, content, creator_id, creator_name, create_time, update_time)
VALUES ('n20260401001', '欢迎使用实验报告管理系统',
        '各位老师、同学们：\n\n欢迎使用广州软件学院实验报告管理系统！\n\n本系统主要功能：\n\n1. 实验模板管理：教师可创建和管理实验报告模板\n2. 实验报告提交：学生可在线填写并提交实验报告\n3. 成绩管理：教师可对提交的实验报告进行评分和点评\n4. 数据统计：支持查看实验报告的提交情况和成绩分布\n\n如在使用过程中遇到问题，请联系系统管理员。\n\n祝大家使用愉快！',
        '1', '超级管理员', '2026-01-01 08:00:00', '2026-01-01 08:00:00'),
       ('n20260401002', '实验室安全规范更新通知',
        '各位老师、同学：\n\n为确保实验室安全，现将实验室使用规范更新如下：\n\n1. 进入实验室必须穿实验服，佩戴防护眼镜\n2. 严禁在实验室内饮食、吸烟\n3. 实验结束后请妥善处理废弃物\n4. 发现安全隐患立即报告值班人员\n\n请严格遵守实验室安全规定，确保人身和财产安全。',
        '1', '超级管理员', '2026-01-02 14:30:00', '2026-01-02 14:30:00'),
       ('n20260401003', '关于2026年春季学期开学通知',
        '各位老师、同学们：\n\n新学期将于2026年3月1日正式开学。请全体师生提前做好开学准备工作，按时返校报到。具体安排如下：\n\n1. 学生报到时间：2月28日-3月1日\n2. 正式上课时间：3月3日起\n3. 请各学院做好新学期教学安排\n\n祝大家新学期学业进步！',
        '1', '超级管理员', '2026-01-15 10:00:00', '2026-01-15 10:00:00'),
       ('n20260401004', '2026年度实验教学计划安排',
        '各位老师：\n\n2026年度实验教学计划已制定完成，请相关教师及时查看并做好准备工作。\n\n主要安排：\n1. 基础实验课程：3月至6月\n2. 综合设计实验：9月至12月\n3. 实验考核时间：期末考试前两周\n\n请各实验室负责人提前检查设备状态，确保实验顺利开展。',
        '1', '超级管理员', '2026-02-20 09:00:00', '2026-02-20 09:00:00'),
       ('n20260401005', '五一劳动节放假通知',
        '全校师生：\n\n根据国家节假日安排，现将2026年五一劳动节放假安排通知如下：\n\n放假时间：5月1日至5月5日（共5天）\n调休安排：4月26日（周日）、5月9日（周六）正常上班上课\n\n请各部门做好值班安排，同学们注意假期安全。祝大家节日快乐！',
        '1', '超级管理员', '2026-04-01 08:00:00', '2026-04-01 08:00:00'),
       ('n20260401006', '实验报告提交系统升级通知',
        '各位老师、同学：\n\n为提升用户体验，实验报告提交系统将于本周六（4月18日）进行升级维护，届时系统将暂停服务，预计维护时间8小时。\n\n升级内容：\n1. 优化报告上传速度\n2. 新增自动保存功能\n3. 完善成绩统计分析模块\n\n请提前做好相关工作安排，如有紧急情况请联系信息中心。',
        '1', '超级管理员', '2026-04-15 16:00:00', '2026-04-15 16:00:00'),
       ('n20260401007', '关于开展2026年大学生创新实验项目申报的通知',
        '各位老师、同学：\n\n为培养大学生创新意识和科研能力，现启动2026年大学生创新实验项目申报工作。\n\n申报要求：\n1. 项目周期一般为1-2年\n2. 团队成员3-5人，需有指导教师\n3. 项目经费一般为5000-20000元\n\n申报截止时间：2026年5月15日\n\n请各学院积极组织申报，详见科研处通知。',
        '1', '超级管理员', '2026-04-10 11:00:00', '2026-04-10 11:00:00');

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

-- 插入消息数据：教师用户10000（李老师）的消息
INSERT INTO message (id, title, content, receiver_id, receiver_name, status, creator_id, creator_name, create_time, update_time)
VALUES ('m20260410001', '实验报告提交提醒', '计科2601班的学生刘同学已提交了《甲醇燃烧实验》报告，请及时批阅。', '10000', '李老师', 0, '20000', '刘同学', '2026-04-10 09:15:00', '2026-04-10 09:15:00'),
       ('m20260411001', '有机化学课程资料更新通知', '您负责的《有机化学》课程资料已更新，请登录系统查看并确认。', '10000', '李老师', 0, '1', '超级管理员', '2026-04-11 08:00:00', '2026-04-11 08:00:00'),
       ('m20260412001', '细胞膜实验实验模板修改', '您提交的细胞膜实验模板已被修改，请检查。', '10000', '李老师', 1, '1', '超级管理员', '2026-04-12 10:30:00', '2026-04-12 10:30:00'),
       ('m20260413001', '刘同学问题咨询', '刘同学就《重力加速度测量实验》中的数据处理方法提出了疑问，手动秒表计时是否存在过大误差。', '10000', '李老师', 0, '20000', '刘同学', '2026-04-13 14:20:00', '2026-04-13 14:20:00'),
       ('m20260414001', '期末实验考核安排', '计算机学院本学期期末实验考核将于6月15日开始，请您提前做好教学安排。', '10000', '李老师', 0, '1', '超级管理员', '2026-04-14 09:00:00', '2026-04-14 09:00:00'),
       ('m20260415001', '实验室设备维护通知', '化学实验室将于4月20日进行设备维护，届时请调整相关实验课程安排。', '10000', '李老师', 0, '1', '超级管理员', '2026-04-15 16:30:00', '2026-04-15 16:30:00'),
       ('m20260416001', '新学期课程申报', '2026年秋季学期课程申报工作已启动，请于5月1日前完成所授课程的申报。', '10000', '李老师', 0, '1', '超级管理员', '2026-04-16 11:00:00', '2026-04-16 11:00:00');

-- 插入消息数据：学生用户20000（刘同学）的消息
INSERT INTO message (id, title, content, receiver_id, receiver_name, status, creator_id, creator_name, create_time, update_time)
VALUES ('m20260410002', '实验报告已提交成功', '您提交的《甲醇燃烧实验》报告已成功提交，等待教师批阅。', '20000', '刘同学', 0, '1', '超级管理员', '2026-04-10 09:20:00', '2026-04-10 09:20:00'),
       ('m20260411002', '成绩通知', '您的《细胞膜实验》报告已评分，请查阅，若有疑问请联系授课老师。', '20000', '刘同学', 1, '10000', '李老师', '2026-04-11 15:30:00', '2026-04-11 15:30:00'),
       ('m20260412002', '课程安排调整', '《有机化学》课程第8周实验课时间调整为周三下午，请注意查看最新课表。', '20000', '刘同学', 0, '1', '超级管理员', '2026-04-14 14:00:00', '2026-04-14 14:00:00'),
       ('m20260413002', '实验报告补交通知', '您有一份实验报告逾期未提交，请尽快补交，否则将影响最终成绩。', '20000', '刘同学', 0, '1', '超级管理员', '2026-04-15 10:00:00', '2026-04-15 10:00:00'),
       ('m20260414002', '期末考试安排', '本学期期末实验考核定于6月18日进行，请认真复习，诚信应考。', '20000', '刘同学', 0, '1', '超级管理员', '2026-04-16 09:30:00', '2026-04-16 09:30:00'),
       ('m20260415002', '实验室预约成功', '您预约的4月20日上午9:00-11:00化学实验室已成功，请准时到达。', '20000', '刘同学', 0, '1', '超级管理员', '2026-04-17 11:15:00', '2026-04-17 11:15:00');

-- 插入消息数据：超级管理员（用户ID=1）接收的消息
INSERT INTO message (id, title, content, receiver_id, receiver_name, status, creator_id, creator_name, create_time, update_time)
VALUES ('m20260418001', '系统巡检报告', '本周系统运行正常，用户活跃度提升15%，建议继续优化用户体验。', '1', '超级管理员', 0, '10000', '李老师', '2026-04-18 08:00:00', '2026-04-18 08:00:00'),
       ('m20260418002', '新用户注册申请', '有一名新教师申请注册账号，请登录系统后台进行审核。', '1', '超级管理员', 0, '10000', '李老师', '2026-04-18 10:30:00', '2026-04-18 10:30:00'),
       ('m20260418003', '存储空间预警', '服务器存储空间已使用达85%，建议尽快清理历史数据或扩容。', '1', '超级管理员', 0, '10000', '李老师', '2026-04-18 14:00:00', '2026-04-18 14:00:00');


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

-- 插入课程数据
INSERT INTO course (id, course_name, description, creator_id, admin_count, student_count, template_count, create_time, update_time)
VALUES ('c20260401001', '有机化学', '本课程是研究有机化合物的组成、结构、性质、制备方法与应用的科学，是化学中极重要的一个分支。', '10000', 0, 0, 0, '2026-02-20 09:00:00', '2026-02-20 09:00:00'),
       ('c20260401002', '大学物理', '大学物理是高等学校理工科各专业的通识性必修基础课，它以物理学基本理论为核心，研究物质结构、相互作用及运动规律，旨在培养学生掌握物理学研究问题的思路和方法，并提升其建立物理模型、分析计算及理论联系实际等多方面的能力。‌', '10000', 0, 0, 0, '2026-03-01 10:30:00', '2026-03-01 10:30:00'),
       ('c20260401003', '细胞与分子生物学', '本课程生命科学的微观基石。‌细胞生物学‌研究细胞的结构、功能及生命活动，如细胞增殖、分化、信号传导等。‌分子生物学‌则深入到基因层面，探讨DNA复制、转录、翻译以及基因表达调控等分子机制。‌', '10000', 0, 0, 0, '2026-03-05 14:00:00', '2026-03-05 14:00:00');

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
        '甲醇燃烧实验，了解热值测定的基本原理和实验方法。', '10000', '2026-02-25 23:06:25', '2026-03-04 00:23:08'),
       ('2028483307435061249', '重力加速度测量实验',
        '# 1.实验目的\n\n1、学习用**自由落体法**测量当地的重力加速度 (g)，理解自由落体运动的规律。\n\n2、掌握刻度尺、秒表的正确使用方法，学会实验数据的记录与处理。\n\n# 2.实验步骤\n\n1、组装实验装置：将铁架台固定在水平桌面，用铁夹夹住重锤的悬挂线，使重锤自然下垂，标记重锤底部的初始位置（下落起点）。\n\n2、测量下落高度：用刻度尺测量从下落起点到水平地面（或固定终点）的距离，记为 (h)，测量3次，取平均值作为最终下落高度。\n\n3、测量下落时间：松开铁夹，让重锤自由下落，同时启动秒表；当重锤到达终点时，立即停止秒表，记录下落时间 (t)。\n\n4、数据处理：根据每组的 (h) 和时间 (t)，代入公式计算每组的 (g)，再求所有 (g) 的平均值，作为最终测量结果。\n\n# 3.实验数据\n\n\n\n| 下落高度 (h) | 下落时间 (t) | 重力加速度 (g) |\n|----|----|----|\n|    |    |    |\n|    |    |    |\n|    |    |    |\n\n\n\n\n# 4.实验结论\n\n*[请输入实验结论]*',
        '这是一个测试当地重力加速度g的实验', '10000', '2026-03-02 22:51:23', '2026-03-04 00:22:27'),
       ('2029232264897429505', '细胞膜实验',
        '# 实验目的\n\n实验的目的为“**验证活细胞的细胞膜具有控制物质进出的作用**”。实验自变量为细胞死活状态，可用热水杀死植物细胞，达到控制自变量的目的。因变量是细胞膜对物质的控制能力，可用叶片的颜色是否褪去、水是否变红作为观察指标。在实验过程中要注意单一变量原则，其他无关变量要保持相同且适宜，如清水和开水的水量要保持一致。\n\n  \n\n# 实验步骤\n\n1\\. 将2个相同的碗，编号为甲、乙。\n\n2\\. 向甲碗中倒入一满杯清水，向乙碗中倒入一满杯已用电热水壶烧开的开水。\n\n3\\. 分别向甲、乙两碗中放入2片红色苋菜叶。\n\n4\\. 一段时间后，观察水和叶片颜色的变化。\n\n  \n\n# 实验数据\n\n  \n\n\n\n| 甲颜色 | 乙颜色 |\n|----|----|\n|    |    |\n\n\n\n\n  \n\n# 实验结论\n\n*[|请填写实验结论]*',
        '验证活细胞的细胞膜具有控制物质进出的作用', '10000', '2026-03-05 00:27:28', '2026-03-05 00:27:28');


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

