package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.MenuEntity;
import cn.gzus.lyf.dao.entity.RoleMenuRelationEntity;
import cn.gzus.lyf.dao.mapper.MenuMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

@Service
public class MenuDAO extends ServiceImpl<MenuMapper, MenuEntity> {

    private RoleMenuRelationDAO roleMenuRelationDAO;

    @Autowired
    public void setRoleMenuRelationDAO(RoleMenuRelationDAO roleMenuRelationDAO) {
        this.roleMenuRelationDAO = roleMenuRelationDAO;
    }

    public List<MenuEntity> getMenusByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return new LinkedList<>();
        }
        return this.list(new LambdaQueryWrapper<MenuEntity>()
                .in(MenuEntity::getId, ids));
    }

    /**
     * 检查菜单是否被角色使用
     * @param menuId 菜单ID
     * @return 是否被使用
     */
    public boolean isMenuUsed(String menuId) {
        Objects.requireNonNull(menuId, "菜单ID不能为空");
        Long count = this.count(new LambdaQueryWrapper<MenuEntity>()
                .eq(MenuEntity::getParentId, menuId));
        
        // 如果有子菜单，说明被间接使用
        if (count > 0) {
            return true;
        }
        
        // 检查是否被角色直接关联
        Long relationCount = roleMenuRelationDAO.count(
            new LambdaQueryWrapper<RoleMenuRelationEntity>()
                .eq(RoleMenuRelationEntity::getMenuId, menuId)
        );
        
        return relationCount > 0;
    }
}
