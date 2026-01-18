package cn.gzus.lyf.common.constant;

public enum RoleStatusEnum {

    /**
     * 正常
     */
    ACTIVE(1, "正常"),
    /**
     * 禁用
     */
    DISABLED(0, "禁用"),
    ;

    private final int code;

    private final String desc;

    // 构造方法
    RoleStatusEnum(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public int getCode() {
        return code;
    }
}
