package cn.gzus.lyf.dao;

import cn.gzus.lyf.common.dto.NoticeQueryDto;
import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.util.BeanCopyUtils;
import cn.gzus.lyf.dao.entity.NoticeEntity;
import cn.gzus.lyf.dao.mapper.NoticeMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
public class NoticeDAO extends ServiceImpl<NoticeMapper, NoticeEntity> {

    public boolean addNotice(NoticeEntity noticeEntity) {
        Objects.requireNonNull(noticeEntity, "公告实体不能为空");
        Objects.requireNonNull(noticeEntity.getTitle(), "公告标题不能为空");
        Objects.requireNonNull(noticeEntity.getContent(), "公告内容不能为空");
        return this.save(noticeEntity);
    }

    public boolean deleteNotice(String id) {
        Objects.requireNonNull(id, "公告ID不能为空");
        return this.removeById(id);
    }

    public PageDto<NoticeEntity> getNoticePage(Integer current, Integer size, NoticeQueryDto noticeQueryDto) {
        Objects.requireNonNull(current, "当前页码不能为空");
        Objects.requireNonNull(size, "每页大小不能为空");

        IPage<NoticeEntity> noticePage = this.page(new Page<>(current, size), Wrappers.<NoticeEntity>lambdaQuery()
                .like(StringUtils.isNotEmpty(noticeQueryDto.getTitle()), NoticeEntity::getTitle, noticeQueryDto.getTitle())
                .like(StringUtils.isNotEmpty(noticeQueryDto.getCreatorName()), NoticeEntity::getCreatorName, noticeQueryDto.getCreatorName())
                .orderByDesc(NoticeEntity::getCreateTime)
        );
        return BeanCopyUtils.copy(noticePage, PageDto.class);
    }

    public List<NoticeEntity> getLatestNotices(int limit) {
        if (limit <= 0) {
            return Collections.emptyList();
        }
        return this.list(Wrappers.<NoticeEntity>lambdaQuery()
                .orderByDesc(NoticeEntity::getCreateTime)
                .last("limit " + limit));
    }
}
