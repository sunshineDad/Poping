package com.poping.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * 数据集创建请求
 */
public class DatasetCreateRequest {

    @NotBlank(message = "数据集标题不能为空")
    private String title;

    @Size(max = 500, message = "数据集描述不能超过500个字符")
    private String description;

    @NotBlank(message = "请选择数据集类型")
    private String type;

    @NotEmpty(message = "请至少选择一个标签")
    @Size(max = 3, message = "最多选择3个标签")
    private List<String> tags;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
