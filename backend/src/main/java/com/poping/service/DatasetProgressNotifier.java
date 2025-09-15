package com.poping.service;

import com.poping.dto.DatasetProgressMessage;
import com.poping.websocket.DatasetProgressWebSocketHandler;
import org.springframework.stereotype.Service;

/**
 * 数据集进度通知服务
 */
@Service
public class DatasetProgressNotifier {

    private final DatasetProgressWebSocketHandler webSocketHandler;

    public DatasetProgressNotifier(DatasetProgressWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    public void sendProgress(DatasetProgressMessage message) {
        webSocketHandler.broadcast(message);
    }
}
