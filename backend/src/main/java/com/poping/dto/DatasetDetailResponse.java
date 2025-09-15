package com.poping.dto;

import java.util.List;

/**
 * 数据集详情响应
 */
public class DatasetDetailResponse extends DatasetSummaryResponse {

    private List<DatasetFileResponse> files;

    public List<DatasetFileResponse> getFiles() {
        return files;
    }

    public void setFiles(List<DatasetFileResponse> files) {
        this.files = files;
    }
}
