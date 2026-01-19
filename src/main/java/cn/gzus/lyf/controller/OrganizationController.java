package cn.gzus.lyf.controller;

import cn.gzus.lyf.common.dto.OrganizationQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.dao.entity.OrganizationEntity;
import cn.gzus.lyf.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 组织管理
 */
@RestController
@RequestMapping("/organization")
public class OrganizationController {

    private OrganizationService organizationService;

    @Autowired
    public void setOrganizationService(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    /**
     * 分页查询组织
     */
    @PostMapping("/page")
    public Result<PageDto<OrganizationEntity>> getOrganizationPage(int current, int size, @RequestBody OrganizationQueryDto organizationQueryDto) {
        return Result.success(organizationService.getOrganizationPage(current, size, organizationQueryDto));
    }

    /**
     * 获取所有组织列表（用于父组织选择）
     */
    @PostMapping("/list")
    public Result<List<OrganizationEntity>> getOrganizationList() {
        return Result.success(organizationService.getOrganizationList());
    }

    /**
     * 新增组织
     */
    @PostMapping("/add")
    public Result<Boolean> addOrganization(@RequestBody OrganizationEntity organizationEntity) {
        return Result.success(organizationService.addOrganization(organizationEntity));
    }

    /**
     * 删除组织(硬删除，删除数据库记录数据)
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteOrganization(@RequestBody OrganizationEntity organizationEntity) {
        return Result.success(organizationService.deleteOrganization(organizationEntity.getId()));
    }

    /**
     * 更新组织信息
     */
    @PostMapping("/update")
    public Result<Boolean> updateOrganization(@RequestBody OrganizationEntity organizationEntity) {
        return Result.success(organizationService.updateOrganization(organizationEntity));
    }
}
