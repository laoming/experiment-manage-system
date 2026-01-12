package cn.gzus.lyf.service;

import cn.gzus.lyf.common.dto.UserDto;
import cn.gzus.lyf.common.util.JwtUtil;
import cn.gzus.lyf.dao.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private AuthenticationManager authenticationManager;
    private JwtUtil jwtUtil;

    @Autowired
    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Autowired
    public void setJwtUtil(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * 登录
     * @param userEntity
     * @return 用户 JWT TOKEN
     */
    public String login(UserEntity userEntity) {
        // 1. 构建认证Token（用户名和明文密码）
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                userEntity.getUsername(),
                userEntity.getPassword());
        // 2. 触发认证（会调用 UserService.loadUserByUsername）
        Authentication authentication = authenticationManager.authenticate(token);
        // 3. 获取用户详情（UserDto类型，包含额外信息）
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // 4. 提取所有额外信息并添加到token claims中
        UserDto userDto = (UserDto) userDetails;

        Map<String, Object> additionalClaims = new HashMap<>();
        additionalClaims.put("id", userDto.getId());
        additionalClaims.put("username", userDto.getUsername());
        additionalClaims.put("displayName", userDto.getDisplayName());

        // 生成包含完整信息的JWT Token
        return jwtUtil.generateToken(userDetails, additionalClaims);
    }

}
