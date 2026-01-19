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
     * 生成组织全路径
     * @param organizationEntity 组织实体
     */
    private void generateFullPath(OrganizationEntity organizationEntity) {
        // 设置默认父组织ID为0（顶级组织）
        if (organizationEntity.getParentId() == null || organizationEntity.getParentId().isEmpty()) {
            organizationEntity.setParentId("0");
        }

        // 生成全路径
        String parentId = organizationEntity.getParentId();
        String orgName = organizationEntity.getOrgName();

        if ("0".equals(parentId)) {
            // 顶级组织，全路径就是组织名称
            organizationEntity.setFullPath(orgName);
        } else {
            // 子组织，全路径 = 父组织全路径 + / + 当前组织名称
            OrganizationEntity parentOrg = this.getById(parentId);
            if (parentOrg != null) {
                organizationEntity.setFullPath(parentOrg.getFullPath() + "/" + orgName);
            } else {
                organizationEntity.setFullPath(orgName);
            }
        }
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

        // 生成组织全路径
        generateFullPath(organizationEntity);

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

    /**
     * 获取所有组织列表（用于父组织选择）
     * @return 组织列表
     */
    public List<OrganizationEntity> getOrganizationList() {
        return this.list(Wrappers.<OrganizationEntity>lambdaQuery()
                .orderByAsc(OrganizationEntity::getFullPath)
        );
    }

    /**
     * 检查组织下是否有子组织
     * @param organizationId 组织ID
     * @return 是否有子组织
     */
    public boolean hasChildOrganizations(String organizationId) {
        Objects.requireNonNull(organizationId, "组织ID不能为空");
        long count = this.count(Wrappers.<OrganizationEntity>lambdaQuery()
                .eq(OrganizationEntity::getParentId, organizationId));
        return count > 0;
    }
}
