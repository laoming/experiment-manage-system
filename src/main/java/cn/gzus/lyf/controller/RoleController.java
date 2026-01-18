package cn.gzus.lyf.controller;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.RoleQueryDto;
import cn.gzus.lyf.dao.entity.RoleEntity;
import cn.gzus.lyf.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 角色管理
 */
@RestController
@RequestMapping("/role")
public class RoleController {

    private RoleService roleService;

    @Autowired
    public void setRoleService(RoleService roleService) {
        this.roleService = roleService;
    }

    /**
     * 分页查询角色
     */
    @PostMapping("/page")
    public Result<PageDto<RoleEntity>> getRolePage(int current, int size, @RequestBody RoleQueryDto roleQueryDto) {
        return Result.success(roleService.getRolePage(current, size, roleQueryDto));
    }

    /**
     * 新增角色
     */
    @PostMapping("/add")
    public Result<Boolean> addRole(@RequestBody RoleEntity roleEntity) {
        return Result.success(roleService.addRole(roleEntity));
    }

    /**
     * 删除角色(硬删除，删除数据库记录数据，同时删除角色关联的用户和菜单)
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteRole(@RequestBody RoleEntity roleEntity) {
        return Result.success(roleService.deleteRole(roleEntity.getId()));
    }
}
