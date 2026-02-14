package cn.gzus.lyf.controller.auth;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.common.dto.Result;
import cn.gzus.lyf.common.dto.SimpleUserDto;
import cn.gzus.lyf.common.dto.UserQueryDto;
import cn.gzus.lyf.dao.entity.UserEntity;
import cn.gzus.lyf.service.auth.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 用户管理
 */
@RestController
@RequestMapping("/user")
public class UserController {

    private UserService userService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }


    /**
     * 分页查询用户
     */
    @PostMapping("/page")
    public Result<PageDto<UserEntity>> getUserPage(int current, int size, @RequestBody UserQueryDto userQueryDto) {
        return Result.success(userService.getUserPage(current, size, userQueryDto));
    }

    /**
     * 新增用户
     */
    @PostMapping("/add")
    public Result<Boolean> addUser(@RequestBody UserEntity userEntity) {
        return Result.success(userService.addUser(userEntity));
    }

    /**
     * 更新用户信息
     */
    @PostMapping("/update")
    public Result<Boolean> updateUser(@RequestBody UserEntity userEntity) {
        return Result.success(userService.updateUser(userEntity));
    }

    /**
     * 重置用户密码
     */
    @PostMapping("/resetPassword")
    public Result<Boolean> resetPassword(@RequestBody UserEntity userEntity) {
        return Result.success(userService.resetPassword(userEntity));
    }

    /**
     * 删除用户(硬删除，删除数据库记录数据)
     */
    @PostMapping("/delete")
    public Result<Boolean> deleteUser(@RequestBody UserEntity userEntity) {
        return Result.success(userService.deleteUser(userEntity.getId()));
    }

    /**
     * 获取简单用户列表
     */
    @PostMapping("/simpleList")
    public Result<List<SimpleUserDto>> getSimpleUserList() {
        return Result.success(userService.getSimpleUserList());
    }
}
