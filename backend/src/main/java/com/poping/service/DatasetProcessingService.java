package com.poping.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.poping.dto.DatasetProgressMessage;
import com.poping.entity.Dataset;
import com.poping.repository.DatasetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

/**
 * 数据集处理流程服务
 */
@Service
public class DatasetProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(DatasetProcessingService.class);

    private final DatasetRepository datasetRepository;
    private final DatasetProgressNotifier progressNotifier;

    public DatasetProcessingService(DatasetRepository datasetRepository,
                                    DatasetProgressNotifier progressNotifier) {
        this.datasetRepository = datasetRepository;
        this.progressNotifier = progressNotifier;
    }

    /**
     * 异步启动解析流程
     */
    public void startProcessing(String datasetId) {
        CompletableFuture.runAsync(() -> processDataset(datasetId));
    }

    private void processDataset(String datasetId) {
        Dataset dataset = datasetRepository.selectOne(new QueryWrapper<Dataset>()
                .eq("dataset_id", datasetId));
        if (dataset == null) {
            logger.warn("Dataset {} not found when starting processing", datasetId);
            return;
        }

        try {
            updateProgress(dataset, "PROCESSING", 5, "解析任务已提交");

            // TODO: 调用真实的文件解析逻辑
            simulateProgress(dataset, 30, "校验数据文件");
            simulateProgress(dataset, 60, "提取数据内容");
            simulateProgress(dataset, 85, "生成结构化数据");

            parseFiles(dataset);

            completeDataset(dataset);
        } catch (Exception ex) {
            logger.error("Failed to process dataset {}", datasetId, ex);
            failDataset(dataset, ex.getMessage());
        }
    }

    private void simulateProgress(Dataset dataset, int progress, String message) throws InterruptedException {
        Thread.sleep(800);
        updateProgress(dataset, "PROCESSING", progress, message);
    }

    private void parseFiles(Dataset dataset) {
        // TODO: 解析数据文件并写入数据库或对象存储
        logger.debug("Parse dataset {} files - TODO implementation", dataset.getDatasetId());
    }

    private void completeDataset(Dataset dataset) {
        dataset.setStatus("READY");
        dataset.setParseProgress(100);
        dataset.setUpdatedAt(LocalDateTime.now());
        dataset.setErrorMessage(null);
        datasetRepository.updateById(dataset);

        DatasetProgressMessage message = buildMessage(dataset, "数据集解析完成");
        progressNotifier.sendProgress(message);
    }

    private void failDataset(Dataset dataset, String errorMessage) {
        dataset.setStatus("FAILED");
        dataset.setErrorMessage(errorMessage);
        dataset.setUpdatedAt(LocalDateTime.now());
        datasetRepository.updateById(dataset);

        DatasetProgressMessage message = buildMessage(dataset, errorMessage == null ? "数据集解析失败" : errorMessage);
        progressNotifier.sendProgress(message);
    }

    private void updateProgress(Dataset dataset, String status, int progress, String message) {
        dataset.setStatus(status);
        dataset.setParseProgress(progress);
        dataset.setUpdatedAt(LocalDateTime.now());

        UpdateWrapper<Dataset> wrapper = new UpdateWrapper<>();
        wrapper.eq("dataset_id", dataset.getDatasetId())
                .set("status", status)
                .set("parse_progress", progress)
                .set("updated_at", dataset.getUpdatedAt());
        datasetRepository.update(null, wrapper);

        DatasetProgressMessage progressMessage = buildMessage(dataset, message);
        progressNotifier.sendProgress(progressMessage);
    }

    private DatasetProgressMessage buildMessage(Dataset dataset, String message) {
        DatasetProgressMessage progressMessage = new DatasetProgressMessage();
        progressMessage.setDatasetId(dataset.getDatasetId());
        progressMessage.setProgress(dataset.getParseProgress());
        progressMessage.setStatus(dataset.getStatus());
        progressMessage.setMessage(message);
        progressMessage.setTimestamp(LocalDateTime.now());
        return progressMessage;
    }
}
