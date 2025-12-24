package cn.gzus.lyf.dao;

import cn.gzus.lyf.constant.UserStatusEnum;
import cn.gzus.lyf.dao.entity.UserEntity;
import cn.gzus.lyf.dao.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserDAO extends ServiceImpl<UserMapper, UserEntity> {

    /**
     * 根据用户名获取用户信息
     * @param userName
     * @return
     */
    public UserEntity getUserByName(String userName) {
        Objects.requireNonNull(userName, "用户名不能为空");
        return this.getOne(new LambdaQueryWrapper<UserEntity>()
                .eq(UserEntity::getUsername, userName));
    }

    /**
     * 新增用户
     * @param userEntity
     * @return
     */
    public boolean addUser(UserEntity userEntity) {
        Objects.requireNonNull(userEntity, "用户实体不能为空");
        Objects.requireNonNull(userEntity.getUsername(), "用户名不能为空");
        Objects.requireNonNull(userEntity.getPassword(), "用户密码不能为空");

        userEntity.setStatus(UserStatusEnum.ACTIVE.getCode());
        return this.save(userEntity);
    }
}
