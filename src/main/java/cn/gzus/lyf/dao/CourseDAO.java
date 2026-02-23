package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.dto.CourseQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.CourseEntity;
import cn.gzus.lyf.dao.mapper.CourseMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class CourseDAO extends ServiceImpl<CourseMapper, CourseEntity> {

    /**
     * 新增课程
     * @param courseEntity 课程实体
     * @return 是否成功
     */
    public boolean addCourse(CourseEntity courseEntity) {
        Objects.requireNonNull(courseEntity, "课程实体不能为空");
        Objects.requireNonNull(courseEntity.getCourseName(), "课程名称不能为空");
        Objects.requireNonNull(courseEntity.getCreatorId(), "创建者ID不能为空");

        courseEntity.setCreateTime(new Date());
        courseEntity.setUpdateTime(new Date());
        return this.save(courseEntity);
    }

    /**
     * 删除课程
     * @param courseId 课程ID
     * @return 是否成功
     */
    public boolean deleteCourse(String courseId) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        return this.removeById(courseId);
    }

    /**
     * 修改课程
     * @param courseEntity 课程实体
     * @return 是否成功
     */
    public boolean updateCourse(CourseEntity courseEntity) {
        Objects.requireNonNull(courseEntity, "课程实体不能为空");
        Objects.requireNonNull(courseEntity.getId(), "课程ID不能为空");

        courseEntity.setUpdateTime(new Date());
        return this.updateById(courseEntity);
    }

    /**
     * 根据ID获取课程
     * @param courseId 课程ID
     * @return 课程实体
     */
    public CourseEntity getCourseById(String courseId) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        return this.getById(courseId);
    }

    /**
     * 分页查询课程
     * @param current 当前页码
     * @param size 每页大小
     * @param courseQueryDto 查询条件
     * @return 分页结果
     */
    public PageDto<CourseEntity> getCoursePage(Integer current, Integer size, CourseQueryDto courseQueryDto) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        LambdaQueryWrapper<CourseEntity> queryWrapper = Wrappers.<CourseEntity>lambdaQuery()
                .like(StringUtils.isNotEmpty(courseQueryDto.getCourseName()), CourseEntity::getCourseName, courseQueryDto.getCourseName())
                .orderByDesc(CourseEntity::getUpdateTime);

        // 如果指定了创建者ID，按创建者查询
        if (StringUtils.isNotEmpty(courseQueryDto.getCreatorId())) {
            queryWrapper.eq(CourseEntity::getCreatorId, courseQueryDto.getCreatorId());
        }
        // 如果指定了当前用户ID，根据用户类型查询
        else if (StringUtils.isNotEmpty(courseQueryDto.getCurrentUserId())) {
            Integer userType = courseQueryDto.getUserType();
            
            // 根据用户类型选择不同的查询逻辑
            if (userType != null && userType == CourseQueryDto.USER_TYPE_STUDENT) {
                // 学生类型：查询用户作为学生参与的课程
                List<String> studentCourseIds = courseQueryDto.getStudentCourseIds();
                if (studentCourseIds != null && !studentCourseIds.isEmpty()) {
                    queryWrapper.in(CourseEntity::getId, studentCourseIds);
                } else {
                    // 没有参与的课程，返回空结果
                    queryWrapper.eq(CourseEntity::getId, "");
                }
            } else {
                // 管理者类型（默认）：查询创建者是当前用户，或者当前用户是管理者的课程
                List<String> adminCourseIds = courseQueryDto.getAdminCourseIds();
                if (adminCourseIds != null && !adminCourseIds.isEmpty()) {
                    queryWrapper.and(wrapper -> wrapper
                            .eq(CourseEntity::getCreatorId, courseQueryDto.getCurrentUserId())
                            .or()
                            .in(CourseEntity::getId, adminCourseIds)
                    );
                } else {
                    // 没有管理的课程，只查询创建者是当前用户的课程
                    queryWrapper.eq(CourseEntity::getCreatorId, courseQueryDto.getCurrentUserId());
                }
            }
        }

        IPage<CourseEntity> coursePage = this.page(new Page<>(current, size), queryWrapper);
        return BeanCopyUtils.copy(coursePage, PageDto.class);
    }
}
