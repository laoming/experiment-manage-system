/**
 * 统一请求拦截器
 * 确保所有请求自动带上token和统一的错误处理
 */

(function() {
    // 保存原始的fetch方法
    const originalFetch = window.fetch;

    // 重写fetch方法
    window.fetch = function(url, options = {}) {
        // 如果不是以http或https开头的绝对路径，则添加ems前缀
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // 如果URL还没有ems前缀，则添加
            if (!url.startsWith('/ems')) {
                url = '/ems' + (url.startsWith('/') ? '' : '/') + url;
            }
        }

        // 克隆options对象，避免修改原始options
        const newOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        // 从localStorage获取token并添加到请求头（登录接口除外）
        const token = localStorage.getItem('token');
        if (token && !url.includes('/auth/login')) {
            newOptions.headers['Authorization'] = 'Bearer ' + token;
            console.log(`[请求] 已添加token到请求头`);
        }

        console.log(`[请求] ${newOptions.method || 'GET'} ${url}`);

        // 调用原始fetch方法
        return originalFetch(url, newOptions)
            .then(async response => {
                console.log(`[响应] ${newOptions.method || 'GET'} ${url} - ${response.status}`);

                // 如果响应状态是401，说明token过期或未授权
                if (response.status === 401) {
                    console.warn('[拦截器] Token已过期或无效');
                    // 清除token
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');

                    // 跳转到登录页
                    if (!url.includes('/auth/login')) {
                        window.location.href = '/ems/pages/index.html';
                    }

                    // 抛出错误
                    const error = new Error('登录已过期，请重新登录');
                    error.status = 401;
                    throw error;
                }

                // 检查响应是否为空或非JSON
                const contentType = response.headers.get('content-type');
                if (!response.ok) {
                    // HTTP错误状态
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                if (!contentType || !contentType.includes('application/json')) {
                    // 如果响应不是JSON，尝试解析或返回空对象
                    try {
                        const text = await response.text();
                        console.log(`[响应] 非JSON响应:`, text);
                        try {
                            return JSON.parse(text || '{}');
                        } catch (e) {
                            return { code: 200, data: null, message: 'success' };
                        }
                    } catch (error) {
                        console.error('[拦截器] 读取响应失败:', error);
                        throw new Error('读取响应失败');
                    }
                }

                // 解析JSON响应
                try {
                    const data = await response.json();
                    console.log(`[响应] JSON数据:`, data);
                    return data;
                } catch (error) {
                    console.error('[拦截器] JSON解析失败:', error);
                    throw new Error('响应解析失败');
                }
            })
            .then(data => {
                // 统一处理业务错误
                if (data.code !== 200 && data.code !== undefined) {
                    console.error('[拦截器] 业务错误:', data.message);
                    // 不抛出错误，让调用者处理
                }
                return data;
            })
            .catch(error => {
                console.error('[拦截器] 请求失败:', error);

                // 如果是401错误，已经在上面处理过了，直接抛出
                if (error.status === 401) {
                    throw error;
                }

                // 其他错误，统一返回错误格式
                return {
                    code: 500,
                    message: error.message || '网络请求失败',
                    data: null
                };
            });
    };
})();

console.log('✅ 请求拦截器已加载，所有请求将自动添加token');
