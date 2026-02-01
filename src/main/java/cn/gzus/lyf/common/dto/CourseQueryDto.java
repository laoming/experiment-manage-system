package cn.gzus.lyf.common.dto;

/**
 * 课程查询DTO
 */
public class CourseQueryDto {

    /**
     * 课程名称
     */
    private String courseName;

    /**
     * 创建者ID
     */
    private String creatorId;

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
}
