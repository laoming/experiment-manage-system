/**
 * 表单验证工具函数
 */

const ValidatorUtils = {
    /**
     * 验证必填
     * @param {string} value - 值
     * @returns {boolean} 是否有效
     */
    required(value) {
        return value !== null && value !== undefined && String(value).trim() !== '';
    },

    /**
     * 验证邮箱
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * 验证手机号
     * @param {string} phone - 手机号
     * @returns {boolean} 是否有效
     */
    phone(phone) {
        const regex = /^1[3-9]\d{9}$/;
        return regex.test(phone);
    },

    /**
     * 验证密码长度
     * @param {string} password - 密码
     * @param {number} minLength - 最小长度
     * @returns {boolean} 是否有效
     */
    passwordLength(password, minLength = 6) {
        return password && password.length >= minLength;
    },

    /**
     * 验证两次密码是否一致
     * @param {string} password1 - 密码1
     * @param {string} password2 - 密码2
     * @returns {boolean} 是否一致
     */
    passwordMatch(password1, password2) {
        return password1 === password2;
    },

    /**
     * 验证数字
     * @param {string|number} value - 值
     * @returns {boolean} 是否为数字
     */
    number(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    /**
     * 验证整数
     * @param {string|number} value - 值
     * @returns {boolean} 是否为整数
     */
    integer(value) {
        return Number.isInteger(Number(value));
    },

    /**
     * 验证数字范围
     * @param {number} value - 值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {boolean} 是否在范围内
     */
    range(value, min, max) {
        const num = Number(value);
        return num >= min && num <= max;
    },

    /**
     * 验证用户名
     * @param {string} username - 用户名
     * @returns {boolean} 是否有效
     */
    username(username) {
        const regex = /^[a-zA-Z0-9_]{4,20}$/;
        return regex.test(username);
    }
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidatorUtils;
}
