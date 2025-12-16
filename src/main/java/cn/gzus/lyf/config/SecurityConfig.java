//package cn.gzus.lyf.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity(prePostEnabled = true)
//public class SecurityConfig {
//
//    private final UserDetailsServiceImpl userDetailsService;
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public DaoAuthenticationProvider authenticationProvider() {
//        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
//        provider.setUserDetailsService(userDetailsService);
//        provider.setPasswordEncoder(passwordEncoder());
//        return provider;
//    }
//
//    /**
//     * 安全过滤链
//     * @param http
//     * @return
//     * @throws Exception
//     */
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                // 关闭CSRF（前后端分离不需要）
//                .csrf(csrf -> csrf.disable())
//                // 关闭Session（JWT无状态）
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                // 权限配置
//                .authorizeHttpRequests(auth -> auth
//                        // 放行登录接口
//                        .requestMatchers("/login").permitAll()
//                        // 其余请求需认证
//                        .anyRequest().authenticated()
//                )
//                // 添加JWT过滤器
//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
//                // 认证提供者
//                .authenticationProvider(authenticationProvider());
//        return http.build();
//    }
//}