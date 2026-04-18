package cn.gzus.lyf.service.notice;

import cn.gzus.lyf.common.dto.MessageQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.dao.MessageDAO;
import cn.gzus.lyf.dao.UserDAO;
import cn.gzus.lyf.dao.entity.MessageEntity;
import cn.gzus.lyf.dao.entity.UserEntity;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class MessageService {

    private MessageDAO messageDAO;
    private UserDAO userDAO;

    @Autowired
    public void setMessageDAO(MessageDAO messageDAO) {
        this.messageDAO = messageDAO;
    }

    @Autowired
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    public PageDto<MessageEntity> getMessagePage(int current, int size, MessageQueryDto messageQueryDto) {
        return messageDAO.getMessagePage(current, size, messageQueryDto);
    }

    public boolean addMessage(MessageEntity messageEntity) {
        Objects.requireNonNull(messageEntity, "消息实体不能为空");
        Objects.requireNonNull(messageEntity.getTitle(), "消息标题不能为空");
        Objects.requireNonNull(messageEntity.getContent(), "消息内容不能为空");
        Objects.requireNonNull(messageEntity.getReceiverId(), "接收人不能为空");
        Objects.requireNonNull(messageEntity.getCreatorId(), "创建人不能为空");

        UserEntity receiver = userDAO.getById(messageEntity.getReceiverId());
        Objects.requireNonNull(receiver, "接收人不存在");
        messageEntity.setReceiverName(receiver.getDisplayName());

        if (StringUtils.isEmpty(messageEntity.getCreatorName())) {
            UserEntity creator = userDAO.getById(messageEntity.getCreatorId());
            Objects.requireNonNull(creator, "创建人不存在");
            messageEntity.setCreatorName(creator.getDisplayName());
        }

        if (messageEntity.getStatus() == null) {
            messageEntity.setStatus(0);
        }
        return messageDAO.addMessage(messageEntity);
    }

    public boolean deleteMessage(String id) {
        return messageDAO.deleteMessage(id);
    }

    public List<MessageEntity> getMessageListByReceiver(String receiverId, Integer status, int limit) {
        return messageDAO.getMessageListByReceiver(receiverId, status, limit);
    }

    public boolean markAsRead(String id) {
        return messageDAO.updateMessageStatus(id, 1);
    }

    public long getUnreadCountByReceiver(String receiverId) {
        return messageDAO.getUnreadCountByReceiver(receiverId);
    }
}
