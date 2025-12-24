package cn.gzus.lyf.service;

import cn.gzus.lyf.constant.UserStatusEnum;
import cn.gzus.lyf.dao.*;
import cn.gzus.lyf.dao.entity.*;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private UserDAO userDAO;
    private UserRoleRelationDAO userRoleRelationDAO;
    private RoleDAO roleDAO;
    private RoleMenuRelationDAO roleMenuRelationDAO;
    private MenuDAO menuDAO;

    @Autowired
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Autowired
    public void setUserRoleRelationDAO(UserRoleRelationDAO userRoleRelationDAO) {
        this.userRoleRelationDAO = userRoleRelationDAO;
    }

    @Autowired
    public RoleDAO getRoleDAO() {
        return roleDAO;
    }

    @Autowired
    public RoleMenuRelationDAO getRoleMenuRelationDAO() {
        return roleMenuRelationDAO;
    }

    @Autowired
    public void setMenuDAO(MenuDAO menuDAO) {
        this.menuDAO = menuDAO;
    }

    @Override
    public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
        // 1. 查询用户信息
        UserEntity userEntity = userDAO.getUserByName(userName);
        if (userEntity == null) {
            throw new UsernameNotFoundException("用户名不存在");
        }
        if (ObjectUtils.notEqual(userEntity.getStatus(), UserStatusEnum.ACTIVE)) {
            throw new UsernameNotFoundException("用户已禁用");
        }

        // 2. 查询用户权限（菜单权限标识）
        List<MenuEntity> menuList = getMenusByUserId(userEntity.getId());
        List<SimpleGrantedAuthority> authorities = menuList.stream()
                .map(menu -> new SimpleGrantedAuthority(menu.getMenuCode()))
                .collect(Collectors.toList());

        // 3. 封装UserDetails
        return User.withUsername(userEntity.getUsername())
                .password(userEntity.getPassword())
                .authorities(authorities)
                .build();
    }

    /**
     * 根据用户ID查询菜单列表
     * @param userId
     * @return
     */
    public List<MenuEntity> getMenusByUserId(String userId) {
        List<UserRoleRelationEntity> userRoleRelationEntityList = userRoleRelationDAO.getUserRoleRelationsByUserId(userId);
        List<RoleEntity> roleEntityList = roleDAO.getRolesByIds(userRoleRelationEntityList.stream()
                .map(UserRoleRelationEntity::getRoleId)
                .collect(Collectors.toList()));
        List<RoleMenuRelationEntity> roleMenuRelationEntityList = roleMenuRelationDAO.getRoleMenuRelationsByRoleIds(roleEntityList.stream()
                .map(RoleEntity::getId)
                .collect(Collectors.toList()));
        return menuDAO.getMenusByIds(roleMenuRelationEntityList.stream()
                .map(RoleMenuRelationEntity::getMenuId)
                .collect(Collectors.toList()));
    }

}
