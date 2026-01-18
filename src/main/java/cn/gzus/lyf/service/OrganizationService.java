package cn.gzus.lyf.service;

import cn.gzus.lyf.common.dto.OrganizationQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.dao.OrganizationDAO;
import cn.gzus.lyf.dao.entity.OrganizationEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class OrganizationService {

    private OrganizationDAO organizationDAO;

    @Autowired
    public void setOrganizationDAO(OrganizationDAO organizationDAO) {
        this.organizationDAO = organizationDAO;
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
        return organizationDAO.addOrganization(organizationEntity);
    }

    /**
     * 更新组织信息
     * @param organizationEntity 组织实体，id必填，其他字段可选
     * @return 是否成功
     */
    public boolean updateOrganization(OrganizationEntity organizationEntity) {
        Objects.requireNonNull(organizationEntity, "组织实体不能为空");
        Objects.requireNonNull(organizationDAO.getById(organizationEntity.getId()), "组织id不存在");
        return organizationDAO.updateOrganization(organizationEntity);
    }

    /**
     * 删除组织（硬删除）
     * @param organizationId 组织ID
     * @return 是否成功
     */
    public boolean deleteOrganization(String organizationId) {
        Objects.requireNonNull(organizationDAO.getById(organizationId), "组织id不存在");
        return organizationDAO.deleteOrganization(organizationId);
    }

    /**
     * 根据条件分页查询组织信息
     * @param current 当前页码
     * @param size 每页大小
     * @param organizationQueryDto 组织查询信息，用于查询条件
     * @return 分页结果
     */
    public PageDto<OrganizationEntity> getOrganizationPage(int current, int size, OrganizationQueryDto organizationQueryDto) {
        return organizationDAO.getOrganizationPage(current, size, organizationQueryDto);
    }
}
