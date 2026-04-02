# 前端项目结构说明

## 目录结构

```
static/
├── assets/             # 静态资源
│   ├── components/     # 公共组件
│   │   ├── pagination.js        # 分页组件
│   │   ├── pagination.css
│   │   ├── modal.js              # 弹窗组件
│   │   ├── modal.css
│   │   ├── status-badge.js       # 状态徽章组件
│   │   ├── status-badge.css
│   │   ├── loading.js            # 加载组件
│   │   ├── loading.css
│   │   ├── empty.js              # 空状态组件
│   │   └── empty.css
│   ├── global.css      # 全局样式
│   └── README.md       # 本文件
├── layouts/            # 布局组件
│   ├── header.js       # 头部组件（引用）
│   ├── app-layout.js   # 应用布局
│   └── app-layout.css
├── modules/            # 业务模块（保持原有结构）
├── router/             # 路由配置
│   └── router.js
├── utils/              # 工具函数
│   ├── request.js      # 请求拦截器
│   ├── format.js       # 格式化工具
│   ├── validator.js    # 验证工具
│   ├── message.js      # 消息提示
│   └── message.css
├── common/             # 公共资源（逐步迁移）
│   ├── css/
│   ├── js/
│   └── pages/
└── main.js             # 应用入口
```

## 使用说明

### 1. 在页面中引入资源

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
    
    <!-- 引入全局样式 -->
    <link rel="stylesheet" href="/ems/assets/global.css">
    
    <!-- 引入组件样式 -->
    <link rel="stylesheet" href="/ems/assets/components/pagination.css">
    <link rel="stylesheet" href="/ems/assets/components/modal.css">
    <link rel="stylesheet" href="/ems/assets/components/status-badge.css">
    <link rel="stylesheet" href="/ems/assets/components/loading.css">
    <link rel="stylesheet" href="/ems/assets/components/empty.css">
    
    <!-- 引入消息提示样式 -->
    <link rel="stylesheet" href="/ems/utils/message.css">
    
    <!-- 引入布局样式 -->
    <link rel="stylesheet" href="/ems/layouts/app-layout.css">
    
    <!-- 引入现有样式 -->
    <link rel="stylesheet" href="/ems/common/css/common.css">
</head>
<body>
    <div id="app">
        <!-- 页面内容 -->
    </div>

    <!-- 引入 Vue -->
    <script src="https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.global.js"></script>
    
    <!-- 引入工具函数 -->
    <script src="/ems/utils/request.js"></script>
    <script src="/ems/utils/format.js"></script>
    <script src="/ems/utils/validator.js"></script>
    <script src="/ems/utils/message.js"></script>
    
    <!-- 引入公共组件 -->
    <script src="/ems/assets/components/pagination.js"></script>
    <script src="/ems/assets/components/modal.js"></script>
    <script src="/ems/assets/components/status-badge.js"></script>
    <script src="/ems/assets/components/loading.js"></script>
    <script src="/ems/assets/components/empty.js"></script>
    
    <!-- 引入布局组件 -->
    <script src="/ems/layouts/app-layout.js"></script>
    
    <!-- 引入现有公共脚本 -->
    <script src="/ems/common/js/auth.js"></script>
    <script src="/ems/common/js/header-component.js"></script>
    <script src="/ems/common/js/tabs-manager.js"></script>
    
    <!-- 引入路由 -->
    <script src="/ems/router/router.js"></script>
    
    <!-- 引入应用入口 -->
    <script src="/ems/main.js"></script>
    
    <!-- 引入页面脚本 -->
    <script src="/ems/modules/xxx/xxx.js"></script>
</body>
</html>
```

### 2. 使用公共组件

#### 分页组件

```html
<pagination
    :current="pagination.current"
    :pages="pagination.pages"
    :total="pagination.total"
    @page-change="handlePageChange"
></pagination>
```

```javascript
methods: {
    handlePageChange(page) {
        this.pagination.current = page;
        this.fetchData();
    }
}
```

#### 弹窗组件

```html
<modal
    :visible="showModal"
    title="编辑用户"
    @close="showModal = false"
    @confirm="handleSubmit"
>
    <form @submit.prevent="handleSubmit">
        <div class="form-group">
            <label class="form-label">用户名称</label>
            <input v-model="formData.username" type="text" class="form-input">
        </div>
    </form>
</modal>
```

#### 状态徽章组件

```html
<status-badge :status="user.status"></status-badge>
```

或者使用自定义映射：

```html
<status-badge
    :status="user.status"
    :status-map="customStatusMap"
