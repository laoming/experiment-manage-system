package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.CourseUserRelationEntity;
import cn.gzus.lyf.dao.mapper.CourseUserRelationMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class CourseUserRelationDAO extends ServiceImpl<CourseUserRelationMapper, CourseUserRelationEntity> {

    /**
     * 为课程绑定用户
     * @param courseId 课程ID
     * @param userIds 用户ID列表
     * @return 是否成功
     */
    public boolean bindUsers(String courseId, List<String> userIds) {
        Objects.requireNonNull(courseId, "课程ID不能为空");
        Objects.requireNonNull(userIds, "用户ID列表不能为空");

        for (String userId : userIds) {
            CourseUserRelationEntity relation = new CourseUserRelationEntity();
            relation.setId(java.util.UUID.randomUUID().toString());
            relation.setCourseId(courseId);
            relation.setUserId(userId);
            this.save(relation);
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
}
