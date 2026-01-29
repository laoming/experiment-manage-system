package cn.gzus.lyf.common.dto;

/**
 * 实验模板查询DTO
 */
public class ExperimentTemplateQueryDto {

    private String creatorId;
    private String templateName;

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }
}
