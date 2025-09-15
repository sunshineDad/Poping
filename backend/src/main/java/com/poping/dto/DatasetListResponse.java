package com.poping.dto;

import java.util.List;

/**
 * 数据集列表响应
 */
public class DatasetListResponse {

    private List<DatasetSummaryResponse> items;
    private long total;
    private long page;
    private long size;

    public List<DatasetSummaryResponse> getItems() {
        return items;
    }

    public void setItems(List<DatasetSummaryResponse> items) {
        this.items = items;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getPage() {
        return page;
    }

    public void setPage(long page) {
        this.page = page;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }
}
