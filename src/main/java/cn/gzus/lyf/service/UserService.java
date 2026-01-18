package cn.gzus.lyf.service;

import cn.gzus.lyf.common.constant.UserStatusEnum;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.UserDto;
import cn.gzus.lyf.common.dto.UserQueryDto;
import cn.gzus.lyf.dao.*;
import cn.gzus.lyf.dao.entity.*;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private UserDAO userDAO;
    private RoleDAO roleDAO;
    private RoleMenuRelationDAO roleMenuRelationDAO;
    private MenuDAO menuDAO;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Autowired
    public void setRoleDAO(RoleDAO roleDAO) {
        this.roleDAO = roleDAO;
    }

    @Autowired
    public void setRoleMenuRelationDAO(RoleMenuRelationDAO roleMenuRelationDAO) {
        this.roleMenuRelationDAO = roleMenuRelationDAO;
    }

    @Autowired
    public void setMenuDAO(MenuDAO menuDAO) {
        this.menuDAO = menuDAO;
    }

    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
        // 1. 查询用户信息
        UserEntity userEntity = userDAO.getUserByName(userName);
        if (userEntity == null) {
            throw new UsernameNotFoundException("用户名不存在");
        }
        if (ObjectUtils.notEqual(userEntity.getStatus(), UserStatusEnum.ACTIVE.getCode())) {
            throw new UsernameNotFoundException("用户未激活，无法登录");
        }

        // 2. 查询用户权限（菜单权限标识）
        List<MenuEntity> menuList = getMenusByRoleId(userEntity.getRoleId());
        List<SimpleGrantedAuthority> authorities = menuList.stream()
                .map(menu -> new SimpleGrantedAuthority(menu.getMenuCode()))
                .collect(Collectors.toList());

        // 3. 使用Builder模式构建UserDto，包含完整的用户信息
        return new UserDto.Builder(userEntity.getUsername(), userEntity.getPassword())
                .id(userEntity.getId())
                .username(userEntity.getUsername())
                .displayName(userEntity.getDisplayName())
                .roleId(userEntity.getRoleId())
                .status(userEntity.getStatus())
                .authorities(authorities)
                .build();
    }

    /**
     * 根据角色ID查询菜单列表
     * @param roleId
     * @return
     */
    public List<MenuEntity> getMenusByRoleId(String roleId) {
        if (roleId == null || roleId.isEmpty()) {
            return new java.util.LinkedList<>();
        }
        List<RoleMenuRelationEntity> roleMenuRelationEntityList = roleMenuRelationDAO.getRoleMenuRelationsByRoleIds(java.util.Collections.singletonList(roleId));
        return menuDAO.getMenusByIds(roleMenuRelationEntityList.stream()
                .map(RoleMenuRelationEntity::getMenuId)
                .collect(Collectors.toList()));
    }

    /**
     * 新增用户
     * @param userEntity 用户实体
     * @return 是否成功
     */
    public boolean addUser(UserEntity userEntity) {
        Objects.requireNonNull(userEntity.getRoleId(), "用户角色不能为空");

        if (userEntity.getPassword() != null && !userEntity.getPassword().isEmpty()) {
            // 对密码进行加密
            String encryptedPassword = passwordEncoder.encode(userEntity.getPassword());
            userEntity.setPassword(encryptedPassword);
        }
        return userDAO.addUser(userEntity);
    }

    /**
     * 修改用户信息
     * @param userEntity 用户实体，id必填，其他字段可选
     * @return 是否成功
     */
    public boolean updateUser(UserEntity userEntity) {
        Objects.requireNonNull(userEntity, "用户实体不能为空");
        Objects.requireNonNull(userDAO.getById(userEntity.getId()), "用户id不存在");
        // 更新用户信息不允许同时更新用户密码
        userEntity.setPassword(null);
        return userDAO.updateUser(userEntity);
    }

    /**
     * 重置密码
     * @param userEntity 用户实体，id必填，其他字段可选
     * @return 是否成功
     */
    public boolean resetPassword(UserEntity userEntity) {
        Objects.requireNonNull(userEntity, "用户实体不能为空");
        Objects.requireNonNull(userDAO.getById(userEntity.getId()), "用户id不存在");
        // 对新密码进行加密
        String encryptedPassword = passwordEncoder.encode(userEntity.getPassword());
        userEntity.setPassword(encryptedPassword);
        return userDAO.updateUser(userEntity);
    }

    /**
     * 删除用户（硬删除）
     * @param userId 用户ID
     * @return 是否成功
     */
    public boolean deleteUser(String userId) {
        Objects.requireNonNull(userDAO.getById(userId), "用户id不存在");

        // 再删除用户
        return userDAO.deleteUser(userId);
    }

    /**
     * 根据条件分页查询用户信息
     * @param current 当前页码
     * @param size 每页大小
     * @param userQueryDto 用户查询信息，用于查询条件
     * @return 分页结果
     */
    public PageDto<UserEntity> getUserPage(int current, int size, UserQueryDto userQueryDto) {
        return userDAO.getUserPage(current, size, userQueryDto);
    }
}