></status-badge>
```

```javascript
customStatusMap: {
    1: { text: '正常', type: 'success' },
    2: { text: '禁用', type: 'warning' }
}
```

#### 加载组件

```html
<loading text="加载中..." :overlay="true"></loading>
```

#### 空状态组件

```html
<empty
    icon="📭"
    text="暂无数据"
    description="暂无任何用户数据"
    action-text="新增用户"
    @action="handleAdd"
></empty>
```

### 3. 使用工具函数

#### 格式化工具

```javascript
// 格式化日期时间
this.formatDateTime(user.createTime);

// 格式化日期
this.formatDate(user.createTime);

// 格式化文件大小
this.$format.formatFileSize(fileSize);
```

#### 验证工具

```javascript
// 验证必填
if (!this.$validator.required(this.formData.username)) {
    this.showError('用户名不能为空');
}

// 验证邮箱
if (!this.$validator.email(this.formData.email)) {
    this.showError('邮箱格式不正确');
}

// 验证密码
if (!this.$validator.passwordLength(this.formData.password, 6)) {
    this.showError('密码长度不能少于6位');
}
```

#### 消息提示

```javascript
// 显示成功消息
this.showSuccess('操作成功');

// 显示错误消息
this.showError('操作失败');

// 显示警告消息
this.showWarning('请注意');

// 显示确认对话框
const confirmed = await this.showConfirm('确定要删除吗？');
if (confirmed) {
    this.handleDelete();
}
```

#### 路由跳转

```javascript
// 根据路由键跳转
this.$router.navigate('user');

// 获取路由信息
const route = this.$router.getRoute('user');
```

### 4. 使用布局组件

```html
<div id="app" v-cloak>
    <app-layout>
        <!-- 页面内容 -->
        <div class="page-content">
            <div class="page-header">
                <h1 class="page-title">用户管理</h1>
            </div>
            
            <div class="toolbar">
                <div class="search-box">
                    <input v-model="queryForm.username" type="text" class="search-input" placeholder="输入用户名搜索">
                    <button class="btn btn-primary" @click="handleSearch">搜索</button>
                </div>
                <button class="btn btn-success" @click="handleAdd">新增用户</button>
            </div>
            
            <!-- 表格内容 -->
            <div class="table-container">
                <table class="user-table">
                    <!-- ... -->
                </table>
            </div>
            
            <!-- 分页 -->
            <pagination
                :current="pagination.current"
                :pages="pagination.pages"
                :total="pagination.total"
                @page-change="handlePageChange"
            ></pagination>
        </div>
    </app-layout>
</div>
```

## 迁移指南

### 从旧代码迁移到新组件

#### 1. 替换分页代码

**旧代码：**
```html
<div class="pagination" v-if="userList.length > 0">
    <button class="pagination-btn" :disabled="pagination.current === 1" @click="handlePageChange(pagination.current - 1)">
        上一页
    </button>
    <span class="pagination-info">
        第 {{ pagination.current }} / {{ pagination.pages }} 页
        <span class="pagination-total">共 {{ pagination.total }} 条记录</span>
    </span>
    <button class="pagination-btn" :disabled="pagination.current >= pagination.pages" @click="handlePageChange(pagination.current + 1)">
        下一页
    </button>
    <div class="pagination-jump">
        <span>跳至</span>
        <input type="number" class="pagination-jump-input" v-model.number="jumpPage" min="1" :max="pagination.pages" @keyup.enter="handleJumpPage">
        <span>页</span>
        <button class="pagination-jump-btn" @click="handleJumpPage">跳转</button>
    </div>
</div>
```

**新代码：**
```html
<pagination
    :current="pagination.current"
    :pages="pagination.pages"
    :total="pagination.total"
    @page-change="handlePageChange"
></pagination>
```

#### 2. 替换弹窗代码

**旧代码：**
```html
<div class="modal-overlay" v-show="showUserModal" style="display: none;" @click.self="closeUserModal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>{{ userModalMode === 'add' ? '新增用户' : '编辑用户' }}</h2>
            <button class="modal-close" @click="closeUserModal">✕</button>
        </div>
        <div class="modal-body">
            <form @submit.prevent="handleUserSubmit">
                <!-- 表单内容 -->
            </form>
        </div>
    </div>
</div>
```

**新代码：**
```html
<modal
    :visible="showUserModal"
    :title="userModalMode === 'add' ? '新增用户' : '编辑用户'"
    @close="showUserModal = false"
    @confirm="handleUserSubmit"
