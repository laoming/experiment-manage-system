package cn.gzus.lyf.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 课程-用户关联表实体类
 */
@TableName("course_user_relation")
public class CourseUserRelationEntity {

    /**
     * 主键ID
     */
    private String id;

    /**
     * 课程ID
     */
    private String courseId;

    /**
     * 用户ID
     */
    private String userId;

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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
