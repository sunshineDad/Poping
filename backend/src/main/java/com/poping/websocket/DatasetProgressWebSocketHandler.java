package com.poping.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.poping.dto.DatasetProgressMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 数据集进度WebSocket处理器
 */
@Component
public class DatasetProgressWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(DatasetProgressWebSocketHandler.class);

    private final ObjectMapper objectMapper;
    private final Map<String, SessionSubscription> subscriptions = new ConcurrentHashMap<>();

    public DatasetProgressWebSocketHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        subscriptions.put(session.getId(), new SessionSubscription(session));
        logger.debug("WebSocket session {} established", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode node = objectMapper.readTree(message.getPayload());
        if (!node.has("type")) {
            return;
        }

        String type = node.get("type").asText();
        if ("subscribe".equalsIgnoreCase(type)) {
            String datasetId = node.has("datasetId") ? node.get("datasetId").asText() : "*";
            subscriptions.computeIfPresent(session.getId(), (key, subscription) -> {
                subscription.setDatasetId(datasetId);
                return subscription;
            });
            logger.debug("Session {} subscribed to dataset {}", session.getId(), datasetId);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        subscriptions.remove(session.getId());
        logger.debug("WebSocket session {} closed", session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.warn("WebSocket transport error", exception);
        subscriptions.remove(session.getId());
        super.handleTransportError(session, exception);
    }

    /**
     * 广播进度信息
     */
    public void broadcast(DatasetProgressMessage message) {
        subscriptions.values().forEach(subscription -> {
            if (subscription.isInterestedIn(message.getDatasetId())) {
                try {
                    subscription.getSession().sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                } catch (IOException e) {
                    logger.error("Failed to send progress message", e);
                }
            }
        });
    }

    private static class SessionSubscription {
        private final WebSocketSession session;
        private String datasetId = "*";

        private SessionSubscription(WebSocketSession session) {
            this.session = session;
        }

        public WebSocketSession getSession() {
            return session;
        }

        public void setDatasetId(String datasetId) {
            this.datasetId = datasetId == null || datasetId.isEmpty() ? "*" : datasetId;
        }

        public boolean isInterestedIn(String datasetId) {
            return "*".equals(this.datasetId) || this.datasetId.equals(datasetId);
        }
    }
}
