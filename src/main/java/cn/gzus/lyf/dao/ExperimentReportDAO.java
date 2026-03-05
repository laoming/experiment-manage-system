package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.enums.ReportStatusEnum;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.ExperimentReportEntity;
import cn.gzus.lyf.dao.mapper.ExperimentReportMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class ExperimentReportDAO extends ServiceImpl<ExperimentReportMapper, ExperimentReportEntity> {

    /**
     * 新增报告
     * @param reportEntity 报告实体
     * @return 新增报告的ID
     */
    public String addReport(ExperimentReportEntity reportEntity) {
        Objects.requireNonNull(reportEntity, "报告实体不能为空");
        Objects.requireNonNull(reportEntity.getTemplateId(), "模板ID不能为空");
        Objects.requireNonNull(reportEntity.getReportName(), "报告名称不能为空");
        Objects.requireNonNull(reportEntity.getReportContent(), "报告内容不能为空");
        Objects.requireNonNull(reportEntity.getStudentId(), "学生ID不能为空");
        Objects.requireNonNull(reportEntity.getCourseId(), "课程ID不能为空");

        reportEntity.setStatus(ReportStatusEnum.DRAFT.getCode());
        reportEntity.setCreateTime(new Date());
        reportEntity.setUpdateTime(new Date());
        this.save(reportEntity);
        return reportEntity.getId();
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

        reportEntity.setStatus(ReportStatusEnum.SUBMITTED.getCode());
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

        reportEntity.setStatus(ReportStatusEnum.GRADED.getCode());
        reportEntity.setScore(score);
        reportEntity.setComment(comment);
        reportEntity.setGradeTime(new Date());
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

    /**
     * 根据学生ID获取所有报告
     * @param studentId 学生ID
     * @return 报告列表
     */
    public List<ExperimentReportEntity> getReportsByStudentId(String studentId) {
        Objects.requireNonNull(studentId, "学生ID不能为空");
        return this.list(new LambdaQueryWrapper<ExperimentReportEntity>()
                .eq(ExperimentReportEntity::getStudentId, studentId)
                .orderByDesc(ExperimentReportEntity::getUpdateTime)
        );
    }

    /**
     * 根据学生ID和模板ID列表获取报告
     * @param studentId 学生ID
     * @param templateIds 模板ID列表
     * @return 报告列表
     */
    public List<ExperimentReportEntity> getReportsByStudentIdAndTemplateIds(String studentId, List<String> templateIds) {
        if (templateIds == null || templateIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return this.list(new LambdaQueryWrapper<ExperimentReportEntity>()
                .eq(ExperimentReportEntity::getStudentId, studentId)
                .in(ExperimentReportEntity::getTemplateId, templateIds)
                .orderByDesc(ExperimentReportEntity::getUpdateTime)
        );
    }

    /**
     * 根据学生ID和模板ID获取报告
     * @param studentId 学生ID
     * @param templateId 模板ID
     * @return 报告实体
     */
    public ExperimentReportEntity getReportByStudentIdAndTemplateId(String studentId, String templateId) {
        Objects.requireNonNull(studentId, "学生ID不能为空");
        Objects.requireNonNull(templateId, "模板ID不能为空");
        return this.getOne(new LambdaQueryWrapper<ExperimentReportEntity>()
                .eq(ExperimentReportEntity::getStudentId, studentId)
                .eq(ExperimentReportEntity::getTemplateId, templateId)
                .orderByDesc(ExperimentReportEntity::getUpdateTime)
                .last("LIMIT 1")
        );
    }

    /**
     * 根据学生ID、课程ID和模板ID获取报告
     * 优先返回已提交的报告，如果没有则返回草稿
     * @param studentId 学生ID
     * @param courseId 课程ID
     * @param templateId 模板ID
     * @return 报告实体
     */
    public ExperimentReportEntity getReportByStudentIdAndCourseIdAndTemplateId(String studentId, String courseId, String templateId) {
        Objects.requireNonNull(studentId, "学生ID不能为空");
        Objects.requireNonNull(courseId, "课程ID不能为空");
        Objects.requireNonNull(templateId, "模板ID不能为空");

        // 优先查找已提交或已评分的报告
        ExperimentReportEntity submittedReport = this.getOne(new LambdaQueryWrapper<ExperimentReportEntity>()
                .eq(ExperimentReportEntity::getStudentId, studentId)
                .eq(ExperimentReportEntity::getCourseId, courseId)
                .eq(ExperimentReportEntity::getTemplateId, templateId)
                .in(ExperimentReportEntity::getStatus, ReportStatusEnum.SUBMITTED.getCode(), ReportStatusEnum.GRADED.getCode())
                .orderByDesc(ExperimentReportEntity::getSubmitTime)
                .last("LIMIT 1")
        );

        if (submittedReport != null) {
            return submittedReport;
        }

        // 如果没有已提交或已评分的报告，返回草稿
        return this.getOne(new LambdaQueryWrapper<ExperimentReportEntity>()
                .eq(ExperimentReportEntity::getStudentId, studentId)
                .eq(ExperimentReportEntity::getCourseId, courseId)
                .eq(ExperimentReportEntity::getTemplateId, templateId)
                .eq(ExperimentReportEntity::getStatus, ReportStatusEnum.DRAFT.getCode())
                .orderByDesc(ExperimentReportEntity::getUpdateTime)
                .last("LIMIT 1")
        );
    }

    /**
     * 根据课程ID获取所有已提交的报告
     * @param courseId 课程ID
     * @return 报告列表
     */
    public List<ExperimentReportEntity> getReportsByCourseId(String courseId) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        return this.list(new LambdaQueryWrapper<ExperimentReportEntity>()
                .eq(ExperimentReportEntity::getCourseId, courseId)
                .isNotNull(ExperimentReportEntity::getSubmitTime)
                .orderByDesc(ExperimentReportEntity::getSubmitTime)
        );
    }
}
