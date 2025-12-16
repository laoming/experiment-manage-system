package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.UserRoleRelationEntity;
import cn.gzus.lyf.dao.mapper.UserRoleRelationMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserRoleRelationDAO extends ServiceImpl<UserRoleRelationMapper, UserRoleRelationEntity> {

    /**
     * 根据用户id查询用户角色关系
     * @param userId
     * @return
     */
    public List<UserRoleRelationEntity> getUserRoleRelationsByUserId(String userId) {
        if (StringUtils.isBlank(userId)) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        return this.list(new LambdaQueryWrapper<UserRoleRelationEntity>()
                .eq(UserRoleRelationEntity::getUserId, userId));
    }

}
