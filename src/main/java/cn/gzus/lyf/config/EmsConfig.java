package cn.gzus.lyf.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("cn.gzus.lyf.dao.mapper")
public class EmsConfig {
}
