package cn.gzus.lyf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 启动类
 */
@SpringBootApplication
public class EmsSpringBootApplication {

    public static void main(String[] args) {
        // 启动Spring Boot应用
        SpringApplication.run(EmsSpringBootApplication.class, args);
        System.out.println("===== 实验管理系统 启动成功 =====");
    }

}