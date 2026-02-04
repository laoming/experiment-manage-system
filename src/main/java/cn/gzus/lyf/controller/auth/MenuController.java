package cn.gzus.lyf.controller.auth;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.UserDto;
import cn.gzus.lyf.dao.entity.MenuEntity;
import cn.gzus.lyf.service.auth.MenuService;
import cn.gzus.lyf.service.auth.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 菜单管理
 */
@RestController
@RequestMapping("/menu")
public class MenuController {

    private UserService userService;
    private MenuService menuService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @Autowired
    public void setMenuService(MenuService menuService) {
        this.menuService = menuService;
    }

    /**
     * 获取当前用户的菜单列表
     */
    @GetMapping("/list")
    public Result<List<MenuEntity>> getMenuList() {
        // 从 SecurityContext 获取当前用户信息
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Result.error("未登录");
        }

        // 获取当前用户的角色ID
        String roleId = ((UserDto) authentication.getPrincipal()).getRoleId();

        if (roleId == null) {
            return Result.error("未找到用户角色");
        }

        // 根据角色ID查询菜单列表
        List<MenuEntity> menuList = userService.getMenusByRoleId(roleId);
        return Result.success(menuList);
    }

    /**
     * 分页查询菜单
     */
    @PostMapping("/page")
    public Result<PageDto<MenuEntity>> getMenuPage(int current, int size, String menuName, String menuType) {
        return Result.success(menuService.getMenuPage(current, size, menuName, menuType));
    }

    /**
     * 新增菜单
     */
    @PostMapping("/add")
    public Result<Boolean> addMenu(@RequestBody MenuEntity menuEntity) {
        return Result.success(menuService.addMenu(menuEntity));
    }

    /**
     * 更新菜单
     */
    @PostMapping("/update")
    public Result<Boolean> updateMenu(@RequestBody MenuEntity menuEntity) {
        return Result.success(menuService.updateMenu(menuEntity));
    }

    /**
     * 删除菜单
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteMenu(@RequestBody MenuEntity menuEntity) {
        try {
            return Result.success(menuService.deleteMenu(menuEntity.getId()));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取所有菜单树（平铺列表，用于权限分配）
     */
    @PostMapping("/tree")
    public Result<List<MenuEntity>> getMenuTree() {
        return Result.success(menuService.getAllMenus());
    }
}
