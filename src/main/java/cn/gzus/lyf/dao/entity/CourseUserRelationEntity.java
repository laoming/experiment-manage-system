package cn.gzus.lyf.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 课程-用户关联表实体类
 */
@TableName("course_user_relation")
public class CourseUserRelationEntity {

    /**
     * 用户类型：管理者
     */
    public static final int USER_TYPE_ADMIN = 1;

    /**
     * 用户类型：普通用户（学生）
     */
    public static final int USER_TYPE_STUDENT = 2;

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

    /**
     * 用户类型：1-管理者，2-普通用户
     */
    private Integer userType;

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

    public Integer getUserType() {
        return userType;
    }

    public void setUserType(Integer userType) {
        this.userType = userType;
    }
}
