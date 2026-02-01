package cn.gzus.lyf.controller.course;

import cn.gzus.lyf.common.dto.CourseQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.dao.entity.CourseEntity;
import cn.gzus.lyf.service.course.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
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
     * 分页查询课程
     */
    @PostMapping("/page")
    public Result<PageDto<CourseEntity>> getCoursePage(
            @RequestParam int current,
            @RequestParam int size,
            @RequestBody CourseQueryDto queryDto) {
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
        return Result.success(courseService.addCourse(courseEntity));
    }

    /**
     * 更新课程
     */
    @PostMapping("/update")
    public Result<Boolean> updateCourse(@RequestBody CourseEntity courseEntity) {
        return Result.success(courseService.updateCourse(courseEntity));
    }

    /**
     * 删除课程
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteCourse(@RequestBody CourseEntity courseEntity) {
        return Result.success(courseService.deleteCourse(courseEntity.getId()));
    }

    /**
     * 为课程绑定用户
     */
    @PostMapping("/bindUsers")
    public Result<Boolean> bindUsers(@RequestBody Map<String, Object> params) {
        String courseId = (String) params.get("courseId");
        @SuppressWarnings("unchecked")
        List<String> userIds = (List<String>) params.get("userIds");
        return Result.success(courseService.bindUsers(courseId, userIds));
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
