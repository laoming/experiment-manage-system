package cn.gzus.lyf.common.exception;

import cn.gzus.lyf.common.constant.ResultCode;
import cn.gzus.lyf.common.dto.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 * 统一处理系统异常，返回标准格式错误信息
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);


    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Object> handleBusinessException(BusinessException e) {
        log.error("业务异常：{}", e.getMessage(), e);
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理空指针异常
     */
    @ExceptionHandler(NullPointerException.class)
    public Result<Object> handleNullPointerException(NullPointerException e) {
        log.error("空指针异常：{}", e.getMessage(), e);
        return Result.error(ResultCode.ERROR.getCode(), "系统内部错误");
    }

    /**
     * 处理其他未知异常
     */
    @ExceptionHandler(Exception.class)
    public Result<Object> handleException(Exception e) {
        log.error("系统异常：{}", e.getMessage(), e);
        return Result.error(ResultCode.ERROR.getCode(), e.getMessage());
    }
}
