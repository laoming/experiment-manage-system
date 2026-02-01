package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.CourseTemplateRelationEntity;
import cn.gzus.lyf.dao.mapper.CourseTemplateRelationMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class CourseTemplateRelationDAO extends ServiceImpl<CourseTemplateRelationMapper, CourseTemplateRelationEntity> {

    /**
     * 为课程绑定实验模板
     * @param courseId 课程ID
     * @param templateIds 实验模板ID列表
     * @return 是否成功
     */
    public boolean bindTemplates(String courseId, List<String> templateIds) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        Objects.requireNonNull(templateIds, "实验模板ID列表不能为空");

        for (String templateId : templateIds) {
            CourseTemplateRelationEntity relation = new CourseTemplateRelationEntity();
            relation.setId(java.util.UUID.randomUUID().toString());
            relation.setCourseId(courseId);
            relation.setTemplateId(templateId);
            this.save(relation);
        }
        return true;
    }

    /**
     * 解除课程绑定的实验模板
     * @param courseId 课程ID
     * @param templateIds 实验模板ID列表
     * @return 是否成功
     */
    public boolean unbindTemplates(String courseId, List<String> templateIds) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        Objects.requireNonNull(templateIds, "实验模板ID列表不能为空");

        for (String templateId : templateIds) {
            this.remove(Wrappers.<CourseTemplateRelationEntity>lambdaQuery()
                    .eq(CourseTemplateRelationEntity::getCourseId, courseId)
                    .eq(CourseTemplateRelationEntity::getTemplateId, templateId));
        }
        return true;
    }

    /**
     * 获取课程绑定的实验模板ID列表
     * @param courseId 课程ID
     * @return 实验模板ID列表
     */
    public List<String> getTemplateIdsByCourseId(String courseId) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        return this.list(Wrappers.<CourseTemplateRelationEntity>lambdaQuery()
                .select(CourseTemplateRelationEntity::getTemplateId)
                .eq(CourseTemplateRelationEntity::getCourseId, courseId))
                .stream()
                .map(CourseTemplateRelationEntity::getTemplateId)
                .collect(java.util.stream.Collectors.toList());
    }
}
