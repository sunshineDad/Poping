package com.poping.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.poping.dto.DatasetCreateRequest;
import com.poping.dto.DatasetDetailResponse;
import com.poping.dto.DatasetFileResponse;
import com.poping.dto.DatasetListResponse;
import com.poping.dto.DatasetSummaryResponse;
import com.poping.entity.Dataset;
import com.poping.entity.DatasetFile;
import com.poping.repository.DatasetFileRepository;
import com.poping.repository.DatasetRepository;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 数据集业务服务
 */
@Service
public class DatasetService {

    private static final Logger logger = LoggerFactory.getLogger(DatasetService.class);

    private static final String STATUS_DELETED = "DELETED";

    private final DatasetRepository datasetRepository;
    private final DatasetFileRepository datasetFileRepository;
    private final DatasetStorageService datasetStorageService;
    private final DatasetProcessingService datasetProcessingService;

    public DatasetService(DatasetRepository datasetRepository,
                          DatasetFileRepository datasetFileRepository,
                          DatasetStorageService datasetStorageService,
                          DatasetProcessingService datasetProcessingService) {
        this.datasetRepository = datasetRepository;
        this.datasetFileRepository = datasetFileRepository;
        this.datasetStorageService = datasetStorageService;
        this.datasetProcessingService = datasetProcessingService;
    }

    /**
     * 创建数据集
     */
    @Transactional(rollbackFor = Exception.class)
    public DatasetDetailResponse createDataset(DatasetCreateRequest request, MultipartFile[] files, String ownerId) throws Exception {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("请至少上传一个数据文件");
        }

        List<String> tagInput = request.getTags() == null ? new ArrayList<>() : request.getTags();
        List<String> tags = tagInput.stream()
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .distinct()
                .limit(3)
                .collect(Collectors.toList());

        Dataset dataset = new Dataset();
        dataset.setDatasetId(UUID.randomUUID().toString());
        dataset.setOwnerId(ownerId);
        dataset.setTitle(request.getTitle());
        dataset.setDescription(request.getDescription());
        dataset.setType(request.getType());
        dataset.setTags(tags);
        dataset.setStatus("PROCESSING");
        dataset.setParseProgress(0);
        dataset.setRecordCount(0);
        dataset.setFileCount(0);
        dataset.setTotalSize(0L);
        dataset.setCreatedAt(LocalDateTime.now());
        dataset.setUpdatedAt(LocalDateTime.now());

        datasetRepository.insert(dataset);

        long totalSize = 0L;
        List<DatasetFileResponse> fileResponses = new ArrayList<>();
        for (MultipartFile file : files) {
            DatasetStorageService.StoredFileMetadata metadata = datasetStorageService.store(dataset.getDatasetId(), file);

            DatasetFile datasetFile = new DatasetFile();
            datasetFile.setDatasetId(dataset.getDatasetId());
            datasetFile.setFileId(metadata.getFileId());
            datasetFile.setOriginalName(metadata.getOriginalFilename());
            datasetFile.setStoredName(metadata.getStoredName());
            datasetFile.setFileType(metadata.getContentType());
            datasetFile.setFileSize(metadata.getSize());
            datasetFile.setStoragePath(metadata.getStoragePath());
            datasetFile.setDownloadUrl(metadata.getDownloadUrl());
            datasetFile.setStatus("UPLOADED");
            datasetFile.setCreatedAt(LocalDateTime.now());
            datasetFile.setUpdatedAt(LocalDateTime.now());
            datasetFileRepository.insert(datasetFile);

            totalSize += metadata.getSize();
            fileResponses.add(toFileResponse(datasetFile));
        }

        dataset.setFileCount(fileResponses.size());
        dataset.setTotalSize(totalSize);
        dataset.setUpdatedAt(LocalDateTime.now());
        datasetRepository.updateById(dataset);

        DatasetDetailResponse response = toDetailResponse(dataset, fileResponses);

        datasetProcessingService.startProcessing(dataset.getDatasetId());

