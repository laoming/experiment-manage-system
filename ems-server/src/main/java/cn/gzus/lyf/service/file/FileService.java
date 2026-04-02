package cn.gzus.lyf.service.file;

import cn.gzus.lyf.common.config.MinioConfig;
import cn.gzus.lyf.common.exception.BusinessException;
import cn.gzus.lyf.dao.FileDAO;
import cn.gzus.lyf.dao.entity.FileEntity;
import io.minio.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Date;
import java.util.UUID;

@Service
public class FileService {

    private MinioClient minioClient;
    private MinioConfig minioConfig;
    private FileDAO fileDAO;

    @Autowired
    public void setMinioClient(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @Autowired
    public void setMinioConfig(MinioConfig minioConfig) {
        this.minioConfig = minioConfig;
    }

    @Autowired
    public void setFileDAO(FileDAO fileDAO) {
        this.fileDAO = fileDAO;
    }

    /**
     * 上传文件
     *
     * @param file 文件
     * @param uploaderId 上传者ID
     * @return 文件对象名称（用于后续通过 /file/access 或 /file/download 访问）
     */
    public String upload(MultipartFile file, String uploaderId) {
        String bucketName = minioConfig.getBucketName();
        try {
            // 检查存储桶是否存在，不存在则创建
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
            if (!bucketExists) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
            }

            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = UUID.randomUUID().toString().replace("-", "") + extension;

            // 上传文件 - 使用 try-with-resources 确保输入流正确关闭
            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build());
            } catch (Exception e) {
                throw new BusinessException("文件上传失败: " + e.getMessage());
            }

            // 保存文件信息到数据库
            FileEntity fileEntity = new FileEntity();
            fileEntity.setId(UUID.randomUUID().toString().replace("-", ""));
            fileEntity.setObjectName(objectName);
            fileEntity.setOriginalName(originalFilename);
            fileEntity.setFileSize(file.getSize());
            fileEntity.setContentType(file.getContentType());
            fileEntity.setUploaderId(uploaderId);
            fileEntity.setCreateTime(new Date());
            fileDAO.save(fileEntity);

            // 返回文件对象名称，通过后端 /file/access 或 /file/download 接口访问（永久有效）
            return objectName;
        } catch (Exception e) {
            throw new BusinessException("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 根据对象名称获取文件信息
     *
     * @param objectName 文件对象名称
     * @return 文件信息实体
     */
    public FileEntity getFileInfoByObjectName(String objectName) {
        return fileDAO.getByObjectName(objectName);
    }



    /**
     * 下载文件
     *
     * @param objectName 文件对象名称
     * @return 文件输入流
     */
    public InputStream download(String objectName) {
        String bucketName = minioConfig.getBucketName();
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            throw new BusinessException("文件下载失败: " + e.getMessage());
        }
    }

    /**
     * 获取文件信息
     *
     * @param objectName 文件对象名称
     * @return 文件信息
     */
    public StatObjectResponse getFileInfo(String objectName) {
        String bucketName = minioConfig.getBucketName();
        try {
            return minioClient.statObject(StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            throw new BusinessException("获取文件信息失败: " + e.getMessage());
        }
    }

    /**
     * 删除文件
     *
     * @param objectName 文件对象名称
     */
    public void delete(String objectName) {
        String bucketName = minioConfig.getBucketName();
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            throw new BusinessException("文件删除失败: " + e.getMessage());
        }
    }
}