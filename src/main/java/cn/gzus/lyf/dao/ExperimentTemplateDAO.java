package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.ExperimentTemplateEntity;
import cn.gzus.lyf.dao.mapper.ExperimentTemplateMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Objects;

@Service
public class ExperimentTemplateDAO extends ServiceImpl<ExperimentTemplateMapper, ExperimentTemplateEntity> {

    /**
     * 新增模板
     * @param templateEntity 模板实体
     * @return 是否成功
     */
    public boolean addTemplate(ExperimentTemplateEntity templateEntity) {
        Objects.requireNonNull(templateEntity, "模板实体不能为空");
        Objects.requireNonNull(templateEntity.getTemplateName(), "模板名称不能为空");
        Objects.requireNonNull(templateEntity.getTemplateContent(), "模板内容不能为空");
        Objects.requireNonNull(templateEntity.getCreatorId(), "创建者ID不能为空");

        templateEntity.setCreateTime(new Date());
        templateEntity.setUpdateTime(new Date());
        return this.save(templateEntity);
    }

    /**
     * 删除模板
     * @param templateId 模板ID
     * @return 是否成功
     */
    public boolean deleteTemplate(String templateId) {
        Objects.requireNonNull(templateId, "模板ID不能为空");
        return this.removeById(templateId);
    }

    /**
     * 修改模板
     * @param templateEntity 模板实体
     * @return 是否成功
     */
    public boolean updateTemplate(ExperimentTemplateEntity templateEntity) {
        Objects.requireNonNull(templateEntity, "模板实体不能为空");
        Objects.requireNonNull(templateEntity.getId(), "模板ID不能为空");

        templateEntity.setUpdateTime(new Date());
        return this.updateById(templateEntity);
    }

    /**
     * 根据ID获取模板
     * @param templateId 模板ID
     * @return 模板实体
     */
    public ExperimentTemplateEntity getTemplateById(String templateId) {
        Objects.requireNonNull(templateId, "模板ID不能为空");
        return this.getById(templateId);
    }

    /**
     * 根据创建者ID分页查询模板
     * @param current 当前页码
     * @param size 每页大小
     * @param creatorId 创建者ID
     * @param templateName 模板名称（支持模糊查询）
     * @return 分页结果
     */
    public PageDto<ExperimentTemplateEntity> getTemplatePage(Integer current, Integer size, String creatorId, String templateName) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        IPage<ExperimentTemplateEntity> templatePage = this.page(new Page<>(current, size),
                new LambdaQueryWrapper<ExperimentTemplateEntity>()
                        .eq(creatorId != null, ExperimentTemplateEntity::getCreatorId, creatorId)
                        .like(templateName != null && !templateName.trim().isEmpty(), ExperimentTemplateEntity::getTemplateName, templateName)
                        .orderByDesc(ExperimentTemplateEntity::getUpdateTime)
        );
        return BeanCopyUtils.copy(templatePage, PageDto.class);
    }
}
