package cn.gzus.lyf.controller;

import cn.gzus.lyf.BaseTest;
import cn.gzus.lyf.dao.entity.UserEntity;
import cn.gzus.lyf.service.auth.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class AuthControllerTest extends BaseTest {

    @Autowired
    private AuthService authService;

    @Test
    public void login() {
        UserEntity userEntity = new UserEntity();
        userEntity.setUsername("SuperAdmin");
        userEntity.setPassword("123456");
        System.out.println(authService.login(userEntity));
    }

}