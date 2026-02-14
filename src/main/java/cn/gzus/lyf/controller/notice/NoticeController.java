package cn.gzus.lyf.controller.notice;

import cn.gzus.lyf.common.dto.NoticeQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.dao.entity.NoticeEntity;
import cn.gzus.lyf.service.notice.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 公告管理
 */
@RestController
@RequestMapping("/notice")
public class NoticeController {

    private NoticeService noticeService;

    @Autowired
    public void setNoticeService(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    /**
     * 公告分页查询
     */
    @PostMapping("/page")
    public Result<PageDto<NoticeEntity>> getNoticePage(int current, int size, @RequestBody NoticeQueryDto noticeQueryDto) {
        return Result.success(noticeService.getNoticePage(current, size, noticeQueryDto));
    }

    /**
     * 新增公告
     */
    @PostMapping("/add")
    public Result<Boolean> addNotice(@RequestBody NoticeEntity noticeEntity) {
        return Result.success(noticeService.addNotice(noticeEntity));
    }

    /**
     * 删除公告
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteNotice(@RequestBody NoticeEntity noticeEntity) {
        return Result.success(noticeService.deleteNotice(noticeEntity.getId()));
    }

    /**
     * 获取最新公告列表
     */
    @PostMapping("/list")
    public Result<List<NoticeEntity>> getLatestNotices(Integer limit) {
        int finalLimit = limit == null ? 20 : limit;
        return Result.success(noticeService.getLatestNotices(finalLimit));
    }
}
