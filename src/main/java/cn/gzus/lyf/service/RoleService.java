package cn.gzus.lyf.service;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.RoleQueryDto;
import cn.gzus.lyf.dao.RoleMenuRelationDAO;
import cn.gzus.lyf.dao.RoleDAO;
import cn.gzus.lyf.dao.entity.RoleEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class RoleService {

    private RoleDAO roleDAO;
    private RoleMenuRelationDAO roleMenuRelationDAO;

    @Autowired
    public void setRoleDAO(RoleDAO roleDAO) {
        this.roleDAO = roleDAO;
    }

    @Autowired
    public void setRoleMenuRelationDAO(RoleMenuRelationDAO roleMenuRelationDAO) {
        this.roleMenuRelationDAO = roleMenuRelationDAO;
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
     * 删除角色（硬删除，同时删除角色关联的用户和菜单）
     * @param roleId 角色ID
     * @return 是否成功
     */
    public boolean deleteRole(String roleId) {
        Objects.requireNonNull(roleId, "角色ID不能为空");
        Objects.requireNonNull(roleDAO.getById(roleId), "角色id不存在");

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
     * 根据ID列表查询角色列表
     * @param ids 角色ID列表
     * @return 角色列表
     */
    public List<RoleEntity> getRolesByIds(List<String> ids) {
        return roleDAO.getRolesByIds(ids);
    }
}
