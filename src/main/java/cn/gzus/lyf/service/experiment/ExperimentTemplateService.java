package cn.gzus.lyf.service.experiment;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.dao.ExperimentTemplateDAO;
import cn.gzus.lyf.dao.entity.ExperimentTemplateEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExperimentTemplateService {

    private ExperimentTemplateDAO templateDAO;

    @Autowired
    public void setTemplateDAO(ExperimentTemplateDAO templateDAO) {
        this.templateDAO = templateDAO;
    }

    /**
     * 新增模板
     * @param templateEntity 模板实体
     * @return 是否成功
     */
    public boolean addTemplate(ExperimentTemplateEntity templateEntity) {
        return templateDAO.addTemplate(templateEntity);
    }

    /**
     * 删除模板
     * @param templateId 模板ID
     * @return 是否成功
     */
    public boolean deleteTemplate(String templateId) {
        return templateDAO.deleteTemplate(templateId);
    }

    /**
     * 修改模板
     * @param templateEntity 模板实体
     * @return 是否成功
     */
    public boolean updateTemplate(ExperimentTemplateEntity templateEntity) {
        return templateDAO.updateTemplate(templateEntity);
    }

    /**
     * 根据ID获取模板
     * @param templateId 模板ID
     * @return 模板实体
     */
    public ExperimentTemplateEntity getTemplateById(String templateId) {
        return templateDAO.getTemplateById(templateId);
    }

    /**
     * 分页查询模板
     * @param current 当前页码
     * @param size 每页大小
     * @param creatorId 创建者ID
     * @param templateName 模板名称（支持模糊查询）
     * @return 分页结果
     */
    public PageDto<ExperimentTemplateEntity> getTemplatePage(Integer current, Integer size, String creatorId, String templateName) {
        return templateDAO.getTemplatePage(current, size, creatorId, templateName);
    }
}
