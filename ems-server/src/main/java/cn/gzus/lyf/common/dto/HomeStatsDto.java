package cn.gzus.lyf.common.dto;

/**
 * 首页统计数据 DTO
 */
public class HomeStatsDto {

    /**
     * 用户角色编码：TEACHER-老师，STUDENT-学生
     */
    private String roleCode;

    /**
     * 老师统计：管理的课程数
     */
    private Integer managedCourseCount;

    /**
     * 老师统计：维护的实验模板数
     */
    private Integer maintainedTemplateCount;

    /**
     * 老师统计：已评分的实验报告数
     */
    private Integer gradedReportCount;

    /**
     * 老师统计：待评分的实验报告数
     */
    private Integer pendingGradeReportCount;

    /**
     * 学生统计：学的课程数
     */
    private Integer enrolledCourseCount;

    /**
     * 学生统计：课程所有报告总和
     */
    private Integer totalTemplateCount;

    /**
     * 学生统计：已提交的实验报告数
     */
    private Integer submittedReportCount;

    /**
     * 学生统计：待提交的实验报告数
     */
    private Integer pendingSubmitReportCount;

    public HomeStatsDto() {
    }

    public String getRoleCode() {
        return roleCode;
    }

    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode;
    }

    public Integer getManagedCourseCount() {
        return managedCourseCount;
    }

    public void setManagedCourseCount(Integer managedCourseCount) {
        this.managedCourseCount = managedCourseCount;
    }

    public Integer getMaintainedTemplateCount() {
        return maintainedTemplateCount;
    }

    public void setMaintainedTemplateCount(Integer maintainedTemplateCount) {
        this.maintainedTemplateCount = maintainedTemplateCount;
    }

    public Integer getGradedReportCount() {
        return gradedReportCount;
    }

    public void setGradedReportCount(Integer gradedReportCount) {
        this.gradedReportCount = gradedReportCount;
    }

    public Integer getPendingGradeReportCount() {
        return pendingGradeReportCount;
    }

    public void setPendingGradeReportCount(Integer pendingGradeReportCount) {
        this.pendingGradeReportCount = pendingGradeReportCount;
    }

    public Integer getEnrolledCourseCount() {
        return enrolledCourseCount;
    }

    public void setEnrolledCourseCount(Integer enrolledCourseCount) {
        this.enrolledCourseCount = enrolledCourseCount;
    }

    public Integer getTotalTemplateCount() {
        return totalTemplateCount;
    }

    public void setTotalTemplateCount(Integer totalTemplateCount) {
        this.totalTemplateCount = totalTemplateCount;
    }

    public Integer getSubmittedReportCount() {
        return submittedReportCount;
    }

    public void setSubmittedReportCount(Integer submittedReportCount) {
        this.submittedReportCount = submittedReportCount;
    }

    public Integer getPendingSubmitReportCount() {
        return pendingSubmitReportCount;
    }

    public void setPendingSubmitReportCount(Integer pendingSubmitReportCount) {
        this.pendingSubmitReportCount = pendingSubmitReportCount;
    }
}
