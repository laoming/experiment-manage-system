package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.TodoQueryDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.TodoEntity;
import cn.gzus.lyf.dao.mapper.TodoMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class TodoDAO extends ServiceImpl<TodoMapper, TodoEntity> {

    public boolean addTodo(TodoEntity todoEntity) {
        Objects.requireNonNull(todoEntity, "待办实体不能为空");
        Objects.requireNonNull(todoEntity.getTitle(), "待办标题不能为空");
        Objects.requireNonNull(todoEntity.getContent(), "待办内容不能为空");
        Objects.requireNonNull(todoEntity.getReceiverId(), "接收人不能为空");
        return this.save(todoEntity);
    }

    public boolean deleteTodo(String id) {
        Objects.requireNonNull(id, "待办ID不能为空");
        return this.removeById(id);
    }

    public PageDto<TodoEntity> getTodoPage(Integer current, Integer size, TodoQueryDto todoQueryDto) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        IPage<TodoEntity> todoPage = this.page(new Page<>(current, size), Wrappers.<TodoEntity>lambdaQuery()
                .like(StringUtils.isNotEmpty(todoQueryDto.getTitle()), TodoEntity::getTitle, todoQueryDto.getTitle())
                .eq(StringUtils.isNotEmpty(todoQueryDto.getReceiverId()), TodoEntity::getReceiverId, todoQueryDto.getReceiverId())
                .eq(todoQueryDto.getStatus() != null, TodoEntity::getStatus, todoQueryDto.getStatus())
                .orderByAsc(TodoEntity::getStatus)
                .orderByDesc(TodoEntity::getUpdateTime)
        );
        return BeanCopyUtils.copy(todoPage, PageDto.class);
    }

    public List<TodoEntity> getTodoListByReceiver(String receiverId, Integer status, int limit) {
        if (receiverId == null || receiverId.trim().isEmpty()) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<TodoEntity> queryWrapper = Wrappers.<TodoEntity>lambdaQuery()
                .eq(TodoEntity::getReceiverId, receiverId);
        if (status != null) {
            queryWrapper.eq(TodoEntity::getStatus, status);
        }
        queryWrapper.orderByAsc(TodoEntity::getStatus)
                .orderByDesc(TodoEntity::getCreateTime);
        if (limit > 0) {
            queryWrapper.last("limit " + limit);
        }
        return this.list(queryWrapper);
    }

    public boolean updateTodoStatus(String id, Integer status) {
        Objects.requireNonNull(id, "待办ID不能为空");
        Objects.requireNonNull(status, "待办状态不能为空");
        TodoEntity todoEntity = new TodoEntity();
        todoEntity.setId(id);
        todoEntity.setStatus(status);
        todoEntity.setUpdateTime(new Date());
        return this.updateById(todoEntity);
    }
}
