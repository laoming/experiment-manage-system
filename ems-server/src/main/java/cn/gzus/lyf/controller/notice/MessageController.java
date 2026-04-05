package cn.gzus.lyf.controller.notice;

import cn.gzus.lyf.common.dto.MessageQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.UserDto;
import cn.gzus.lyf.dao.entity.MessageEntity;
import cn.gzus.lyf.service.notice.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 消息管理
 */
@RestController
@RequestMapping("/message")
public class MessageController {

    private MessageService messageService;

    @Autowired
    public void setMessageService(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * 获取当前登录用户ID
     * @return 用户ID
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDto) {
            return ((UserDto) principal).getId();
        }
        return null;
    }

    /**
     * 消息分页查询
     */
    @PostMapping("/page")
    public Result<PageDto<MessageEntity>> getMessagePage(int current, int size, @RequestBody MessageQueryDto messageQueryDto) {
        return Result.success(messageService.getMessagePage(current, size, messageQueryDto));
    }

    /**
     * 新增消息
     */
    @PostMapping("/add")
    public Result<Boolean> addMessage(@RequestBody MessageEntity messageEntity) {
        return Result.success(messageService.addMessage(messageEntity));
    }

    /**
     * 删除消息
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteMessage(@RequestBody MessageEntity messageEntity) {
        return Result.success(messageService.deleteMessage(messageEntity.getId()));
    }

    /**
     * 获取用户消息列表
     */
    @PostMapping("/listByUser")
    public Result<List<MessageEntity>> getMessageListByUser(String receiverId, Integer status, Integer limit) {
        int finalLimit = limit == null ? 20 : limit;
        return Result.success(messageService.getMessageListByReceiver(receiverId, status, finalLimit));
    }

    /**
     * 获取当前用户的消息列表（未读）
     */
    @GetMapping("/myMessages")
    public Result<List<MessageEntity>> getMyMessages(@RequestParam(defaultValue = "5") int limit) {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        return Result.success(messageService.getMessageListByReceiver(userId, 0, limit));
    }

    /**
     * 首页消息列表（分页，当前用户所有消息，未读优先，时间倒序）
     */
    @GetMapping("/homeList")
    public Result<PageDto<MessageEntity>> getMyMessagesPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        MessageQueryDto queryDto = new MessageQueryDto();
        queryDto.setReceiverId(userId);
        // 查询所有消息，排序在DAO层处理（未读优先，时间倒序）
        return Result.success(messageService.getMessagePage(page, size, queryDto));
    }

    /**
     * 标记消息为已读
     */
    @PostMapping("/markRead")
    public Result<Boolean> markAsRead(@RequestBody MessageEntity messageEntity) {
        return Result.success(messageService.markAsRead(messageEntity.getId()));
    }

    /**
     * 获取当前用户未读消息数量
     */
    @PostMapping("/unreadCount")
    public Result<Long> getUnreadCount() {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        return Result.success(messageService.getUnreadCount(userId));
    }
}
