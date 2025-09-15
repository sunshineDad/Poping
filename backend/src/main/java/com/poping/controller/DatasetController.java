package com.poping.controller;

import com.poping.dto.DatasetCreateRequest;
import com.poping.dto.DatasetDetailResponse;
import com.poping.dto.DatasetListResponse;
import com.poping.service.DatasetService;
import com.poping.util.ApiResponse;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

/**
 * 数据集管理控制器
 */
@RestController
@RequestMapping("/api/v1/datasets")
@Validated
public class DatasetController {

    private static final Logger logger = LoggerFactory.getLogger(DatasetController.class);

    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DatasetDetailResponse>> createDataset(
            @Valid @RequestPart("metadata") DatasetCreateRequest metadata,
            @RequestPart("files") MultipartFile[] files,
            HttpServletRequest request) {
        try {
            String userId = getCurrentUserId(request);
            DatasetDetailResponse response = datasetService.createDataset(metadata, files, userId);
            return ResponseEntity.ok(ApiResponse.success("数据集创建成功", response));
        } catch (Exception ex) {
            logger.error("Failed to create dataset", ex);
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DatasetListResponse>> listDatasets(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        try {
            String userId = getCurrentUserId(request);
            DatasetListResponse response = datasetService.listDatasets(userId, page, size, keyword, type, status);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception ex) {
            logger.error("Failed to list datasets", ex);
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/{datasetId}")
    public ResponseEntity<ApiResponse<DatasetDetailResponse>> getDatasetDetail(
            @PathVariable String datasetId,
            HttpServletRequest request) {
        try {
            String userId = getCurrentUserId(request);
            DatasetDetailResponse response = datasetService.getDatasetDetail(datasetId, userId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception ex) {
            logger.error("Failed to fetch dataset detail", ex);
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }

    @DeleteMapping("/{datasetId}")
    public ResponseEntity<ApiResponse<Void>> deleteDataset(
            @PathVariable String datasetId,
            HttpServletRequest request) {
        try {
            String userId = getCurrentUserId(request);
            datasetService.deleteDataset(datasetId, userId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception ex) {
            logger.error("Failed to delete dataset", ex);
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }

    private String getCurrentUserId(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr != null) {
            return userIdAttr.toString();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && StringUtils.isNotBlank(authentication.getName())) {
            return authentication.getName();
        }

        throw new IllegalStateException("无法识别当前用户");
    }
}
