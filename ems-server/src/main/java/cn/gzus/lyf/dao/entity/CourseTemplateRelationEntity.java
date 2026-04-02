package cn.gzus.lyf.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 课程-实验模板关联表实体类
 */
@TableName("course_template_relation")
public class CourseTemplateRelationEntity {

    /**
     * 主键ID
     */
    private String id;

    /**
     * 课程ID
     */
    private String courseId;

    /**
     * 实验模板ID
     */
    private String templateId;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }
}
