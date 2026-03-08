package cn.gzus.lyf.controller.file;

import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.dao.entity.FileEntity;
import cn.gzus.lyf.service.file.FileService;
import io.minio.StatObjectResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/file")
public class FileController {

    private FileService fileService;

    @Autowired
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    /**
     * 获取当前登录用户ID
     *
     * @return 用户ID
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getName();
    }

    /**
     * 上传文件
     *
     * @param file 文件
     * @return 文件对象名称（用于后续通过 /file/access 或 /file/download 访问）
     */
    @PostMapping("/upload")
    public Result<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String uploaderId = getCurrentUserId();
        String objectName = fileService.upload(file, uploaderId);
        Map<String, String> data = new HashMap<>();
        data.put("objectName", objectName);
        data.put("fileName", file.getOriginalFilename());
        return Result.success(data);
    }

    /**
     * 通过后端代理安全访问文件（永久有效）
     *
     * @param objectName 文件对象名称
     * @return 文件流
     */
    @GetMapping("/access")
    public ResponseEntity<InputStreamResource> accessFile(@RequestParam("objectName") String objectName) {
        InputStream inputStream = fileService.download(objectName);
        StatObjectResponse minioInfo = fileService.getFileInfo(objectName);

        String contentType = minioInfo.contentType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "application/octet-stream";
        }

        // 从数据库获取原始文件名
        FileEntity fileEntity = fileService.getFileInfoByObjectName(objectName);
        String fileName = fileEntity != null && fileEntity.getOriginalName() != null
                ? fileEntity.getOriginalName()
                : objectName;

        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFileName + "\"")
                .body(new InputStreamResource(inputStream));
    }

    /**
     * 下载文件
     *
     * @param objectName 文件对象名称
     * @return 文件流
     */
    @GetMapping("/download")
    public ResponseEntity<InputStreamResource> download(@RequestParam("objectName") String objectName) {
        InputStream inputStream = fileService.download(objectName);
        StatObjectResponse minioInfo = fileService.getFileInfo(objectName);

        String contentType = minioInfo.contentType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "application/octet-stream";
        }

        // 从数据库获取原始文件名
        FileEntity fileEntity = fileService.getFileInfoByObjectName(objectName);
        String fileName = fileEntity != null && fileEntity.getOriginalName() != null
                ? fileEntity.getOriginalName()
                : objectName;

        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .body(new InputStreamResource(inputStream));
    }
}