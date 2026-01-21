package cn.gzus.lyf.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

/**
 * 实验报告表实体类
 */
@TableName("experiment_report")
public class ExperimentReportEntity {

    /**
     * 报告ID
     */
    private String id;

    /**
     * 使用的模板ID
     */
    private String templateId;

    /**
     * 报告名称
     */
    private String reportName;

    /**
     * 报告内容(JSON格式)
     */
    private String reportContent;

    /**
     * 学生ID
     */
    private String studentId;

    /**
     * 提交时间
     */
    private Date submitTime;

    /**
     * 分数
     */
    private Integer score;

    /**
     * 评语
     */
    private String comment;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public String getReportContent() {
        return reportContent;
    }

    public void setReportContent(String reportContent) {
        this.reportContent = reportContent;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Date getSubmitTime() {
        return submitTime;
    }

    public void setSubmitTime(Date submitTime) {
        this.submitTime = submitTime;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }
}
