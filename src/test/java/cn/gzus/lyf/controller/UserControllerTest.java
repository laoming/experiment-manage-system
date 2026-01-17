package cn.gzus.lyf.controller;

import cn.gzus.lyf.BaseTest;
import cn.gzus.lyf.common.constant.UserStatusEnum;
import cn.gzus.lyf.common.dto.UserQueryDto;
import cn.gzus.lyf.dao.entity.UserEntity;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

class UserControllerTest extends BaseTest {

    @Autowired
    private UserController userController;

    @Test
    public void testAddUser() {
        UserEntity userEntity = new UserEntity();
        userEntity.setId("SuperAdmin");
        userEntity.setUsername("SuperAdmin");
        userEntity.setPassword("123456");
        userEntity.setDisplayName("超级管理员");
        userController.addUser(userEntity);
    }

    @Test
    public void testUpdateUser() {
        UserEntity userEntity = new UserEntity();
        userEntity.setId("1");
        userEntity.setDisplayName("更新的显示名称");
        assertNotNull(userController.updateUser(userEntity).getData());
    }

    @Test
    public void testUpdateUserWithNullId() {
        UserEntity userEntity = new UserEntity();
        userEntity.setDisplayName("测试显示名称");
        assertThrows(Exception.class, () -> {
            userController.updateUser(userEntity).getData();
        });
    }

    @Test
    public void testResetPassword() {
        UserEntity userEntity = new UserEntity();
        userEntity.setId("1");
        userEntity.setPassword("newPassword123");
        assertNotNull(userController.resetPassword(userEntity).getData());
    }

    @Test
    public void testResetPasswordWithNullPassword() {
        UserEntity userEntity = new UserEntity();
        userEntity.setId("1");
        assertThrows(Exception.class, () -> {
            userController.resetPassword(userEntity);
        });
    }

    @Test
    public void testDeleteUser() {
        UserEntity userEntity = new UserEntity();
        userEntity.setId("test-delete-id");
        assertNotNull(userController.deleteUser(userEntity).getData());
    }

    @Test
    public void testDeleteUserWithNullId() {
        UserEntity userEntity = new UserEntity();
        assertThrows(Exception.class, () -> {
            userController.deleteUser(userEntity);
        });
    }

    @Test
    public void testGetUserPage() {
        UserQueryDto userQueryDto = new UserQueryDto();
        IPage<UserEntity> result = userController.getUserPage(1, 10, userQueryDto).getData();
        assertNotNull(result);
    }

    @Test
    public void testGetUserPageWithQueryConditions() {
        UserQueryDto userQueryDto = new UserQueryDto();
        userQueryDto.setUsername("admin");
        IPage<UserEntity> result = userController.getUserPage(1, 10, userQueryDto).getData();
        assertNotNull(result);
    }

    @Test
    public void testGetUserPageWithStatusCondition() {
        UserQueryDto userQueryDto = new UserQueryDto();
        userQueryDto.setStatus(UserStatusEnum.ACTIVE.getCode());
        IPage<UserEntity> result = userController.getUserPage(1, 10, userQueryDto).getData();
        assertNotNull(result);
    }
}