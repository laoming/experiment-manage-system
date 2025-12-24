package cn.gzus.lyf.controller;

import cn.gzus.lyf.dao.UserDAO;
import cn.gzus.lyf.dao.entity.UserEntity;
import cn.gzus.lyf.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user")
public class UserController {

    private UserDAO userDAO;
    private UserService userService;

    private AuthenticationManager authenticationManager;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @Autowired
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Autowired
    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public String login(@RequestBody UserEntity userEntity) {
        // 1. 构建认证Token
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                userEntity.getUsername(), userEntity.getPassword());
        // 2. 触发认证（会调用CustomUserDetailsService.loadUserByUsername）
        Authentication authentication = authenticationManager.authenticate(token);
        // 3. 认证成功（可生成JWT、存入Session等，此处简化返回）
        return "登录成功，当前用户：" + authentication.getName();
    }

    @PostMapping("/add")
    public boolean addUser(@RequestBody UserEntity userEntity) {
        return userDAO.addUser(userEntity);
    }

}
