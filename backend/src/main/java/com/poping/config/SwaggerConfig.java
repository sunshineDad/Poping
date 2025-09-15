package com.poping.config;

// 所有Swagger相关的import都已注释
/*
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.*;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;

import java.util.Arrays;
import java.util.List;
*/

/**
 * [文件概览]
 * - 目的: Swagger API文档配置，生成在线API文档
 * - 数据流: 代码注解 → Swagger → 生成文档 → 在线展示
 * - 核心数据: API接口信息、认证配置、文档元数据
 * - 关系: 扫描Controller注解，生成完整的API文档
 */
// 暂时禁用整个Swagger配置，避免启动问题
/*
@Configuration
public class SwaggerConfig {
    
    @Bean
    public Docket api() {
        return new Docket(DocumentationType.OAS_30)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.poping.controller"))
                .paths(PathSelectors.any())
                .build()
                .securitySchemes(securitySchemes())
                .securityContexts(securityContexts());
    }
    
    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("智能体服务平台 API 文档")
                .description("提供完整的RESTful API接口文档，支持用户管理、智能体服务、数据管理等功能")
                .version("1.0.0")
                .contact(new Contact("开发团队", "https://poping.ai", "dev@poping.ai"))
                .license("MIT License")
                .licenseUrl("https://opensource.org/licenses/MIT")
                .build();
    }
    
    private List<SecurityScheme> securitySchemes() {
        return Arrays.asList(
            new ApiKey("JWT", "Authorization", "header")
        );
    }
    
    private List<SecurityContext> securityContexts() {
        return Arrays.asList(
            SecurityContext.builder()
                .securityReferences(defaultAuth())
                .operationSelector(operationContext -> {
                    String path = operationContext.requestMappingPattern();
                    return !path.startsWith("/api/v1/auth/") && 
                           !path.startsWith("/api/v1/portal/");
                })
                .build()
        );
    }
    
    private List<SecurityReference> defaultAuth() {
        AuthorizationScope authorizationScope = new AuthorizationScope("global", "accessEverything");
        AuthorizationScope[] authorizationScopes = new AuthorizationScope[1];
        authorizationScopes[0] = authorizationScope;
        return Arrays.asList(
            new SecurityReference("JWT", authorizationScopes)
        );
    }
}
*/