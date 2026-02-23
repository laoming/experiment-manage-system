package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.CourseUserRelationEntity;
import cn.gzus.lyf.dao.mapper.CourseUserRelationMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class CourseUserRelationDAO extends ServiceImpl<CourseUserRelationMapper, CourseUserRelationEntity> {

    /**
     * 为课程绑定用户（默认为普通用户）
     * @param courseId 课程ID
     * @param userIds 用户ID列表
     * @return 是否成功
     */
    public boolean bindUsers(String courseId, List<String> userIds) {
        return bindUsers(courseId, userIds, CourseUserRelationEntity.USER_TYPE_STUDENT);
    }

    /**
     * 为课程绑定用户
     * @param courseId 课程ID
     * @param userIds 用户ID列表
     * @param userType 用户类型
     * @return 是否成功
     */
    public boolean bindUsers(String courseId, List<String> userIds, int userType) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        Objects.requireNonNull(userIds, "用户ID列表不能为空");

        for (String userId : userIds) {
            // 检查是否已存在绑定关系
            CourseUserRelationEntity existing = this.getOne(Wrappers.<CourseUserRelationEntity>lambdaQuery()
                    .eq(CourseUserRelationEntity::getCourseId, courseId)
                    .eq(CourseUserRelationEntity::getUserId, userId));
            
            if (existing != null) {
                // 更新用户类型
                existing.setUserType(userType);
                this.updateById(existing);
            } else {
                // 新建绑定关系
                CourseUserRelationEntity relation = new CourseUserRelationEntity();
                relation.setId(java.util.UUID.randomUUID().toString());
                relation.setCourseId(courseId);
                relation.setUserId(userId);
                relation.setUserType(userType);
                this.save(relation);
            }
        }
        return true;
    }

    /**
     * 解除课程绑定的用户
     * @param courseId 课程ID
     * @param userIds 用户ID列表
     * @return 是否成功
     */
    public boolean unbindUsers(String courseId, List<String> userIds) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        Objects.requireNonNull(userIds, "用户ID列表不能为空");

        for (String userId : userIds) {
            this.remove(Wrappers.<CourseUserRelationEntity>lambdaQuery()
                    .eq(CourseUserRelationEntity::getCourseId, courseId)
                    .eq(CourseUserRelationEntity::getUserId, userId));
        }
        return true;
    }

    /**
     * 获取课程绑定的用户ID列表
     * @param courseId 课程ID
     * @return 用户ID列表
     */
    public List<String> getUserIdsByCourseId(String courseId) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        return this.list(Wrappers.<CourseUserRelationEntity>lambdaQuery()
                .select(CourseUserRelationEntity::getUserId)
                .eq(CourseUserRelationEntity::getCourseId, courseId))
                .stream()
                .map(CourseUserRelationEntity::getUserId)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 获取课程指定类型的用户ID列表
     * @param courseId 课程ID
     * @param userType 用户类型
     * @return 用户ID列表
     */
    public List<String> getUserIdsByCourseIdAndType(String courseId, int userType) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        return this.list(Wrappers.<CourseUserRelationEntity>lambdaQuery()
                .select(CourseUserRelationEntity::getUserId)
                .eq(CourseUserRelationEntity::getCourseId, courseId)
                .eq(CourseUserRelationEntity::getUserType, userType))
                .stream()
                .map(CourseUserRelationEntity::getUserId)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 获取用户作为管理者参与的课程ID列表
     * @param userId 用户ID
     * @return 课程ID列表
     */
    public List<String> getAdminCourseIdsByUserId(String userId) {
        Objects.requireNonNull(userId, "用户ID不能为空");
        return this.list(Wrappers.<CourseUserRelationEntity>lambdaQuery()
                .select(CourseUserRelationEntity::getCourseId)
                .eq(CourseUserRelationEntity::getUserId, userId)
                .eq(CourseUserRelationEntity::getUserType, CourseUserRelationEntity.USER_TYPE_ADMIN))
                .stream()
                .map(CourseUserRelationEntity::getCourseId)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 检查用户是否是课程的管理者
     * @param courseId 课程ID
     * @param userId 用户ID
     * @return 是否是管理者
     */
    public boolean isAdmin(String courseId, String userId) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        Objects.requireNonNull(userId, "用户ID不能为空");
        
        return this.count(Wrappers.<CourseUserRelationEntity>lambdaQuery()
                .eq(CourseUserRelationEntity::getCourseId, courseId)
                .eq(CourseUserRelationEntity::getUserId, userId)
                .eq(CourseUserRelationEntity::getUserType, CourseUserRelationEntity.USER_TYPE_ADMIN)) > 0;
    }

    /**
     * 获取课程的管理者ID列表
     * @param courseId 课程ID
     * @return 管理者ID列表
     */
    public List<String> getAdminIdsByCourseId(String courseId) {
        return getUserIdsByCourseIdAndType(courseId, CourseUserRelationEntity.USER_TYPE_ADMIN);
    }

    /**
     * 获取课程的学生ID列表
     * @param courseId 课程ID
     * @return 学生ID列表
     */
    public List<String> getStudentIdsByCourseId(String courseId) {
        return getUserIdsByCourseIdAndType(courseId, CourseUserRelationEntity.USER_TYPE_STUDENT);
    }

    /**
     * 获取用户作为学生参与的课程ID列表
     * @param userId 用户ID
     * @return 课程ID列表
     */
    public List<String> getStudentCourseIdsByUserId(String userId) {
        Objects.requireNonNull(userId, "用户ID不能为空");
        return this.list(Wrappers.<CourseUserRelationEntity>lambdaQuery()
                .select(CourseUserRelationEntity::getCourseId)
                .eq(CourseUserRelationEntity::getUserId, userId)
                .eq(CourseUserRelationEntity::getUserType, CourseUserRelationEntity.USER_TYPE_STUDENT))
                .stream()
                .map(CourseUserRelationEntity::getCourseId)
                .collect(java.util.stream.Collectors.toList());
    }
}
