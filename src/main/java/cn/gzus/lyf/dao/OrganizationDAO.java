package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.dto.OrganizationQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.OrganizationEntity;
import cn.gzus.lyf.dao.mapper.OrganizationMapper;
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
public class OrganizationDAO extends ServiceImpl<OrganizationMapper, OrganizationEntity> {

    /**
     * 根据ID列表查询组织列表
     * @param ids 组织ID列表
     * @return 组织列表
     */
    public List<OrganizationEntity> getOrganizationsByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return new LinkedList<>();
        }
        return this.list(new LambdaQueryWrapper<OrganizationEntity>()
                .in(OrganizationEntity::getId, ids));
    }

    /**
     * 新增组织
     * @param organizationEntity 组织实体
     * @return 是否成功
     */
    public boolean addOrganization(OrganizationEntity organizationEntity) {
        Objects.requireNonNull(organizationEntity, "组织实体不能为空");
        Objects.requireNonNull(organizationEntity.getOrgName(), "组织名称不能为空");
        Objects.requireNonNull(organizationEntity.getOrgCode(), "组织编码不能为空");

        return this.save(organizationEntity);
    }

    /**
     * 删除组织（硬删除）
     * @param organizationId 组织ID
     * @return 是否成功
     */
    public boolean deleteOrganization(String organizationId) {
        Objects.requireNonNull(organizationId, "组织ID不能为空");
        return this.removeById(organizationId);
    }

    /**
     * 更新组织信息
     * @param organizationEntity 组织实体，id必填
     * @return 是否成功
     */
    public boolean updateOrganization(OrganizationEntity organizationEntity) {
        Objects.requireNonNull(organizationEntity, "组织实体不能为空");
        Objects.requireNonNull(organizationEntity.getId(), "组织ID不能为空");

        organizationEntity.setUpdateTime(new Date());
        return this.updateById(organizationEntity);
    }

    /**
     * 根据条件分页查询组织信息
     * @param current 当前页码
     * @param size 每页大小
     * @param organizationQueryDto 组织查询条件
     * @return 分页结果
     */
    public PageDto<OrganizationEntity> getOrganizationPage(Integer current, Integer size, OrganizationQueryDto organizationQueryDto) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        IPage<OrganizationEntity> organizationEntityIPage = this.page(new Page<>(current, size), Wrappers.<OrganizationEntity>lambdaQuery()
                .eq(StringUtils.isNotEmpty(organizationQueryDto.getOrgName()), OrganizationEntity::getOrgName, organizationQueryDto.getOrgName())
                .eq(StringUtils.isNotEmpty(organizationQueryDto.getOrgCode()), OrganizationEntity::getOrgCode, organizationQueryDto.getOrgCode())
                .orderByDesc(OrganizationEntity::getUpdateTime)
        );
        return BeanCopyUtils.copy(organizationEntityIPage, PageDto.class);
    }
}
