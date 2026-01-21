package cn.gzus.lyf.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

/**
 * 实验模板表实体类
 */
@TableName("experiment_template")
public class ExperimentTemplateEntity {

    /**
     * 模板ID
     */
    private String id;

    /**
     * 模板名称
     */
    private String templateName;

    /**
     * 模板内容(JSON格式,包含拖拽组件配置)
     */
    private String templateContent;

    /**
     * 模板描述
     */
    private String description;

    /**
     * 创建者ID
     */
    private String creatorId;

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

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getTemplateContent() {
        return templateContent;
    }

    public void setTemplateContent(String templateContent) {
        this.templateContent = templateContent;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
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
