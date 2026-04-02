package cn.gzus.lyf.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 角色-菜单关联表实体类
 */
@TableName("role_menu_relation")
public class RoleMenuRelationEntity {
    /**
     * 主键ID
     */
    private String id;

    /**
     * 角色ID
     */
    private String roleId;

    /**
     * 菜单ID
     */
    private String menuId;


    // getter & setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRoleId() {
        return roleId;
    }

    public void setRoleId(String roleId) {
        this.roleId = roleId;
    }

    public String getMenuId() {
        return menuId;
    }

    public void setMenuId(String menuId) {
        this.menuId = menuId;
    }

}