package cn.gzus.lyf.constant;

public enum UserStatusEnum {

    /**
     * 已删除
     */
    DELETED(0, "已删除"),
    /**
     * 激活
     */
    ACTIVE(1, "激活"),
    /**
     * 已锁定
     */
    LOCK(2, "已锁定"),
    ;
    private final int code;

    private final String desc;

    // 构造方法
    UserStatusEnum(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public int getCode() {
        return code;
    }
}
