package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.MenuEntity;
import cn.gzus.lyf.dao.mapper.MenuMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

@Service
public class MenuDAO extends ServiceImpl<MenuMapper, MenuEntity> {

    public List<MenuEntity> getMenusByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return new LinkedList<>();
        }
        return this.list(new LambdaQueryWrapper<MenuEntity>()
                .in(MenuEntity::getId, ids));
    }

}
