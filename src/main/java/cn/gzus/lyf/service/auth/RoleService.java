package cn.gzus.lyf.service.auth;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.RoleQueryDto;
import cn.gzus.lyf.dao.MenuDAO;
import cn.gzus.lyf.dao.RoleMenuRelationDAO;
import cn.gzus.lyf.dao.RoleDAO;
import cn.gzus.lyf.dao.entity.MenuEntity;
import cn.gzus.lyf.dao.entity.RoleEntity;
import cn.gzus.lyf.dao.entity.RoleMenuRelationEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private RoleDAO roleDAO;
    private RoleMenuRelationDAO roleMenuRelationDAO;
    private MenuDAO menuDAO;

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

    /**
     * 新增角色
     * @param roleEntity 角色实体
     * @return 是否成功
     */
    public boolean addRole(RoleEntity roleEntity) {
        Objects.requireNonNull(roleEntity, "角色实体不能为空");
        Objects.requireNonNull(roleEntity.getRoleName(), "角色名称不能为空");
        Objects.requireNonNull(roleEntity.getRoleCode(), "角色编码不能为空");
        return roleDAO.addRole(roleEntity);
    }

    /**
     * 更新角色
     * @param roleEntity 角色实体
     * @return 是否成功
     */
    public boolean updateRole(RoleEntity roleEntity) {
        Objects.requireNonNull(roleEntity, "角色实体不能为空");
        Objects.requireNonNull(roleEntity.getId(), "角色ID不能为空");
        return roleDAO.updateById(roleEntity);
    }

    /**
     * 删除角色（硬删除，同时删除角色关联的用户和菜单）
     * @param roleId 角色ID
     * @return 是否成功
     */
    public boolean deleteRole(String roleId) {
        Objects.requireNonNull(roleId, "角色ID不能为空");
        Objects.requireNonNull(roleDAO.getById(roleId), "角色id不存在");

        // 检查角色是否被用户使用
        if (roleDAO.isRoleUsed(roleId)) {
            throw new RuntimeException("该角色已被用户使用，无法删除");
        }

        // 先删除角色菜单关联
        roleMenuRelationDAO.deleteRoleMenuRelationsByRoleId(roleId);

        // 再删除角色
        return roleDAO.deleteRole(roleId);
    }

    /**
     * 根据条件分页查询角色信息
     * @param current 当前页码
     * @param size 每页大小
     * @param roleQueryDto 角色查询信息，用于查询条件
     * @return 分页结果
     */
    public PageDto<RoleEntity> getRolePage(int current, int size, RoleQueryDto roleQueryDto) {
        return roleDAO.getRolePage(current, size, roleQueryDto);
    }

    /**
     * 获取所有角色列表
     * @return 角色列表
     */
    public List<RoleEntity> getAllRoles() {
        return roleDAO.list();
    }

    /**
     * 根据ID列表查询角色列表
     * @param ids 角色ID列表
     * @return 角色列表
     */
    public List<RoleEntity> getRolesByIds(List<String> ids) {
        return roleDAO.getRolesByIds(ids);
    }

    /**
     * 分配菜单给角色
     * @param roleId 角色ID
     * @param menuIds 菜单ID字符串，用逗号分隔
     * @return 是否成功
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean assignMenu(String roleId, String menuIds) {
        Objects.requireNonNull(roleId, "角色ID不能为空");
        Objects.requireNonNull(roleDAO.getById(roleId), "角色id不存在");

        // 先删除该角色的所有菜单关联
        roleMenuRelationDAO.deleteRoleMenuRelationsByRoleId(roleId);

        // 如果有菜单ID，则重新关联
        if (menuIds != null && !menuIds.trim().isEmpty()) {
            List<String> menuIdList = Arrays.asList(menuIds.split(","));
            List<RoleMenuRelationEntity> relations = new LinkedList<>();
            for (String menuId : menuIdList) {
                if (menuId != null && !menuId.trim().isEmpty()) {
                    RoleMenuRelationEntity relation = new RoleMenuRelationEntity();
                    relation.setRoleId(roleId);
                    relation.setMenuId(menuId.trim());
                    relations.add(relation);
                }
            }
            return roleMenuRelationDAO.saveBatch(relations);
        }
        return true;
    }

    /**
     * 获取角色关联的菜单ID列表
     * @param roleId 角色ID
     * @return 菜单ID列表
     */
    public List<String> getMenuIds(String roleId) {
        Objects.requireNonNull(roleId, "角色ID不能为空");
        List<RoleMenuRelationEntity> relations = roleMenuRelationDAO.list(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<RoleMenuRelationEntity>()
                .eq(RoleMenuRelationEntity::getRoleId, roleId)
        );
        return relations.stream()
            .map(RoleMenuRelationEntity::getMenuId)
            .collect(Collectors.toList());
    }

    /**
     * 获取角色关联的菜单列表
     * @param roleId 角色ID
     * @return 菜单列表
     */
    public List<MenuEntity> getMenusByRoleId(String roleId) {
        List<String> menuIds = getMenuIds(roleId);
        if (menuIds.isEmpty()) {
            return new LinkedList<>();
        }
        return menuDAO.getMenusByIds(menuIds);
    }
}
