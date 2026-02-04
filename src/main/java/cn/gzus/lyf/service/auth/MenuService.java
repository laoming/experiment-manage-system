package cn.gzus.lyf.service.auth;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.dao.MenuDAO;
import cn.gzus.lyf.dao.entity.MenuEntity;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

@Service
public class MenuService {

    private MenuDAO menuDAO;

    @Autowired
    public void setMenuDAO(MenuDAO menuDAO) {
        this.menuDAO = menuDAO;
    }

    /**
     * 新增菜单
     * @param menuEntity 菜单实体
     * @return 是否成功
     */
    public boolean addMenu(MenuEntity menuEntity) {
        Objects.requireNonNull(menuEntity, "菜单实体不能为空");
        Objects.requireNonNull(menuEntity.getMenuName(), "菜单名称不能为空");
        Objects.requireNonNull(menuEntity.getMenuCode(), "菜单编码不能为空");
        Objects.requireNonNull(menuEntity.getMenuType(), "菜单类型不能为空");
        
        // 设置默认父菜单ID为0
        if (menuEntity.getParentId() == null || menuEntity.getParentId().trim().isEmpty()) {
            menuEntity.setParentId("0");
        }
        
        // 设置默认排序
        if (menuEntity.getSort() == null) {
            menuEntity.setSort(0);
        }
        
        return menuDAO.save(menuEntity);
    }

    /**
     * 更新菜单
     * @param menuEntity 菜单实体
     * @return 是否成功
     */
    public boolean updateMenu(MenuEntity menuEntity) {
        Objects.requireNonNull(menuEntity, "菜单实体不能为空");
        Objects.requireNonNull(menuEntity.getId(), "菜单ID不能为空");
        return menuDAO.updateById(menuEntity);
    }

    /**
     * 删除菜单（硬删除）
     * @param menuId 菜单ID
     * @return 是否成功
     */
    public boolean deleteMenu(String menuId) {
        Objects.requireNonNull(menuId, "菜单ID不能为空");
        
        // 先检查是否有子菜单
        List<MenuEntity> childMenus = menuDAO.list(
            new LambdaQueryWrapper<MenuEntity>().eq(MenuEntity::getParentId, menuId)
        );
        
        if (!childMenus.isEmpty()) {
            throw new RuntimeException("该菜单下存在子菜单，无法删除");
        }

        // 检查菜单是否被角色使用
        if (menuDAO.isMenuUsed(menuId)) {
            throw new RuntimeException("该菜单已被角色关联，无法删除");
        }
        
        return menuDAO.removeById(menuId);
    }

    /**
     * 根据条件分页查询菜单信息
     * @param current 当前页码
     * @param size 每页大小
     * @param menuName 菜单名称
     * @param menuType 菜单类型
     * @return 分页结果
     */
    public PageDto<MenuEntity> getMenuPage(Integer current, Integer size, String menuName, String menuType) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");
        
        Page<MenuEntity> page = menuDAO.page(
            new Page<>(current, size),
            Wrappers.<MenuEntity>lambdaQuery()
                .like(org.apache.commons.lang3.StringUtils.isNotEmpty(menuName), MenuEntity::getMenuName, menuName)
                .eq(org.apache.commons.lang3.StringUtils.isNotEmpty(menuType), MenuEntity::getMenuType, menuType)
                .orderByAsc(MenuEntity::getSort)
                .orderByDesc(MenuEntity::getUpdateTime)
        );
        
        PageDto<MenuEntity> pageDto = new PageDto<>();
        pageDto.setCurrent(page.getCurrent());
        pageDto.setSize(page.getSize());
        pageDto.setTotal(page.getTotal());
        pageDto.setPages(page.getPages());
        pageDto.setRecords(page.getRecords());
        
        return pageDto;
    }

    /**
     * 根据ID列表查询菜单列表
     * @param ids 菜单ID列表
     * @return 菜单列表
     */
    public List<MenuEntity> getMenusByIds(List<String> ids) {
        return menuDAO.getMenusByIds(ids);
    }

    /**
     * 获取所有菜单列表（用于权限分配）
     * @return 菜单列表
     */
    public List<MenuEntity> getAllMenus() {
        return menuDAO.list(
            new LambdaQueryWrapper<MenuEntity>().orderByAsc(MenuEntity::getSort)
        );
    }
}
