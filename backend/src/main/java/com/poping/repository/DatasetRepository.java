package com.poping.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.poping.entity.Dataset;
import org.apache.ibatis.annotations.Mapper;

/**
 * 数据集仓储
 */
@Mapper
public interface DatasetRepository extends BaseMapper<Dataset> {
}
