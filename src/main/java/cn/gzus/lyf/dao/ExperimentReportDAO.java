package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.ExperimentReportEntity;
import cn.gzus.lyf.dao.mapper.ExperimentReportMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class ExperimentReportDAO extends ServiceImpl<ExperimentReportMapper, ExperimentReportEntity> {

    /**
     * 新增报告
     * @param reportEntity 报告实体
     * @return 是否成功
     */
    public boolean addReport(ExperimentReportEntity reportEntity) {
        Objects.requireNonNull(reportEntity, "报告实体不能为空");
        Objects.requireNonNull(reportEntity.getTemplateId(), "模板ID不能为空");
        Objects.requireNonNull(reportEntity.getReportName(), "报告名称不能为空");
        Objects.requireNonNull(reportEntity.getReportContent(), "报告内容不能为空");
        Objects.requireNonNull(reportEntity.getStudentId(), "学生ID不能为空");

        reportEntity.setCreateTime(new Date());
        reportEntity.setUpdateTime(new Date());
        return this.save(reportEntity);
    }

    /**
     * 删除报告
     * @param reportId 报告ID
     * @return 是否成功
     */
    public boolean deleteReport(String reportId) {
        Objects.requireNonNull(reportId, "报告ID不能为空");
        return this.removeById(reportId);
    }

    /**
     * 修改报告
     * @param reportEntity 报告实体
     * @return 是否成功
     */
    public boolean updateReport(ExperimentReportEntity reportEntity) {
        Objects.requireNonNull(reportEntity, "报告实体不能为空");
        Objects.requireNonNull(reportEntity.getId(), "报告ID不能为空");

        reportEntity.setUpdateTime(new Date());
        return this.updateById(reportEntity);
    }

    /**
     * 提交报告
     * @param reportId 报告ID
     * @return 是否成功
     */
    public boolean submitReport(String reportId) {
        Objects.requireNonNull(reportId, "报告ID不能为空");
        ExperimentReportEntity reportEntity = this.getById(reportId);
        Objects.requireNonNull(reportEntity, "报告不存在");

        reportEntity.setSubmitTime(new Date());
        return this.updateById(reportEntity);
    }

    /**
     * 评分
     * @param reportId 报告ID
     * @param score 分数
     * @param comment 评语
     * @return 是否成功
     */
    public boolean gradeReport(String reportId, Integer score, String comment) {
        Objects.requireNonNull(reportId, "报告ID不能为空");
        Objects.requireNonNull(score, "分数不能为空");

        ExperimentReportEntity reportEntity = this.getById(reportId);
        Objects.requireNonNull(reportEntity, "报告不存在");

        reportEntity.setScore(score);
        reportEntity.setComment(comment);
        reportEntity.setUpdateTime(new Date());
        return this.updateById(reportEntity);
    }

    /**
     * 根据ID获取报告
     * @param reportId 报告ID
     * @return 报告实体
     */
    public ExperimentReportEntity getReportById(String reportId) {
        Objects.requireNonNull(reportId, "报告ID不能为空");
        return this.getById(reportId);
    }

    /**
     * 根据模板ID获取报告列表
     * @param templateId 模板ID
     * @return 报告列表
     */
    public List<ExperimentReportEntity> getReportsByTemplateId(String templateId) {
        Objects.requireNonNull(templateId, "模板ID不能为空");
        return this.list(new LambdaQueryWrapper<ExperimentReportEntity>()
                .eq(ExperimentReportEntity::getTemplateId, templateId)
                .orderByDesc(ExperimentReportEntity::getUpdateTime)
        );
    }

    /**
     * 根据学生ID分页查询报告
     * @param current 当前页码
     * @param size 每页大小
     * @param studentId 学生ID
     * @return 分页结果
     */
    public PageDto<ExperimentReportEntity> getReportPage(Integer current, Integer size, String studentId) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        IPage<ExperimentReportEntity> reportPage = this.page(new Page<>(current, size),
                new LambdaQueryWrapper<ExperimentReportEntity>()
                        .eq(studentId != null, ExperimentReportEntity::getStudentId, studentId)
                        .orderByDesc(ExperimentReportEntity::getUpdateTime)
        );
        return BeanCopyUtils.copy(reportPage, PageDto.class);
    }
}
