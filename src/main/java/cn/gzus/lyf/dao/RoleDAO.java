package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.constant.RoleStatusEnum;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.RoleQueryDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.RoleEntity;
import cn.gzus.lyf.dao.mapper.RoleMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

@Service
public class RoleDAO extends ServiceImpl<RoleMapper, RoleEntity> {

    /**
     * 根据ID列表查询角色列表
     * @param ids 角色ID列表
     * @return 角色列表
     */
    public List<RoleEntity> getRolesByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return new LinkedList<>();
        }
        return this.list(new LambdaQueryWrapper<RoleEntity>()
                .in(RoleEntity::getId, ids));
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

        roleEntity.setStatus(RoleStatusEnum.ACTIVE.getCode());
        return this.save(roleEntity);
    }

    /**
     * 删除角色（硬删除）
     * @param roleId 角色ID
     * @return 是否成功
     */
    public boolean deleteRole(String roleId) {
        Objects.requireNonNull(roleId, "角色ID不能为空");
        return this.removeById(roleId);
    }

    /**
     * 根据条件分页查询角色信息
     * @param current 当前页码
     * @param size 每页大小
     * @param roleQueryDto 角色查询条件
     * @return 分页结果
     */
    public PageDto<RoleEntity> getRolePage(Integer current, Integer size, RoleQueryDto roleQueryDto) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        IPage<RoleEntity> roleEntityIPage = this.page(new Page<>(current, size), Wrappers.<RoleEntity>lambdaQuery()
                .eq(StringUtils.isNotEmpty(roleQueryDto.getRoleName()), RoleEntity::getRoleName, roleQueryDto.getRoleName())
                .eq(StringUtils.isNotEmpty(roleQueryDto.getRoleCode()), RoleEntity::getRoleCode, roleQueryDto.getRoleCode())
                .eq(roleQueryDto.getStatus() != null, RoleEntity::getStatus, roleQueryDto.getStatus())
                .orderByAsc(RoleEntity::getStatus)
                .orderByDesc(RoleEntity::getUpdateTime)
        );
        return BeanCopyUtils.copy(roleEntityIPage, PageDto.class);
    }

}
