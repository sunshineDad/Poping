package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.poping.entity.DatasetFile;
import org.apache.ibatis.annotations.Mapper;

/**
 * 数据集文件仓储
 */
@Mapper
public interface DatasetFileRepository extends BaseMapper<DatasetFile> {
}