        logger.info("Created dataset {} for user {}", dataset.getDatasetId(), ownerId);
        return response;
    }

    /**
     * 数据集列表
     */
    public DatasetListResponse listDatasets(String ownerId, int page, int size, String keyword, String type, String status) {
        QueryWrapper<Dataset> wrapper = new QueryWrapper<>();
        wrapper.eq("owner_id", ownerId)
                .ne("status", STATUS_DELETED);

        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(q -> q.like("title", keyword).or().like("description", keyword));
        }
        if (StringUtils.isNotBlank(type)) {
            wrapper.eq("dataset_type", type);
        }
        if (StringUtils.isNotBlank(status)) {
            wrapper.eq("status", status);
        }
        wrapper.orderByDesc("created_at");

        Page<Dataset> pageParam = new Page<>(page, size);
        IPage<Dataset> datasetPage = datasetRepository.selectPage(pageParam, wrapper);

        List<DatasetSummaryResponse> summaries = datasetPage.getRecords().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        DatasetListResponse response = new DatasetListResponse();
        response.setItems(summaries);
        response.setTotal(datasetPage.getTotal());
        response.setPage(datasetPage.getCurrent());
        response.setSize(datasetPage.getSize());
        return response;
    }

    /**
     * 获取详情
     */
    public DatasetDetailResponse getDatasetDetail(String datasetId, String ownerId) {
        Dataset dataset = datasetRepository.selectOne(new QueryWrapper<Dataset>()
                .eq("dataset_id", datasetId)
                .eq("owner_id", ownerId)
                .ne("status", STATUS_DELETED));
        if (dataset == null) {
            throw new IllegalArgumentException("数据集不存在或无权访问");
        }

        List<DatasetFile> datasetFiles = datasetFileRepository.selectList(new QueryWrapper<DatasetFile>()
                .eq("dataset_id", datasetId)
                .orderByAsc("created_at"));

        List<DatasetFileResponse> fileResponses = datasetFiles.stream()
                .map(this::toFileResponse)
                .collect(Collectors.toList());

        return toDetailResponse(dataset, fileResponses);
    }

    /**
     * 删除数据集
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteDataset(String datasetId, String ownerId) {
        UpdateWrapper<Dataset> wrapper = new UpdateWrapper<>();
        wrapper.eq("dataset_id", datasetId)
                .eq("owner_id", ownerId)
                .set("status", STATUS_DELETED)
                .set("updated_at", LocalDateTime.now());
        int updated = datasetRepository.update(null, wrapper);
        if (updated == 0) {
            throw new IllegalArgumentException("数据集不存在或无权删除");
        }
        logger.info("Dataset {} marked as deleted", datasetId);
    }

    private DatasetSummaryResponse toSummaryResponse(Dataset dataset) {
        DatasetSummaryResponse response = new DatasetSummaryResponse();
        response.setDatasetId(dataset.getDatasetId());
        response.setTitle(dataset.getTitle());
        response.setDescription(dataset.getDescription());
        response.setType(dataset.getType());
        response.setTags(dataset.getTags());
        response.setStatus(dataset.getStatus());
        response.setParseProgress(dataset.getParseProgress());
        response.setRecordCount(dataset.getRecordCount());
        response.setFileCount(dataset.getFileCount());
        response.setTotalSize(dataset.getTotalSize());
        response.setCreatedAt(dataset.getCreatedAt());
        response.setUpdatedAt(dataset.getUpdatedAt());
        return response;
    }

    private DatasetDetailResponse toDetailResponse(Dataset dataset, List<DatasetFileResponse> files) {
        DatasetDetailResponse response = new DatasetDetailResponse();
        response.setDatasetId(dataset.getDatasetId());
        response.setTitle(dataset.getTitle());
        response.setDescription(dataset.getDescription());
        response.setType(dataset.getType());
        response.setTags(dataset.getTags());
        response.setStatus(dataset.getStatus());
        response.setParseProgress(dataset.getParseProgress());
        response.setRecordCount(dataset.getRecordCount());
        response.setFileCount(dataset.getFileCount());
        response.setTotalSize(dataset.getTotalSize());
        response.setCreatedAt(dataset.getCreatedAt());
        response.setUpdatedAt(dataset.getUpdatedAt());
        response.setFiles(files);
        return response;
    }

    private DatasetFileResponse toFileResponse(DatasetFile datasetFile) {
        DatasetFileResponse response = new DatasetFileResponse();
        response.setFileId(datasetFile.getFileId());
        response.setOriginalName(datasetFile.getOriginalName());
        response.setStoredName(datasetFile.getStoredName());
        response.setFileType(datasetFile.getFileType());
        response.setFileSize(datasetFile.getFileSize());
        response.setDownloadUrl(datasetFile.getDownloadUrl());
        response.setStatus(datasetFile.getStatus());
        return response;
    }
}
