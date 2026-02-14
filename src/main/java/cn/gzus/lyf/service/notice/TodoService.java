package cn.gzus.lyf.service.notice;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.TodoQueryDto;
import cn.gzus.lyf.dao.TodoDAO;
import cn.gzus.lyf.dao.UserDAO;
import cn.gzus.lyf.dao.entity.TodoEntity;
import cn.gzus.lyf.dao.entity.UserEntity;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class TodoService {

    private TodoDAO todoDAO;
    private UserDAO userDAO;

    @Autowired
    public void setTodoDAO(TodoDAO todoDAO) {
        this.todoDAO = todoDAO;
    }

    @Autowired
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    public PageDto<TodoEntity> getTodoPage(int current, int size, TodoQueryDto todoQueryDto) {
        return todoDAO.getTodoPage(current, size, todoQueryDto);
    }

    public boolean addTodo(TodoEntity todoEntity) {
        Objects.requireNonNull(todoEntity, "待办实体不能为空");
        Objects.requireNonNull(todoEntity.getTitle(), "待办标题不能为空");
        Objects.requireNonNull(todoEntity.getContent(), "待办内容不能为空");
        Objects.requireNonNull(todoEntity.getReceiverId(), "接收人不能为空");
        Objects.requireNonNull(todoEntity.getCreatorId(), "创建人不能为空");

        UserEntity receiver = userDAO.getById(todoEntity.getReceiverId());
        Objects.requireNonNull(receiver, "接收人不存在");
        todoEntity.setReceiverName(receiver.getDisplayName());

        if (StringUtils.isEmpty(todoEntity.getCreatorName())) {
            UserEntity creator = userDAO.getById(todoEntity.getCreatorId());
            Objects.requireNonNull(creator, "创建人不存在");
            todoEntity.setCreatorName(creator.getDisplayName());
        }

        if (todoEntity.getStatus() == null) {
            todoEntity.setStatus(0);
        }
        return todoDAO.addTodo(todoEntity);
    }

    public boolean deleteTodo(String id) {
        return todoDAO.deleteTodo(id);
    }

    public List<TodoEntity> getTodoListByReceiver(String receiverId, Integer status, int limit) {
        return todoDAO.getTodoListByReceiver(receiverId, status, limit);
    }

    public boolean completeTodo(String id) {
        return todoDAO.updateTodoStatus(id, 1);
    }
}
