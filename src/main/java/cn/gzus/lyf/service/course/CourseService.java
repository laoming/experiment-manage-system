package cn.gzus.lyf.service.course;

import cn.gzus.lyf.common.dto.CourseQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.dao.CourseDAO;
import cn.gzus.lyf.dao.CourseTemplateRelationDAO;
import cn.gzus.lyf.dao.CourseUserRelationDAO;
import cn.gzus.lyf.dao.entity.CourseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private CourseDAO courseDAO;

    private CourseUserRelationDAO courseUserRelationDAO;

    private CourseTemplateRelationDAO courseTemplateRelationDAO;

    @Autowired
    public void setCourseDAO(CourseDAO courseDAO) {
        this.courseDAO = courseDAO;
    }

    @Autowired
    public void setCourseUserRelationDAO(CourseUserRelationDAO courseUserRelationDAO) {
        this.courseUserRelationDAO = courseUserRelationDAO;
    }

    @Autowired
    public void setCourseTemplateRelationDAO(CourseTemplateRelationDAO courseTemplateRelationDAO) {
        this.courseTemplateRelationDAO = courseTemplateRelationDAO;
    }

    /**
     * 新增课程
     * @param courseEntity 课程实体
     * @return 是否成功
     */
    public boolean addCourse(CourseEntity courseEntity) {
        return courseDAO.addCourse(courseEntity);
    }

    /**
     * 删除课程
     * @param courseId 课程ID
     * @return 是否成功
     */
    @Transactional
    public boolean deleteCourse(String courseId) {
        // 删除课程绑定的用户
        List<String> userIds = courseUserRelationDAO.getUserIdsByCourseId(courseId);
        if (!userIds.isEmpty()) {
            courseUserRelationDAO.unbindUsers(courseId, userIds);
        }

        // 删除课程绑定的实验模板
        List<String> templateIds = courseTemplateRelationDAO.getTemplateIdsByCourseId(courseId);
        if (!templateIds.isEmpty()) {
            courseTemplateRelationDAO.unbindTemplates(courseId, templateIds);
        }

        // 删除课程
        return courseDAO.deleteCourse(courseId);
    }

    /**
     * 修改课程
     * @param courseEntity 课程实体
     * @return 是否成功
     */
    public boolean updateCourse(CourseEntity courseEntity) {
        return courseDAO.updateCourse(courseEntity);
    }

    /**
     * 根据ID获取课程
     * @param courseId 课程ID
     * @return 课程实体
     */
    public CourseEntity getCourseById(String courseId) {
        return courseDAO.getCourseById(courseId);
    }

    /**
     * 分页查询课程
     * @param current 当前页码
     * @param size 每页大小
     * @param courseQueryDto 查询条件
     * @return 分页结果
     */
    public PageDto<CourseEntity> getCoursePage(Integer current, Integer size, CourseQueryDto courseQueryDto) {
        return courseDAO.getCoursePage(current, size, courseQueryDto);
    }

    /**
     * 为课程绑定用户
     * @param courseId 课程ID
     * @param userIds 用户ID列表
     * @return 是否成功
     */
    public boolean bindUsers(String courseId, List<String> userIds) {
        return courseUserRelationDAO.bindUsers(courseId, userIds);
    }

    /**
     * 解除课程绑定的用户
     * @param courseId 课程ID
     * @param userIds 用户ID列表
     * @return 是否成功
     */
    public boolean unbindUsers(String courseId, List<String> userIds) {
        return courseUserRelationDAO.unbindUsers(courseId, userIds);
    }

    /**
     * 获取课程绑定的用户ID列表
     * @param courseId 课程ID
     * @return 用户ID列表
     */
    public List<String> getUserIdsByCourseId(String courseId) {
        return courseUserRelationDAO.getUserIdsByCourseId(courseId);
    }

    /**
     * 为课程绑定实验模板
     * @param courseId 课程ID
     * @param templateIds 实验模板ID列表
     * @return 是否成功
     */
    public boolean bindTemplates(String courseId, List<String> templateIds) {
        return courseTemplateRelationDAO.bindTemplates(courseId, templateIds);
    }

    /**
     * 解除课程绑定的实验模板
     * @param courseId 课程ID
     * @param templateIds 实验模板ID列表
     * @return 是否成功
     */
    public boolean unbindTemplates(String courseId, List<String> templateIds) {
        return courseTemplateRelationDAO.unbindTemplates(courseId, templateIds);
    }

    /**
     * 获取课程绑定的实验模板ID列表
     * @param courseId 课程ID
     * @return 实验模板ID列表
     */
    public List<String> getTemplateIdsByCourseId(String courseId) {
        return courseTemplateRelationDAO.getTemplateIdsByCourseId(courseId);
    }
}
