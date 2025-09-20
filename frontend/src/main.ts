import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './tailwind.css'
import './style.css'
import './styles/variables.css'
import './styles/notifications.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import IconComponents from './components/IconComponents.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 全局注册IconComponents组件
app.component('IconComponents', IconComponents)

app.mount('#app')
