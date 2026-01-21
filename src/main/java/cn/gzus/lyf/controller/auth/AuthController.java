package cn.gzus.lyf.controller.auth;

import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.dao.entity.UserEntity;
import cn.gzus.lyf.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 登录鉴权
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private AuthService authService;

    @Autowired
    public void setAuthService(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<String> login(@RequestBody UserEntity userEntity) {
        String ret = authService.login(userEntity);
        return Result.success(ret);
    }
}