>
    <form @submit.prevent="handleUserSubmit">
        <!-- 表单内容 -->
    </form>
</modal>
```

#### 3. 替换加载状态代码

**旧代码：**
```html
<div v-if="loading" class="loading">
    <div class="loading-spinner"></div>
    <p>加载中...</p>
</div>
```

**新代码：**
```html
<loading v-if="loading"></loading>
```

#### 4. 替换空状态代码

**旧代码：**
```html
<tr v-if="userList.length === 0">
    <td colspan="9" class="empty-cell">
        <div class="empty-content">
            <div class="empty-icon">📭</div>
            <p>暂无数据</p>
        </div>
    </td>
</tr>
```

**新代码：**
```html
<tr v-if="userList.length === 0">
    <td colspan="9">
        <empty icon="📭" text="暂无数据"></empty>
    </td>
</tr>
```

## 组件 API 文档

### Pagination 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| current | Number | 1 | 当前页码 |
| pages | Number | 0 | 总页数 |
| total | Number | 0 | 总记录数 |
| showTotal | Boolean | true | 是否显示总数 |
| showJumper | Boolean | true | 是否显示跳转 |

| 事件 | 参数 | 说明 |
|------|------|------|
| page-change | page | 页码变化时触发 |

### Modal 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 是否显示 |
| title | String | '提示' | 标题 |
| size | String | 'default' | 尺寸：small/default/large |
| closeOnClickOverlay | Boolean | true | 点击遮罩关闭 |
| showClose | Boolean | true | 显示关闭按钮 |
| showFooter | Boolean | true | 显示底部 |

| 事件 | 参数 | 说明 |
|------|------|------|
| close | - | 关闭时触发 |
| confirm | - | 确定时触发 |

| 插槽 | 说明 |
|------|------|
| default | 内容 |
| footer | 底部 |

### StatusBadge 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| status | Number/String | 必填 | 状态值 |
| statusMap | Object | 默认映射 | 状态映射 |

### Loading 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | String | '加载中...' | 提示文本 |
| size | String | 'default' | 尺寸：small/default/large |
| overlay | Boolean | false | 是否全屏遮罩 |
| backgroundColor | String | 'rgba(255, 255, 255, 0.9)' | 遮罩背景色 |

### Empty 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| icon | String | '📭' | 图标 |
| text | String | '暂无数据' | 提示文本 |
| description | String | '' | 描述 |
| actionText | String | '' | 操作按钮文本 |

| 事件 | 参数 | 说明 |
|------|------|------|
| action | - | 点击操作按钮触发 |

## 工具函数 API

### FormatUtils

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| formatDateTime | date | String | 格式化日期时间 |
| formatDate | date | String | 格式化日期 |
| formatTime | date | String | 格式化时间 |
| formatFileSize | bytes | String | 格式化文件大小 |
| formatNumber | num | String | 格式化数字（千分位） |

### ValidatorUtils

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| required | value | Boolean | 验证必填 |
| email | email | Boolean | 验证邮箱 |
| phone | phone | Boolean | 验证手机号 |
| passwordLength | password, minLength | Boolean | 验证密码长度 |
| passwordMatch | password1, password2 | Boolean | 验证密码一致性 |
| number | value | Boolean | 验证数字 |
| integer | value | Boolean | 验证整数 |
| range | value, min, max | Boolean | 验证数字范围 |
| username | username | Boolean | 验证用户名 |

### MessageUtils

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| success | message, duration | void | 显示成功消息 |
| error | message, duration | void | 显示错误消息 |
| warning | message, duration | void | 显示警告消息 |
| info | message, duration | void | 显示信息消息 |
| confirm | message | Promise<boolean> | 显示确认对话框 |

## 注意事项

1. 所有组件都已经在 `main.js` 中自动注册为全局组件，可以直接使用
2. 工具函数通过 `this.$format`, `this.$validator`, `this.$message`, `this.$router` 访问
3. 全局 Mixin 提供了一些常用方法，如 `formatDateTime`, `showSuccess`, `showError`, `showConfirm` 等
4. 请确保在页面中正确引入所有必要的资源文件
5. 组件的样式使用了 CSS 变量和现代 CSS 特性，请确保浏览器兼容性

## 后续优化计划

1. 逐步迁移 `common/` 目录下的代码到新结构
2. 统一所有模块的代码风格
3. 添加更多的公共组件（如表单、上传等）
4. 优化性能和加载速度
5. 添加单元测试
