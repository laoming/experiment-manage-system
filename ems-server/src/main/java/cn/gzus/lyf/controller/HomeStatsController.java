package cn.gzus.lyf.controller;

import cn.gzus.lyf.common.dto.HomeStatsDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.UserDto;
import cn.gzus.lyf.dao.entity.CourseEntity;
import cn.gzus.lyf.dao.entity.ExperimentReportEntity;
import cn.gzus.lyf.dao.entity.ExperimentTemplateEntity;
import cn.gzus.lyf.dao.entity.RoleEntity;
import cn.gzus.lyf.service.auth.RoleService;
import cn.gzus.lyf.service.course.CourseService;
import cn.gzus.lyf.service.experiment.ExperimentReportService;
import cn.gzus.lyf.service.experiment.ExperimentTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 首页统计 Controller
 */
@RestController
@RequestMapping("/homeStats")
public class HomeStatsController {

    private CourseService courseService;

    private ExperimentTemplateService templateService;

    private ExperimentReportService reportService;

    private RoleService roleService;

    @Autowired
    public void setCourseService(CourseService courseService) {
        this.courseService = courseService;
    }

    @Autowired
    public void setTemplateService(ExperimentTemplateService templateService) {
        this.templateService = templateService;
    }

    @Autowired
    public void setReportService(ExperimentReportService reportService) {
        this.reportService = reportService;
    }

    @Autowired
    public void setRoleService(RoleService roleService) {
        this.roleService = roleService;
    }

    /**
     * 获取当前登录用户ID
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
     * 获取当前登录用户的角色编码
     * @return 角色编码
     */
    private String getCurrentUserRoleCode() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDto) {
            UserDto userDto = (UserDto) principal;
            String roleId = userDto.getRoleId();
            if (roleId != null && !roleId.isEmpty()) {
                RoleEntity role = roleService.getRolesByIds(java.util.Collections.singletonList(roleId))
                        .stream()
                        .findFirst()
                        .orElse(null);
                if (role != null) {
                    return role.getRoleCode();
                }
            }
        }
        return null;
    }

    /**
     * 获取首页统计数据
     * @return 统计数据
     */
    @PostMapping("/getStats")
    public Result<HomeStatsDto> getStats() {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }

        String roleCode = getCurrentUserRoleCode();
        if (roleCode == null) {
            return Result.error("无法获取用户角色");
        }

        HomeStatsDto stats = new HomeStatsDto();
        stats.setRoleCode(roleCode);
        
        // 将角色编码转为大写进行比较
        String roleCodeUpper = roleCode.toUpperCase();

        if ("TEACHER".equals(roleCodeUpper) || "ADMIN".equals(roleCodeUpper)) {
            // 老师和管理员统计
            // 获取用户管理的所有课程（创建的课程 + 作为管理者参与的课程）
            List<String> courseIds = courseService.getManagedCourseIds(userId);
            stats.setManagedCourseCount(courseIds != null ? courseIds.size() : 0);
            stats.setMaintainedTemplateCount((int) templateService.getTemplateCountByCreator(userId));
            System.out.println("DEBUG: 管理的课程ID列表: " + courseIds);

            // 统计已评分和待评分的报告
            int gradedCount = 0;
            int pendingGradeCount = 0;
            
            if (courseIds != null && !courseIds.isEmpty()) {
                for (String courseId : courseIds) {
                    List<ExperimentReportEntity> reports = reportService.getReportsByCourseId(courseId);
                    System.out.println("DEBUG: 课程 " + courseId + " 的报告数: " + (reports != null ? reports.size() : 0));
                    
                    if (reports != null) {
                        for (ExperimentReportEntity report : reports) {
                            String status = report.getStatus();
                            // 已评分（graded状态）
                            if ("graded".equalsIgnoreCase(status)) {
                                gradedCount++;
                            } 
                            // 待评分（submitted状态）
                            else if ("submitted".equalsIgnoreCase(status)) {
                                pendingGradeCount++;
                            }
                        }
                    }
                }
            }
            
            stats.setGradedReportCount(gradedCount);
            stats.setPendingGradeReportCount(pendingGradeCount);
            System.out.println("DEBUG: 已评分报告数: " + gradedCount + ", 待评分报告数: " + pendingGradeCount);

        } else if ("STUDENT".equals(roleCodeUpper)) {
            // 学生统计
            List<String> courseIds = courseService.getCourseIdsByStudent(userId);
            stats.setEnrolledCourseCount(courseIds != null ? courseIds.size() : 0);
            System.out.println("DEBUG: 学生课程ID列表: " + courseIds);

            // 统计学生所有课程的所有实验模板数（即所有应提交的报告总数）
            int totalTemplateCount = 0;
            
            if (courseIds != null && !courseIds.isEmpty()) {
                for (String courseId : courseIds) {
                    List<String> templateIds = courseService.getTemplateIdsByCourseId(courseId);
                    totalTemplateCount += templateIds != null ? templateIds.size() : 0;
                }
            }
            
            stats.setTotalTemplateCount(totalTemplateCount);
            System.out.println("DEBUG: 课程所有报告总和: " + totalTemplateCount);

            // 统计已提交的报告
            int submittedCount = 0;
            
            if (courseIds != null && !courseIds.isEmpty()) {
                for (String courseId : courseIds) {
                    List<String> templateIds = courseService.getTemplateIdsByCourseId(courseId);
                    
                    if (templateIds != null && !templateIds.isEmpty()) {
                        for (String templateId : templateIds) {
                            List<ExperimentReportEntity> reports = reportService.getReportsByTemplateId(templateId);
                            
                            if (reports != null) {
                                for (ExperimentReportEntity report : reports) {
                                    if (userId.equals(report.getStudentId())) {
                                        String status = report.getStatus();
                                        // 已提交（包含已提交和已评价）
                                        if ("submitted".equalsIgnoreCase(status) || "graded".equalsIgnoreCase(status)) {
                                            submittedCount++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            stats.setSubmittedReportCount(submittedCount);
            
            // 待提交数 = 课程所有报告总和 - 已提交数
            int pendingSubmitCount = totalTemplateCount - submittedCount;
            stats.setPendingSubmitReportCount(pendingSubmitCount);
            System.out.println("DEBUG: 已提交报告数: " + submittedCount + ", 待提交报告数: " + pendingSubmitCount);
        }

        return Result.success(stats);
    }
}
