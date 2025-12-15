package cn.gzus.lyf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 启动类
 * @SpringBootApplication 包含：@Configuration + @EnableAutoConfiguration + @ComponentScan
 */
@SpringBootApplication
public class ExperimentManageSystemApplication {

    public static void main(String[] args) {
        // 启动Spring Boot应用
        SpringApplication.run(ExperimentManageSystemApplication.class, args);
        System.out.println("===== 实验管理系统 启动成功 =====");
    }

}