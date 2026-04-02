package cn.gzus.lyf.service.notice;

import cn.gzus.lyf.dao.NoticeDAO;
import cn.gzus.lyf.dao.UserDAO;
import cn.gzus.lyf.dao.entity.NoticeEntity;
import cn.gzus.lyf.dao.entity.UserEntity;
import cn.gzus.lyf.common.dto.NoticeQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class NoticeService {

    private NoticeDAO noticeDAO;
    private UserDAO userDAO;

    @Autowired
    public void setNoticeDAO(NoticeDAO noticeDAO) {
        this.noticeDAO = noticeDAO;
    }

    @Autowired
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    public PageDto<NoticeEntity> getNoticePage(int current, int size, NoticeQueryDto noticeQueryDto) {
        return noticeDAO.getNoticePage(current, size, noticeQueryDto);
    }

    public boolean addNotice(NoticeEntity noticeEntity) {
        Objects.requireNonNull(noticeEntity, "公告实体不能为空");
        Objects.requireNonNull(noticeEntity.getTitle(), "公告标题不能为空");
        Objects.requireNonNull(noticeEntity.getContent(), "公告内容不能为空");
        Objects.requireNonNull(noticeEntity.getCreatorId(), "发布人不能为空");

        if (StringUtils.isEmpty(noticeEntity.getCreatorName())) {
            UserEntity userEntity = userDAO.getById(noticeEntity.getCreatorId());
            Objects.requireNonNull(userEntity, "发布人不存在");
            noticeEntity.setCreatorName(userEntity.getDisplayName());
        }
        return noticeDAO.addNotice(noticeEntity);
    }

    public boolean deleteNotice(String id) {
        return noticeDAO.deleteNotice(id);
    }

    public List<NoticeEntity> getLatestNotices(int limit) {
        return noticeDAO.getLatestNotices(limit);
    }
}
