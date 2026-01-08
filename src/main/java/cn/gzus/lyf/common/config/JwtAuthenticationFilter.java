package cn.gzus.lyf.common.config;

import cn.gzus.lyf.service.UserService;
import cn.gzus.lyf.common.util.JwtUtil;

import cn.gzus.lyf.common.constant.JwtConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private JwtUtil jwtUtil;
    private UserService userService;

    @Autowired
    public void setJwtUtil(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 1. 获取Token
        String authHeader = request.getHeader(JwtConstants.TOKEN_HEADER);
        String token = null;
        String username = null;
        if (authHeader != null && authHeader.startsWith(JwtConstants.TOKEN_PREFIX)) {
            token = authHeader.replace(JwtConstants.TOKEN_PREFIX, "");
            try {
                username = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                log.error("Token解析失败：{}", e.getMessage());
            }
        }

        // 2. 验证Token并设置认证信息
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userService.loadUserByUsername(username);
            if (jwtUtil.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }

        // 3. 继续过滤链
        filterChain.doFilter(request, response);
    }
}