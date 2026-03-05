package cn.gzus.lyf.service.experiment;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.ReportOverviewDto;
import cn.gzus.lyf.common.enums.ReportStatusEnum;
import cn.gzus.lyf.dao.CourseDAO;
import cn.gzus.lyf.dao.CourseTemplateRelationDAO;
import cn.gzus.lyf.dao.CourseUserRelationDAO;
import cn.gzus.lyf.dao.ExperimentReportDAO;
import cn.gzus.lyf.dao.ExperimentTemplateDAO;
import cn.gzus.lyf.dao.entity.CourseEntity;
import cn.gzus.lyf.dao.entity.CourseTemplateRelationEntity;
import cn.gzus.lyf.dao.entity.CourseUserRelationEntity;
import cn.gzus.lyf.dao.entity.ExperimentReportEntity;
import cn.gzus.lyf.dao.entity.ExperimentTemplateEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExperimentReportService {

    private ExperimentReportDAO reportDAO;
    private CourseUserRelationDAO courseUserRelationDAO;
    private CourseTemplateRelationDAO courseTemplateRelationDAO;
    private CourseDAO courseDAO;
    private ExperimentTemplateDAO templateDAO;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public void setReportDAO(ExperimentReportDAO reportDAO) {
        this.reportDAO = reportDAO;
    }

    @Autowired
    public void setCourseUserRelationDAO(CourseUserRelationDAO courseUserRelationDAO) {
        this.courseUserRelationDAO = courseUserRelationDAO;
    }

    @Autowired
    public void setCourseTemplateRelationDAO(CourseTemplateRelationDAO courseTemplateRelationDAO) {
        this.courseTemplateRelationDAO = courseTemplateRelationDAO;
    }

    @Autowired
    public void setCourseDAO(CourseDAO courseDAO) {
        this.courseDAO = courseDAO;
    }

    @Autowired
    public void setTemplateDAO(ExperimentTemplateDAO templateDAO) {
        this.templateDAO = templateDAO;
    }

    /**
     * 新增报告
     * @param reportEntity 报告实体
     * @return 新增报告的ID
     */
    public String addReport(ExperimentReportEntity reportEntity) {
        return reportDAO.addReport(reportEntity);
    }

    /**
     * 删除报告
     * @param reportId 报告ID
     * @return 是否成功
     */
    public boolean deleteReport(String reportId) {
        return reportDAO.deleteReport(reportId);
    }

    /**
     * 修改报告
     * @param reportEntity 报告实体
     * @return 是否成功
     */
    public boolean updateReport(ExperimentReportEntity reportEntity) {
        return reportDAO.updateReport(reportEntity);
    }

    /**
     * 提交报告
     * @param reportId 报告ID
     * @return 是否成功
     */
    public boolean submitReport(String reportId) {
        return reportDAO.submitReport(reportId);
    }

    /**
     * 评分
     * @param reportId 报告ID
     * @param score 分数
     * @param comment 评语
     * @return 是否成功
     */
    public boolean gradeReport(String reportId, Integer score, String comment) {
        return reportDAO.gradeReport(reportId, score, comment);
    }

    /**
     * 根据ID获取报告
     * @param reportId 报告ID
     * @return 报告实体
     */
    public ExperimentReportEntity getReportById(String reportId) {
        return reportDAO.getReportById(reportId);
    }

    /**
     * 根据模板ID获取报告列表
     * @param templateId 模板ID
     * @return 报告列表
     */
    public List<ExperimentReportEntity> getReportsByTemplateId(String templateId) {
        return reportDAO.getReportsByTemplateId(templateId);
    }

    /**
     * 分页查询报告
     * @param current 当前页码
     * @param size 每页大小
     * @param studentId 学生ID
     * @return 分页结果
     */
    public PageDto<ExperimentReportEntity> getReportPage(Integer current, Integer size, String studentId) {
        return reportDAO.getReportPage(current, size, studentId);
    }

    /**
     * 导出报告为Markdown格式
     * @param reportId 报告ID
     * @return Markdown内容
     */
    public String exportToMarkdown(String reportId) {
        ExperimentReportEntity report = reportDAO.getReportById(reportId);
        if (report == null) {
            return "";
        }

        StringBuilder markdown = new StringBuilder();
        markdown.append("# ").append(report.getReportName()).append("\n\n");

        try {
            JsonNode content = objectMapper.readTree(report.getReportContent());
            JsonNode components = content.get("components");
            JsonNode inputData = content.get("inputData");

            if (components != null && components.isArray()) {
                for (int i = 0; i < components.size(); i++) {
                    JsonNode component = components.get(i);
                    String type = component.has("type") ? component.get("type").asText() : "";
                    JsonNode data = component.get("data");

                    switch (type) {
                        case "text":
                            if (data != null && data.has("content")) {
                                String textContent = data.get("content").asText();
                                if (!textContent.isEmpty()) {
                                    markdown.append(textContent).append("\n\n");
                                }
                            }
                            break;

                        case "table":
                            if (data != null) {
                                int rows = data.has("rows") ? data.get("rows").asInt() : 0;
                                int cols = data.has("cols") ? data.get("cols").asInt() : 0;

                                if (rows > 0 && cols > 0) {
                                    markdown.append("|");
                                    for (int j = 0; j < cols; j++) {
                                        markdown.append("   |");
                                    }
                                    markdown.append("\n|");
                                    for (int j = 0; j < cols; j++) {
                                        markdown.append("---|");
                                    }
                                    markdown.append("\n");

                                    // 如果有输入数据，则使用输入数据
                                    if (inputData != null && inputData.has(String.valueOf(i))) {
                                        JsonNode cellData = inputData.get(String.valueOf(i));
                                        for (int r = 0; r < rows; r++) {
                                            markdown.append("|");
                                            for (int c = 0; c < cols; c++) {
                                                String cellKey = "cell_" + r + "_" + c;
                                                String cellValue = "";
                                                if (cellData != null && cellData.has(cellKey)) {
                                                    cellValue = cellData.get(cellKey).asText();
                                                }
                                                markdown.append(" ").append(cellValue).append(" |");
                                            }
                                            markdown.append("\n");
                                        }
                                    } else {
                                        for (int r = 0; r < rows; r++) {
                                            markdown.append("|");
                                            for (int c = 0; c < cols; c++) {
                                                markdown.append("   |");
                                            }
                                            markdown.append("\n");
                                        }
                                    }
                                    markdown.append("\n");
                                }
                            }
                            break;

                        case "input":
                            if (data != null) {
                                String label = data.has("label") ? data.get("label").asText() : "";
                                String placeholder = data.has("placeholder") ? data.get("placeholder").asText() : "";

                                if (!label.isEmpty()) {
                                    markdown.append("### ").append(label).append("\n\n");
                                }
                                if (inputData != null && inputData.has(String.valueOf(i))) {
                                    JsonNode inputNode = inputData.get(String.valueOf(i));
                                    String inputText = inputNode != null && inputNode.has("value") ? 
                                        inputNode.get("value").asText() : "";
                                    if (!inputText.isEmpty()) {
                                        markdown.append(inputText).append("\n\n");
                                    }
                                } else {
                                    markdown.append("*").append(placeholder.isEmpty() ? "待填写" : placeholder).append("*\n\n");
                                }
                            }
                            break;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }

        return markdown.toString();
    }

    /**
     * 获取用户的实验报告概览
     * 包含待提交和已提交的报告
     * @param userId 用户ID
     * @return 报告概览列表
     */
    public List<ReportOverviewDto> getReportOverview(String userId) {
        return getReportOverviewByStatus(userId, null, null, null);
    }

    /**
     * 获取用户的实验报告概览（支持分页和状态过滤）
     * @param userId 用户ID
     * @param status 报告状态（可选）
     * @param current 当前页码（可选）
     * @param size 每页大小（可选）
     * @return 报告概览列表
     */
    public List<ReportOverviewDto> getReportOverviewByStatus(String userId, String status, Integer current, Integer size) {
        List<ReportOverviewDto> result = new ArrayList<>();

        // 1. 获取用户以学生身份参与的课堂ID列表
        List<String> courseIds = courseUserRelationDAO.getStudentCourseIdsByUserId(userId);
        if (courseIds.isEmpty()) {
            return result;
        }

        // 2. 获取课堂信息
        List<CourseEntity> courses = courseDAO.listByIds(courseIds);
        Map<String, CourseEntity> courseMap = courses.stream()
                .collect(Collectors.toMap(CourseEntity::getId, c -> c));

        // 3. 获取课堂-模板关联
        List<CourseTemplateRelationEntity> relations = courseTemplateRelationDAO.getByCourseIds(courseIds);

        // 按课堂分组模板ID
        Map<String, List<String>> courseTemplateMap = new HashMap<>();
        for (CourseTemplateRelationEntity relation : relations) {
            courseTemplateMap.computeIfAbsent(relation.getCourseId(), k -> new ArrayList<>())
                    .add(relation.getTemplateId());
        }

        // 收集所有模板ID
        List<String> allTemplateIds = relations.stream()
                .map(CourseTemplateRelationEntity::getTemplateId)
                .distinct()
                .collect(Collectors.toList());

        if (allTemplateIds.isEmpty()) {
            return result;
        }

        // 4. 获取模板信息
        List<ExperimentTemplateEntity> templates = templateDAO.listByIds(allTemplateIds);
        Map<String, ExperimentTemplateEntity> templateMap = templates.stream()
                .collect(Collectors.toMap(ExperimentTemplateEntity::getId, t -> t));

        // 5. 构建结果
        for (CourseTemplateRelationEntity relation : relations) {
            String courseId = relation.getCourseId();
            String templateId = relation.getTemplateId();

            CourseEntity course = courseMap.get(courseId);
            ExperimentTemplateEntity template = templateMap.get(templateId);
            ExperimentReportEntity report = reportDAO.getReportByStudentIdAndCourseIdAndTemplateId(userId, courseId, templateId);

            if (template == null) {
                continue;
            }

            ReportOverviewDto dto = new ReportOverviewDto();
            dto.setTemplateId(templateId);
            dto.setTemplateName(template.getTemplateName());
            dto.setTemplateDescription(template.getDescription());
            dto.setCourseId(courseId);
            dto.setCourseName(course != null ? course.getCourseName() : "");

            if (report != null) {
                dto.setReportId(report.getId());
                dto.setReportName(report.getReportName());
                dto.setSubmitTime(report.getSubmitTime());
                dto.setScore(report.getScore());
                dto.setComment(report.getComment());
                dto.setReportContent(report.getReportContent());

                // 使用数据库中的状态，如果状态为空则根据提交和评分情况推断
                if (report.getStatus() != null && !report.getStatus().isEmpty()) {
                    dto.setStatus(report.getStatus());
                } else if (report.getSubmitTime() != null) {
                    if (report.getScore() != null) {
                        dto.setStatus(ReportStatusEnum.GRADED.getCode());
                    } else {
                        dto.setStatus(ReportStatusEnum.SUBMITTED.getCode());
                    }
                } else {
                    // 有数据库记录但没有提交时间，说明是草稿
                    dto.setStatus(ReportStatusEnum.DRAFT.getCode());
                }
            } else {
                // 没有数据库记录，说明从未编辑过
                dto.setStatus(ReportStatusEnum.PENDING.getCode());
            }

            // 如果指定了状态，则只返回符合状态的记录
            if (status != null && !status.isEmpty() && !status.equals(dto.getStatus())) {
                continue;
            }

            result.add(dto);
        }

        // 按提交时间和更新时间降序排序
        result.sort((a, b) -> {
            Date timeA = a.getSubmitTime();
            Date timeB = b.getSubmitTime();
            if (timeA == null) timeA = new Date(0);
            if (timeB == null) timeB = new Date(0);
            return timeB.compareTo(timeA);
        });

        // 分页处理
        if (current != null && size != null && current > 0 && size > 0) {
            int fromIndex = (current - 1) * size;
            if (fromIndex >= result.size()) {
                return new ArrayList<>();
            }
            int toIndex = Math.min(fromIndex + size, result.size());
            return result.subList(fromIndex, toIndex);
        }

        return result;
    }

    /**
     * 获取用户的待提交报告列表
     * @param userId 用户ID
     * @return 待提交报告列表
     */
    public List<ReportOverviewDto> getPendingReports(String userId) {
        List<ReportOverviewDto> allReports = getReportOverview(userId);
        return allReports.stream()
                .filter(r -> "pending".equals(r.getStatus()) || "draft".equals(r.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * 获取用户的已提交报告列表
     * @param userId 用户ID
     * @return 已提交报告列表
     */
    public List<ReportOverviewDto> getSubmittedReports(String userId) {
        List<ReportOverviewDto> allReports = getReportOverview(userId);
        return allReports.stream()
                .filter(r -> "submitted".equals(r.getStatus()) || "graded".equals(r.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * 根据课程ID获取所有已提交的报告
     * @param courseId 课程ID
     * @return 报告列表
     */
    public List<ExperimentReportEntity> getReportsByCourseId(String courseId) {
        return reportDAO.getReportsByCourseId(courseId);
    }
}
