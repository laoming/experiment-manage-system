package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.UserEntity;
import cn.gzus.lyf.dao.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

@Service
public class UserDAO extends ServiceImpl<UserMapper, UserEntity> {

    /**
     * 根据用户名获取用户信息
     * @param userName
     * @return
     */
    public UserEntity getUserByName(String userName) {
        if (StringUtils.isBlank(userName)) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        return this.getOne(new LambdaQueryWrapper<UserEntity>()
                .eq(UserEntity::getUsername, userName));
    }
}
