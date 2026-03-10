package cn.gzus.lyf.common.enums;

/**
 * 实验报告状态枚举
 */
public enum ReportStatusEnum {

    /**
     * 待提交（从未编辑过，没有数据库记录）
     */
    PENDING("pending", "待提交"),

    /**
     * 草稿（已编辑保存但未提交）
     */
    DRAFT("draft", "草稿"),

    /**
     * 已提交
     */
    SUBMITTED("submitted", "已提交"),

    /**
     * 已退回
     */
    RETURNED("returned", "已退回"),

    /**
     * 已评价
     */
    GRADED("graded", "已评价");

    private final String code;
    private final String description;

    ReportStatusEnum(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    /**
     * 根据代码获取枚举
     * @param code 代码
     * @return 枚举值
     */
    public static ReportStatusEnum fromCode(String code) {
        for (ReportStatusEnum status : ReportStatusEnum.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
