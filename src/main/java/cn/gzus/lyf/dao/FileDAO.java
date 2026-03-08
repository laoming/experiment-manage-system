package cn.gzus.lyf.dao;

import cn.gzus.lyf.dao.entity.FileEntity;
import cn.gzus.lyf.dao.mapper.FileMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class FileDAO extends ServiceImpl<FileMapper, FileEntity> {

    /**
     * 根据对象名称获取文件信息
     */
    public FileEntity getByObjectName(String objectName) {
        return this.getOne(new LambdaQueryWrapper<FileEntity>()
                .eq(FileEntity::getObjectName, objectName));
    }
}
