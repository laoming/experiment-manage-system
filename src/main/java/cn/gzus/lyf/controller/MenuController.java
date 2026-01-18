package cn.gzus.lyf.controller;

import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.dao.MenuDAO;
import cn.gzus.lyf.dao.entity.MenuEntity;
import cn.gzus.lyf.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 菜单管理
 */
@RestController
@RequestMapping("/menu")
public class MenuController {

    private MenuDAO menuDAO;
    private UserService userService;

    @Autowired
    public void setMenuDAO(MenuDAO menuDAO) {
        this.menuDAO = menuDAO;
    }

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    /**
     * 获取当前用户的菜单列表
     */
    @GetMapping("/list")
    public Result<List<MenuEntity>> getMenuList() {
        try {
            // 从 SecurityContext 获取当前用户信息
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return Result.error("未登录");
            }

            // 获取当前用户的角色ID
            String roleId = null;
            if (authentication.getPrincipal() instanceof cn.gzus.lyf.common.dto.UserDto) {
                cn.gzus.lyf.common.dto.UserDto userDto = (cn.gzus.lyf.common.dto.UserDto) authentication.getPrincipal();
                roleId = userDto.getRoleId();
            }

            if (roleId == null) {
                return Result.error("未找到用户角色");
            }

            // 根据角色ID查询菜单列表
            List<MenuEntity> menuList = userService.getMenusByRoleId(roleId);
            return Result.success(menuList);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取菜单列表失败: " + e.getMessage());
        }
    }
}
