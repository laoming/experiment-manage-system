//package cn.gzus.lyf.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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
//                // 前后端不分离可开启CSRF
//                .csrf(csrf -> csrf.enable())
//                // 启用Session（默认就是STATEFUL）
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATEFUL))
//                // 表单登录（Spring Security原生登录页）
//                .formLogin(form -> form
//                        .loginProcessingUrl("/login") // 登录接口
//                        .permitAll()
//                )
//                // 权限配置
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/login").permitAll()
//                        .anyRequest().authenticated()
//                )
//                .authenticationProvider(authenticationProvider());
//
//        return http.build();
//    }
//}