package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.RoleEntity;
import cn.gzus.lyf.dao.mapper.RoleMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleDAO extends ServiceImpl<RoleMapper, RoleEntity> {

    public List<RoleEntity> getRolesByIds(List<String> ids) {
        return this.list(new LambdaQueryWrapper<RoleEntity>()
                .in(RoleEntity::getId, ids));
    }

}
