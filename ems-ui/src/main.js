import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './styles/index.scss'

// 公共组件
import Pagination from './components/Pagination.vue'
import Modal from './components/Modal.vue'
import Loading from './components/Loading.vue'
import Empty from './components/Empty.vue'
import StatusBadge from './components/StatusBadge.vue'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册全局组件
app.component('Pagination', Pagination)
app.component('Modal', Modal)
app.component('Loading', Loading)
app.component('Empty', Empty)
app.component('StatusBadge', StatusBadge)

app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.mount('#app')
