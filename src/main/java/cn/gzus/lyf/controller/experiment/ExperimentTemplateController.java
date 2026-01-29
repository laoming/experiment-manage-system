package cn.gzus.lyf.controller.experiment;

import cn.gzus.lyf.common.dto.ExperimentTemplateQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.dao.entity.ExperimentTemplateEntity;
import cn.gzus.lyf.service.experiment.ExperimentTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 实验模板管理
 */
@RestController
@RequestMapping("/experimentTemplate")
public class ExperimentTemplateController {

    private ExperimentTemplateService templateService;

    @Autowired
    public void setTemplateService(ExperimentTemplateService templateService) {
        this.templateService = templateService;
    }

    /**
     * 分页查询模板
     */
    @PostMapping("/page")
    public Result<PageDto<ExperimentTemplateEntity>> getTemplatePage(
            @RequestParam int current,
            @RequestParam int size,
            @RequestBody ExperimentTemplateQueryDto queryDto) {
        return Result.success(templateService.getTemplatePage(current, size, queryDto));
    }

    /**
     * 根据ID获取模板
     */
    @PostMapping("/get")
    public Result<ExperimentTemplateEntity> getTemplateById(@RequestParam String templateId) {
        return Result.success(templateService.getTemplateById(templateId));
    }

    /**
     * 新增模板
     */
    @PostMapping("/add")
    public Result<Boolean> addTemplate(@RequestBody ExperimentTemplateEntity templateEntity) {
        return Result.success(templateService.addTemplate(templateEntity));
    }

    /**
     * 更新模板
     */
    @PostMapping("/update")
    public Result<Boolean> updateTemplate(@RequestBody ExperimentTemplateEntity templateEntity) {
        return Result.success(templateService.updateTemplate(templateEntity));
    }

    /**
     * 删除模板
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteTemplate(@RequestBody ExperimentTemplateEntity templateEntity) {
        return Result.success(templateService.deleteTemplate(templateEntity.getId()));
    }
}
