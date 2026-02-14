package cn.gzus.lyf.controller.notice;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.TodoQueryDto;
import cn.gzus.lyf.dao.entity.TodoEntity;
import cn.gzus.lyf.service.notice.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
     * 完成待办
     */
    @PostMapping("/complete")
    public Result<Boolean> completeTodo(@RequestBody TodoEntity todoEntity) {
        return Result.success(todoService.completeTodo(todoEntity.getId()));
    }
}
