package cn.gzus.lyf.common.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * 用户 DTO，扩展 Spring Security 的 User 类
 * 用于存储用户显示名称等额外信息
 */
public class UserDto extends User {

    /**
     * 用户ID
     */
    private String id;

    /**
     * 显示名称
     */
    private String displayName;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 用户状态
     */
    private Integer status;

    /**
     * 角色ID
     */
    private String roleId;

    /**
     * 构造函数（基础）
     * @param username 用户名
     * @param password 密码
     * @param authorities 权限列表
     */
    public UserDto(String username, String password, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
    }

    /**
     * 构造函数（包含显示名称）
     * @param username 用户名
     * @param password 密码
     * @param authorities 权限列表
     * @param displayName 显示名称
     */
    public UserDto(String username, String password, Collection<? extends GrantedAuthority> authorities, String displayName) {
        super(username, password, authorities);
        this.displayName = displayName;
    }

    /**
     * 构造函数（完整）
     * @param username 用户名
     * @param password 密码
     * @param enabled 账号是否启用
     * @param accountNonExpired 账号是否未过期
     * @param credentialsNonExpired 凭证是否未过期
     * @param accountNonLocked 账号是否未锁定
     * @param authorities 权限列表
     * @param id 用户ID
     * @param displayName 显示名称
     * @param email 邮箱
     * @param phone 手机号
     * @param status 用户状态
     */
    public UserDto(String username, String password, boolean enabled, boolean accountNonExpired,
                   boolean credentialsNonExpired, boolean accountNonLocked,
                   Collection<? extends GrantedAuthority> authorities,
                   String id, String displayName, String email, String phone, Integer status) {
        super(username, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
        this.id = id;
        this.displayName = displayName;
        this.email = email;
        this.phone = phone;
        this.status = status;
    }

    /**
     * 构造函数（从UserBuilder构建）
     * @param builder UserBuilder
     */
    private UserDto(Builder builder) {
        super(builder.username, builder.password, builder.enabled, builder.accountNonExpired,
               builder.credentialsNonExpired, builder.accountNonLocked, builder.authorities);
        this.id = builder.id;
        this.displayName = builder.displayName;
        this.email = builder.email;
        this.phone = builder.phone;
        this.status = builder.status;
    }

    /**
     * 获取用户ID
     * @return 用户ID
     */
    public String getId() {
        return id;
    }

    /**
     * 设置用户ID
     * @param id 用户ID
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * 获取显示名称
     * @return 显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 设置显示名称
     * @param displayName 显示名称
     */
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    /**
     * 获取邮箱
     * @return 邮箱
     */
    public String getEmail() {
        return email;
    }

    /**
     * 设置邮箱
     * @param email 邮箱
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * 获取手机号
     * @return 手机号
     */
    public String getPhone() {
        return phone;
    }

    /**
     * 设置手机号
     * @param phone 手机号
     */
    public void setPhone(String phone) {
        this.phone = phone;
    }

    /**
     * 获取用户状态
     * @return 用户状态
     */
    public Integer getStatus() {
        return status;
    }

    /**
     * 设置用户状态
     * @param status 用户状态
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

    /**
     * 获取角色ID
     * @return 角色ID
     */
    public String getRoleId() {
        return roleId;
    }

    /**
     * 设置角色ID
     * @param roleId 角色ID
     */
    public void setRoleId(String roleId) {
        this.roleId = roleId;
    }

    /**
     * Builder类，用于构建UserDto
     */
    public static class Builder {
        private String username;
        private String password;
        private boolean enabled = true;
        private boolean accountNonExpired = true;
        private boolean credentialsNonExpired = true;
        private boolean accountNonLocked = true;
        private Collection<? extends GrantedAuthority> authorities;
        private String id;
        private String displayName;
        private String email;
        private String phone;
        private Integer status;
        private String roleId;

        public Builder(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public Builder authorities(Collection<? extends GrantedAuthority> authorities) {
            this.authorities = authorities;
            return this;
        }

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder displayName(String displayName) {
            this.displayName = displayName;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder status(Integer status) {
            this.status = status;
            return this;
        }

        public Builder roleId(String roleId) {
            this.roleId = roleId;
            return this;
        }

        public UserDto build() {
            return new UserDto(this);
        }
    }
}
