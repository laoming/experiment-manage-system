package cn.gzus.lyf.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

/**
 * 系统用户表实体类
 */
@TableName("user")
public class UserEntity {

    /**
     * 用户ID
     */
    private String id;

    /**
     * 用户名（账号）
     */
    private String username;

    /**
     * 密码（摘要值）
     */
    private String password;

    /**
     * 状态：0-禁用，1-正常
     */
    private Integer status;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;


    // getter & setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

}