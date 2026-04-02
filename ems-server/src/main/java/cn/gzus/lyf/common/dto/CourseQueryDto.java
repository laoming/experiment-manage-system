package cn.gzus.lyf.common.dto;

import java.util.List;

/**
 * 课程查询DTO
 */
public class CourseQueryDto {

    /**
     * 用户类型：管理者
     */
    public static final int USER_TYPE_ADMIN = 1;

    /**
     * 用户类型：学生
     */
    public static final int USER_TYPE_STUDENT = 2;

    /**
     * 课程名称
     */
    private String courseName;

    /**
     * 创建者ID
     */
    private String creatorId;

    /**
     * 当前用户ID（用于查询当前用户创建或参与的课程）
     */
    private String currentUserId;

    /**
     * 用户类型：1-管理者，2-学生（用于区分课程管理和我的课程）
     */
    private Integer userType;

    /**
     * 当前用户作为管理者参与的课程ID列表（由后端填充）
     */
    private List<String> adminCourseIds;

    /**
     * 当前用户作为学生参与的课程ID列表（由后端填充）
     */
    private List<String> studentCourseIds;

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public String getCurrentUserId() {
        return currentUserId;
    }

    public void setCurrentUserId(String currentUserId) {
        this.currentUserId = currentUserId;
    }

    public Integer getUserType() {
        return userType;
    }

    public void setUserType(Integer userType) {
        this.userType = userType;
    }

    public List<String> getAdminCourseIds() {
        return adminCourseIds;
    }

    public void setAdminCourseIds(List<String> adminCourseIds) {
        this.adminCourseIds = adminCourseIds;
    }

    public List<String> getStudentCourseIds() {
        return studentCourseIds;
    }

    public void setStudentCourseIds(List<String> studentCourseIds) {
        this.studentCourseIds = studentCourseIds;
    }
}
