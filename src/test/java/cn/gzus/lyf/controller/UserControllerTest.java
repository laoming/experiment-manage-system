package cn.gzus.lyf.controller;

import cn.gzus.lyf.BaseTest;
import cn.gzus.lyf.dao.entity.UserEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;


class UserControllerTest extends BaseTest {

    @Autowired
    private UserController userController;

    @Test
    public void addUser() {
        UserEntity userEntity = new UserEntity();
        userEntity.setUsername("SuperAdmin");
        userEntity.setPassword("123456");
        userEntity.setDisplayName("超级管理员");
        userController.addUser(userEntity);
    }
}