package com.spaceship.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = System.getenv("DATABASE_URL");
        if (url != null && url.startsWith("postgresql://")) {
            URI uri = URI.create(url.replace("postgresql://", "http://"));
            String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + uri.getPort() + uri.getPath();
            properties.setUrl(jdbcUrl);
            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                properties.setUsername(userInfo.split(":")[0]);
                properties.setPassword(userInfo.split(":")[1]);
            }
        }
        return properties.initializeDataSourceBuilder().build();
    }
}
