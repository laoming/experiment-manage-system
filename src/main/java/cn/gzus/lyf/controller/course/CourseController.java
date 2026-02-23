package cn.gzus.lyf.controller.course;

import cn.gzus.lyf.common.dto.CourseQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.UserDto;
import cn.gzus.lyf.dao.entity.CourseEntity;
import cn.gzus.lyf.service.course.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 课程管理
 */
@RestController
@RequestMapping("/course")
public class CourseController {

    private CourseService courseService;

    @Autowired
    public void setCourseService(CourseService courseService) {
        this.courseService = courseService;
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
     * 分页查询课程（当前用户创建或参与管理的课程）
     * @param current 当前页码
     * @param size 每页大小
     * @param userType 用户类型：1-管理者，2-学生（可选，默认为管理者）
     * @param queryDto 查询条件
     * @return 分页结果
     */
    @PostMapping("/page")
    public Result<PageDto<CourseEntity>> getCoursePage(
            @RequestParam int current,
            @RequestParam int size,
            @RequestParam(required = false) Integer userType,
            @RequestBody CourseQueryDto queryDto) {
        // 设置当前用户ID，用于查询当前用户可见的课程
        String currentUserId = getCurrentUserId();
        queryDto.setCurrentUserId(currentUserId);
        // 设置用户类型，默认为管理者
        if (userType == null) {
            userType = CourseQueryDto.USER_TYPE_ADMIN;
        }
        queryDto.setUserType(userType);
        return Result.success(courseService.getCoursePage(current, size, queryDto));
    }

    /**
     * 根据ID获取课程
     */
    @PostMapping("/get")
    public Result<CourseEntity> getCourseById(@RequestParam String courseId) {
        return Result.success(courseService.getCourseById(courseId));
    }

    /**
     * 新增课程
     */
    @PostMapping("/add")
    public Result<Boolean> addCourse(@RequestBody CourseEntity courseEntity) {
        // 设置创建者为当前用户
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("未登录");
        }
        courseEntity.setCreatorId(currentUserId);
        return Result.success(courseService.addCourse(courseEntity));
    }

    /**
     * 更新课程
     */
    @PostMapping("/update")
    public Result<Boolean> updateCourse(@RequestBody CourseEntity courseEntity) {
        // 检查权限：只有创建者或管理者可以更新课程
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("未登录");
        }
        if (!courseService.canManage(courseEntity.getId(), currentUserId)) {
            return Result.error("无权限修改此课程");
        }
        return Result.success(courseService.updateCourse(courseEntity));
    }

    /**
     * 删除课程（只有创建者可以删除）
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteCourse(@RequestBody CourseEntity courseEntity) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("未登录");
        }
        try {
            return Result.success(courseService.deleteCourse(courseEntity.getId(), currentUserId));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 为课程绑定用户（学生）
     */
    @PostMapping("/bindUsers")
    public Result<Boolean> bindUsers(@RequestBody Map<String, Object> params) {
        String courseId = (String) params.get("courseId");
        @SuppressWarnings("unchecked")
        List<String> userIds = (List<String>) params.get("userIds");
        return Result.success(courseService.bindUsers(courseId, userIds));
    }

    /**
     * 为课程绑定管理者
     */
    @PostMapping("/bindAdmins")
    public Result<Boolean> bindAdmins(@RequestBody Map<String, Object> params) {
        String courseId = (String) params.get("courseId");
        @SuppressWarnings("unchecked")
        List<String> userIds = (List<String>) params.get("userIds");
        return Result.success(courseService.bindAdmins(courseId, userIds));
    }

    /**
     * 解除课程绑定的用户
     */
    @PostMapping("/unbindUsers")
    public Result<Boolean> unbindUsers(@RequestBody Map<String, Object> params) {
        String courseId = (String) params.get("courseId");
        @SuppressWarnings("unchecked")
        List<String> userIds = (List<String>) params.get("userIds");
        return Result.success(courseService.unbindUsers(courseId, userIds));
    }

    /**
     * 获取课程绑定的用户ID列表
     */
    @PostMapping("/getUserIds")
    public Result<List<String>> getUserIdsByCourseId(@RequestParam String courseId) {
        return Result.success(courseService.getUserIdsByCourseId(courseId));
    }

    /**
     * 获取课程的管理者ID列表
     */
    @PostMapping("/getAdminIds")
    public Result<List<String>> getAdminIdsByCourseId(@RequestParam String courseId) {
        return Result.success(courseService.getAdminIdsByCourseId(courseId));
    }

    /**
     * 获取课程的学生ID列表
     */
    @PostMapping("/getStudentIds")
    public Result<List<String>> getStudentIdsByCourseId(@RequestParam String courseId) {
        return Result.success(courseService.getStudentIdsByCourseId(courseId));
    }

    /**
     * 检查当前用户是否可以管理课程
     */
    @PostMapping("/canManage")
    public Result<Boolean> canManage(@RequestParam String courseId) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return Result.success(false);
        }
        return Result.success(courseService.canManage(courseId, currentUserId));
    }

    /**
     * 检查当前用户是否是课程的创建者
     */
    @PostMapping("/isCreator")
    public Result<Boolean> isCreator(@RequestParam String courseId) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return Result.success(false);
        }
        return Result.success(courseService.isCreator(courseId, currentUserId));
    }

    /**
     * 为课程绑定实验模板
     */
    @PostMapping("/bindTemplates")
    public Result<Boolean> bindTemplates(@RequestBody Map<String, Object> params) {
        String courseId = (String) params.get("courseId");
        @SuppressWarnings("unchecked")
        List<String> templateIds = (List<String>) params.get("templateIds");
        return Result.success(courseService.bindTemplates(courseId, templateIds));
    }

    /**
     * 解除课程绑定的实验模板
     */
    @PostMapping("/unbindTemplates")
    public Result<Boolean> unbindTemplates(@RequestBody Map<String, Object> params) {
        String courseId = (String) params.get("courseId");
        @SuppressWarnings("unchecked")
        List<String> templateIds = (List<String>) params.get("templateIds");
        return Result.success(courseService.unbindTemplates(courseId, templateIds));
    }

    /**
     * 获取课程绑定的实验模板ID列表
     */
    @PostMapping("/getTemplateIds")
    public Result<List<String>> getTemplateIdsByCourseId(@RequestParam String courseId) {
        return Result.success(courseService.getTemplateIdsByCourseId(courseId));
    }
}
