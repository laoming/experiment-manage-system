package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.dto.MessageQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.MessageEntity;
import cn.gzus.lyf.dao.mapper.MessageMapper;
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
public class MessageDAO extends ServiceImpl<MessageMapper, MessageEntity> {

    public boolean addMessage(MessageEntity messageEntity) {
        Objects.requireNonNull(messageEntity, "消息实体不能为空");
        Objects.requireNonNull(messageEntity.getTitle(), "消息标题不能为空");
        Objects.requireNonNull(messageEntity.getContent(), "消息内容不能为空");
        Objects.requireNonNull(messageEntity.getReceiverId(), "接收人不能为空");
        return this.save(messageEntity);
    }

    public boolean deleteMessage(String id) {
        Objects.requireNonNull(id, "消息ID不能为空");
        return this.removeById(id);
    }

    public PageDto<MessageEntity> getMessagePage(Integer current, Integer size, MessageQueryDto messageQueryDto) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        IPage<MessageEntity> messagePage = this.page(new Page<>(current, size), Wrappers.<MessageEntity>lambdaQuery()
                .like(StringUtils.isNotEmpty(messageQueryDto.getTitle()), MessageEntity::getTitle, messageQueryDto.getTitle())
                .eq(StringUtils.isNotEmpty(messageQueryDto.getReceiverId()), MessageEntity::getReceiverId, messageQueryDto.getReceiverId())
                .eq(messageQueryDto.getStatus() != null, MessageEntity::getStatus, messageQueryDto.getStatus())
                .orderByAsc(MessageEntity::getStatus)
                .orderByDesc(MessageEntity::getCreateTime)
        );
        return BeanCopyUtils.copy(messagePage, PageDto.class);
    }

    public List<MessageEntity> getMessageListByReceiver(String receiverId, Integer status, int limit) {
        if (receiverId == null || receiverId.trim().isEmpty()) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<MessageEntity> queryWrapper = Wrappers.<MessageEntity>lambdaQuery()
                .eq(MessageEntity::getReceiverId, receiverId);
        if (status != null) {
            queryWrapper.eq(MessageEntity::getStatus, status);
        }
        queryWrapper.orderByAsc(MessageEntity::getStatus)
                .orderByDesc(MessageEntity::getCreateTime);
        if (limit > 0) {
            queryWrapper.last("limit " + limit);
        }
        return this.list(queryWrapper);
    }

    public boolean updateMessageStatus(String id, Integer status) {
        Objects.requireNonNull(id, "消息ID不能为空");
        Objects.requireNonNull(status, "消息状态不能为空");
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setId(id);
        messageEntity.setStatus(status);
        messageEntity.setUpdateTime(new Date());
        return this.updateById(messageEntity);
    }
}
