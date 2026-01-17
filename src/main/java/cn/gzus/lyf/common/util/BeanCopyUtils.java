package cn.gzus.lyf.common.util;

import org.apache.commons.beanutils.BeanUtils;
import java.util.ArrayList;
import java.util.List;

public class BeanCopyUtils {

    /**
     * 复制对象列表，将源列表中的每个对象复制到目标类型的新对象中
     *
     * @param sourceList  源对象列表
     * @param targetClass 目标对象的 Class
     * @return 目标对象列表
     */
    public static <T> List<T> copyList(List<?> sourceList, Class<T> targetClass) {
        List<T> targetList = new ArrayList<>(sourceList.size());
        for (Object source : sourceList) {
            try {
                // 创建目标对象实例
                T target = targetClass.getDeclaredConstructor().newInstance();
                // 复制属性（仅复制同名且类型兼容的属性）
                BeanUtils.copyProperties(target, source);
                targetList.add(target);
            } catch (Exception e) {
                throw new RuntimeException("对象列表复制失败: " + e.getMessage(), e);
            }
        }
        return targetList;
    }

    /**
     * 复制对象列表，将源列表中的每个对象复制到目标类型的新对象中
     *
     * @param sourceObject 源对象
     * @param targetClass  目标对象的 Class
     * @return 目标对象
     */
    public static <T> T copy(Object sourceObject, Class<T> targetClass) {
        try {
            // 创建目标对象实例
            T target = targetClass.getDeclaredConstructor().newInstance();
            // 复制属性（仅复制同名且类型兼容的属性）
            BeanUtils.copyProperties(target, sourceObject);
            return target;
        } catch (Exception e) {
            throw new RuntimeException("对象列表失败: " + e.getMessage(), e);
        }
    }
}
