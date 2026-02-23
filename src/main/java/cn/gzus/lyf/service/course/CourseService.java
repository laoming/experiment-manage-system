package cn.gzus.lyf.service.course;

import cn.gzus.lyf.common.dto.CourseQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.dao.CourseDAO;
import cn.gzus.lyf.dao.CourseTemplateRelationDAO;
import cn.gzus.lyf.dao.CourseUserRelationDAO;
import cn.gzus.lyf.dao.entity.CourseEntity;
import cn.gzus.lyf.dao.entity.CourseUserRelationEntity;
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
     * 删除课程（只有创建者可以删除）
     * @param courseId 课程ID
     * @param operatorId 操作者ID
     * @return 是否成功
     * @throws RuntimeException 如果不是创建者
     */
    @Transactional
    public boolean deleteCourse(String courseId, String operatorId) {
        // 检查权限：只有创建者可以删除课程
        CourseEntity course = courseDAO.getCourseById(courseId);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }
        if (!course.getCreatorId().equals(operatorId)) {
            throw new RuntimeException("只有课程创建者可以删除课程");
        }

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
        // 如果指定了当前用户ID，根据用户类型查询相应的课程ID列表
        if (courseQueryDto.getCurrentUserId() != null && !courseQueryDto.getCurrentUserId().isEmpty()) {
            Integer userType = courseQueryDto.getUserType();
            
            if (userType != null && userType == CourseQueryDto.USER_TYPE_STUDENT) {
                // 学生类型：查询用户作为学生参与的课程
                List<String> studentCourseIds = courseUserRelationDAO.getStudentCourseIdsByUserId(courseQueryDto.getCurrentUserId());
                courseQueryDto.setStudentCourseIds(studentCourseIds);
            } else {
                // 管理者类型（默认）：查询用户作为管理者参与的课程
                List<String> adminCourseIds = courseUserRelationDAO.getAdminCourseIdsByUserId(courseQueryDto.getCurrentUserId());
                courseQueryDto.setAdminCourseIds(adminCourseIds);
            }
        }
        return courseDAO.getCoursePage(current, size, courseQueryDto);
    }

    /**
     * 为课程绑定用户（默认为学生）
     * @param courseId 课程ID
     * @param userIds 用户ID列表
     * @return 是否成功
     */
    public boolean bindUsers(String courseId, List<String> userIds) {
        return courseUserRelationDAO.bindUsers(courseId, userIds, CourseUserRelationEntity.USER_TYPE_STUDENT);
    }

    /**
     * 为课程绑定管理者
     * @param courseId 课程ID
     * @param userIds 用户ID列表
     * @return 是否成功
     */
    public boolean bindAdmins(String courseId, List<String> userIds) {
        return courseUserRelationDAO.bindUsers(courseId, userIds, CourseUserRelationEntity.USER_TYPE_ADMIN);
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
     * 获取课程的管理者ID列表
     * @param courseId 课程ID
     * @return 管理者ID列表
     */
    public List<String> getAdminIdsByCourseId(String courseId) {
        return courseUserRelationDAO.getAdminIdsByCourseId(courseId);
    }

    /**
     * 获取课程的学生ID列表
     * @param courseId 课程ID
     * @return 学生ID列表
     */
    public List<String> getStudentIdsByCourseId(String courseId) {
        return courseUserRelationDAO.getStudentIdsByCourseId(courseId);
    }

    /**
     * 检查用户是否是课程的管理者
     * @param courseId 课程ID
     * @param userId 用户ID
     * @return 是否是管理者
     */
    public boolean isAdmin(String courseId, String userId) {
        return courseUserRelationDAO.isAdmin(courseId, userId);
    }

    /**
     * 检查用户是否可以管理课程（创建者或管理者）
     * @param courseId 课程ID
     * @param userId 用户ID
     * @return 是否可以管理
     */
    public boolean canManage(String courseId, String userId) {
        CourseEntity course = courseDAO.getCourseById(courseId);
        if (course == null) {
            return false;
        }
        // 创建者可以管理
        if (course.getCreatorId().equals(userId)) {
            return true;
        }
        // 管理者可以管理
        return courseUserRelationDAO.isAdmin(courseId, userId);
    }

    /**
     * 检查用户是否是课程的创建者
     * @param courseId 课程ID
     * @param userId 用户ID
     * @return 是否是创建者
     */
    public boolean isCreator(String courseId, String userId) {
        CourseEntity course = courseDAO.getCourseById(courseId);
        if (course == null) {
            return false;
        }
        return course.getCreatorId().equals(userId);
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
