package com.poping.config;

import com.poping.websocket.DatasetProgressWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket配置
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final DatasetProgressWebSocketHandler datasetProgressWebSocketHandler;

    public WebSocketConfig(DatasetProgressWebSocketHandler datasetProgressWebSocketHandler) {
        this.datasetProgressWebSocketHandler = datasetProgressWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(datasetProgressWebSocketHandler, "/ws/datasets")
                .setAllowedOriginPatterns("*");
    }
}
