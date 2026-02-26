package cn.gzus.lyf.controller.experiment;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.ReportOverviewDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.UserDto;
import cn.gzus.lyf.dao.entity.ExperimentReportEntity;
import cn.gzus.lyf.service.experiment.ExperimentReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 实验报告管理
 */
@RestController
@RequestMapping("/experimentReport")
public class ExperimentReportController {

    private ExperimentReportService reportService;

    @Autowired
    public void setReportService(ExperimentReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * 获取当前用户ID
     * @return 用户ID
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDto) {
            return ((UserDto) principal).getId();
        }
        return null;
    }

    /**
     * 分页查询报告
     */
    @PostMapping("/page")
    public Result<PageDto<ExperimentReportEntity>> getReportPage(int current, int size, String studentId) {
        return Result.success(reportService.getReportPage(current, size, studentId));
    }

    /**
     * 根据ID获取报告
     */
    @PostMapping("/get")
    public Result<ExperimentReportEntity> getReportById(String reportId) {
        return Result.success(reportService.getReportById(reportId));
    }

    /**
     * 根据模板ID获取报告列表
     */
    @PostMapping("/list")
    public Result<List<ExperimentReportEntity>> getReportsByTemplateId(String templateId) {
        return Result.success(reportService.getReportsByTemplateId(templateId));
    }

    /**
     * 新增报告
     */
    @PostMapping("/add")
    public Result<Boolean> addReport(@RequestBody ExperimentReportEntity reportEntity) {
        return Result.success(reportService.addReport(reportEntity));
    }

    /**
     * 更新报告
     */
    @PostMapping("/update")
    public Result<Boolean> updateReport(@RequestBody ExperimentReportEntity reportEntity) {
        return Result.success(reportService.updateReport(reportEntity));
    }

    /**
     * 删除报告
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteReport(@RequestBody ExperimentReportEntity reportEntity) {
        return Result.success(reportService.deleteReport(reportEntity.getId()));
    }

    /**
     * 提交报告
     */
    @PostMapping("/submit")
    public Result<Boolean> submitReport(@RequestBody ExperimentReportEntity reportEntity) {
        return Result.success(reportService.submitReport(reportEntity.getId()));
    }

    /**
     * 评分
     */
    @PostMapping("/grade")
    public Result<Boolean> gradeReport(String reportId, Integer score, String comment) {
        return Result.success(reportService.gradeReport(reportId, score, comment));
    }

    /**
     * 导出报告为Markdown
     */
    @PostMapping("/exportMarkdown")
    public ResponseEntity<String> exportMarkdown(String reportId) {
        String markdown = reportService.exportToMarkdown(reportId);
        
        if (markdown == null || markdown.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ExperimentReportEntity report = reportService.getReportById(reportId);
        String filename = (report != null ? report.getReportName() : "实验报告") + ".md";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_MARKDOWN);
        headers.setContentDispositionFormData("attachment", filename);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(markdown);
    }

    /**
     * 获取当前用户的报告概览
     */
    @PostMapping("/overview")
    public Result<List<ReportOverviewDto>> getReportOverview() {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        return Result.success(reportService.getReportOverview(userId));
    }

    /**
     * 获取当前用户的待提交报告列表
     */
    @PostMapping("/pending")
    public Result<List<ReportOverviewDto>> getPendingReports() {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        return Result.success(reportService.getPendingReports(userId));
    }

    /**
     * 获取当前用户的已提交报告列表
     */
    @PostMapping("/submitted")
    public Result<List<ReportOverviewDto>> getSubmittedReports() {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        return Result.success(reportService.getSubmittedReports(userId));
    }
}
