package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.constant.UserStatusEnum;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.UserQueryDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.UserEntity;
import cn.gzus.lyf.dao.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Date;
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
        Objects.requireNonNull(userEntity.getUsername(), "用户名（账号）不能为空");
        Objects.requireNonNull(userEntity.getPassword(), "用户密码不能为空");
        Objects.requireNonNull(userEntity.getDisplayName(), "用户显示名称不能为空");
        Objects.requireNonNull(userEntity.getRoleId(), "用户角色不能为空");
        Objects.requireNonNull(userEntity.getOrgId(), "用户组织不能为空");

        userEntity.setStatus(UserStatusEnum.ACTIVE.getCode());
        return this.save(userEntity);
    }

    /**
     * 删除用户（硬删除）
     * @param userId 用户ID
     * @return
     */
    public boolean deleteUser(String userId) {
        Objects.requireNonNull(userId, "用户ID不能为空");
        return this.removeById(userId);
    }

    /**
     * 修改用户信息
     * @param userEntity 用户实体，id必填
     * @return
     */
    public boolean updateUser(UserEntity userEntity) {
        Objects.requireNonNull(userEntity, "用户实体不能为空");
        Objects.requireNonNull(userEntity.getId(), "用户ID不能为空");

        userEntity.setUpdateTime(new Date());
        return this.updateById(userEntity);
    }

    /**
     * 根据条件分页查询用户信息
     * @param current 当前页码
     * @param size 每页大小
     * @param userQueryDto 用户查询条件
     * @return 分页结果
     */
    public PageDto<UserEntity> getUserPage(Integer current, Integer size, UserQueryDto userQueryDto) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        IPage<UserEntity> userEntityIPage = this.page(new Page<>(current, size), Wrappers.<UserEntity>lambdaQuery()
                .eq(StringUtils.isNotEmpty(userQueryDto.getUsername()), UserEntity::getUsername, userQueryDto.getUsername())
                .eq(StringUtils.isNotEmpty(userQueryDto.getDisplayName()), UserEntity::getDisplayName, userQueryDto.getDisplayName())
                .eq(StringUtils.isNotEmpty(userQueryDto.getRoleId()), UserEntity::getRoleId, userQueryDto.getRoleId())
                .eq(userQueryDto.getStatus() != null, UserEntity::getStatus, userQueryDto.getStatus())
                .orderByAsc(UserEntity::getStatus)
                .orderByDesc(UserEntity::getUpdateTime)
        );
        return BeanCopyUtils.copy(userEntityIPage, PageDto.class);
    }
}
