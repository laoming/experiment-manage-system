package cn.gzus.lyf.controller.notice;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.TodoQueryDto;
import cn.gzus.lyf.common.dto.UserDto;
import cn.gzus.lyf.dao.entity.TodoEntity;
import cn.gzus.lyf.service.notice.TodoService;
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
 * 待办管理
 */
@RestController
@RequestMapping("/todo")
public class TodoController {

    private TodoService todoService;

    @Autowired
    public void setTodoService(TodoService todoService) {
        this.todoService = todoService;
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
     * 待办分页查询
     */
    @PostMapping("/page")
    public Result<PageDto<TodoEntity>> getTodoPage(int current, int size, @RequestBody TodoQueryDto todoQueryDto) {
        return Result.success(todoService.getTodoPage(current, size, todoQueryDto));
    }

    /**
     * 新增待办
     */
    @PostMapping("/add")
    public Result<Boolean> addTodo(@RequestBody TodoEntity todoEntity) {
        return Result.success(todoService.addTodo(todoEntity));
    }

    /**
     * 删除待办
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteTodo(@RequestBody TodoEntity todoEntity) {
        return Result.success(todoService.deleteTodo(todoEntity.getId()));
    }

    /**
     * 获取用户待办列表
     */
    @PostMapping("/listByUser")
    public Result<List<TodoEntity>> getTodoListByUser(String receiverId, Integer status, Integer limit) {
        int finalLimit = limit == null ? 20 : limit;
        return Result.success(todoService.getTodoListByReceiver(receiverId, status, finalLimit));
    }

    /**
     * 获取当前用户的待办列表（未完成）
     */
    @GetMapping("/myTodos")
    public Result<List<TodoEntity>> getMyTodos(@RequestParam(defaultValue = "5") int limit) {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        return Result.success(todoService.getTodoListByReceiver(userId, 0, limit));
    }

    /**
     * 首页消息列表（分页，当前用户所有消息，未读优先，时间倒序）
     */
    @GetMapping("/homeList")
    public Result<PageDto<TodoEntity>> getMyTodosPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = getCurrentUserId();
        if (userId == null) {
            return Result.error("未登录");
        }
        TodoQueryDto queryDto = new TodoQueryDto();
        queryDto.setReceiverId(userId);
        // 查询所有消息，排序在DAO层处理（未读优先，时间倒序）
        return Result.success(todoService.getTodoPage(page, size, queryDto));
    }

    /**
     * 完成待办
     */
    @PostMapping("/complete")
    public Result<Boolean> completeTodo(@RequestBody TodoEntity todoEntity) {
        return Result.success(todoService.completeTodo(todoEntity.getId()));
    }

    /**
     * 标记消息为已读
     */
    @PostMapping("/markRead")
    public Result<Boolean> markAsRead(@RequestBody TodoEntity todoEntity) {
        return Result.success(todoService.markAsRead(todoEntity.getId()));
    }
}
