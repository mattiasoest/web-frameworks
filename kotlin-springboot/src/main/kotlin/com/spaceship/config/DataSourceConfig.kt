package com.spaceship.config

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import java.net.URI
import javax.sql.DataSource

@Configuration
class DataSourceConfig {
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    fun dataSourceProperties(): DataSourceProperties = DataSourceProperties()

    @Bean
    @Primary
    fun dataSource(properties: DataSourceProperties): DataSource {
        val url = System.getenv("DATABASE_URL")
        if (url != null && url.startsWith("postgresql://")) {
            val uri = URI.create(url.replace("postgresql://", "http://"))
            properties.url = "jdbc:postgresql://${uri.host}:${uri.port}${uri.path}"
            uri.userInfo?.split(":")?.let {
                properties.username = it[0]
                properties.password = it[1]
            }
        }
        return properties.initializeDataSourceBuilder().build()
    }
}
