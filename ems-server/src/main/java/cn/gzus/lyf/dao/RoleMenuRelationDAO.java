package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.RoleMenuRelationEntity;
import cn.gzus.lyf.dao.mapper.RoleMenuRelationMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

@Service
public class RoleMenuRelationDAO extends ServiceImpl<RoleMenuRelationMapper, RoleMenuRelationEntity> {

    /**
     * 根据角色id列表查询角色菜单关系
     * @param roleIds
     * @return
     */
    public List<RoleMenuRelationEntity> getRoleMenuRelationsByRoleIds(List<String> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return new LinkedList<>();
        }
        return this.list(new LambdaQueryWrapper<RoleMenuRelationEntity>()
                .in(RoleMenuRelationEntity::getRoleId, roleIds));
    }

    /**
     * 根据角色ID删除角色菜单关系
     * @param roleId 角色ID
     * @return 是否成功
     */
    public boolean deleteRoleMenuRelationsByRoleId(String roleId) {
        Objects.requireNonNull(roleId, "角色ID不能为空");

        return this.remove(new LambdaQueryWrapper<RoleMenuRelationEntity>()
                .eq(RoleMenuRelationEntity::getRoleId, roleId));
    }

}
