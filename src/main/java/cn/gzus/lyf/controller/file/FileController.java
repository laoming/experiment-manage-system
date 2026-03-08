package cn.gzus.lyf.controller.file;

import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.service.file.FileService;
import io.minio.StatObjectResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
     * 上传文件
     *
     * @param file 文件
     * @return 文件访问URL
     */
    @PostMapping("/upload")
    public Result<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String url = fileService.upload(file);
        Map<String, String> data = new HashMap<>();
        data.put("url", url);
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
        StatObjectResponse fileInfo = fileService.getFileInfo(objectName);

        String contentType = fileInfo.contentType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "application/octet-stream";
        }

        String encodedFileName = URLEncoder.encode(objectName, StandardCharsets.UTF_8);

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
        StatObjectResponse fileInfo = fileService.getFileInfo(objectName);

        String contentType = fileInfo.contentType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "application/octet-stream";
        }

        String encodedFileName = URLEncoder.encode(objectName, StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .body(new InputStreamResource(inputStream));
    }
}