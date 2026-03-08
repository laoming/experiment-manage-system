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


-- 实验报告表
CREATE TABLE experiment_report
(
    id          VARCHAR(64) PRIMARY KEY COMMENT '报告ID',
    template_id VARCHAR(64) NOT NULL COMMENT '使用的模板ID',
    course_id   VARCHAR(36) COMMENT '课程ID',
    report_name VARCHAR(100) NOT NULL COMMENT '报告名称',
    report_content TEXT NOT NULL COMMENT '报告内容(JSON格式)',
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

