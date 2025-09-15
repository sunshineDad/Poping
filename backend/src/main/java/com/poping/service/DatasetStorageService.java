package com.poping.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 简单的OSS存储实现，当前写入本地文件系统
 */
@Service
public class DatasetStorageService {

    private static final Logger logger = LoggerFactory.getLogger(DatasetStorageService.class);

    private final Path basePath;

    public DatasetStorageService(@Value("${app.upload.path:./uploads/}") String uploadPath) {
        this.basePath = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.basePath);
        } catch (IOException e) {
            throw new IllegalStateException("无法创建上传目录: " + uploadPath, e);
        }
    }

    /**
     * 将文件保存到本地并返回存储信息
     */
    public StoredFileMetadata store(String datasetId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("上传文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String fileId = UUID.randomUUID().toString();
        String storedName = extension == null ? fileId : fileId + "." + extension;

        Path datasetPath = this.basePath
                .resolve("datasets")
                .resolve(LocalDate.now().toString())
                .resolve(datasetId)
                .normalize();
        Files.createDirectories(datasetPath);

        Path target = datasetPath.resolve(storedName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }

        String storagePath = this.basePath.relativize(target).toString().replace('\\', '/');
        String downloadUrl = "/uploads/" + storagePath;

        logger.info("Stored dataset file {} for dataset {} at {}", originalFilename, datasetId, storagePath);

        StoredFileMetadata metadata = new StoredFileMetadata();
        metadata.setFileId(fileId);
        metadata.setStoredName(storedName);
        metadata.setStoragePath(storagePath);
        metadata.setDownloadUrl(downloadUrl);
        metadata.setSize(file.getSize());
        metadata.setContentType(file.getContentType());
        metadata.setOriginalFilename(originalFilename);
        return metadata;
    }

    /**
     * 上传结果
     */
    public static class StoredFileMetadata {
        private String fileId;
        private String originalFilename;
        private String storedName;
        private String storagePath;
        private String downloadUrl;
        private String contentType;
        private long size;

        public String getFileId() {
            return fileId;
        }

        public void setFileId(String fileId) {
            this.fileId = fileId;
        }

        public String getOriginalFilename() {
            return originalFilename;
        }

        public void setOriginalFilename(String originalFilename) {
            this.originalFilename = originalFilename;
        }

        public String getStoredName() {
            return storedName;
        }

        public void setStoredName(String storedName) {
            this.storedName = storedName;
        }

        public String getStoragePath() {
            return storagePath;
        }

        public void setStoragePath(String storagePath) {
            this.storagePath = storagePath;
        }

        public String getDownloadUrl() {
            return downloadUrl;
        }

        public void setDownloadUrl(String downloadUrl) {
            this.downloadUrl = downloadUrl;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }

        public long getSize() {
            return size;
        }

        public void setSize(long size) {
            this.size = size;
        }
    }
}
