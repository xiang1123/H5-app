import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Lazyload } from 'vant'
import App from './App.vue'
import router from './router'
import 'amfe-flexible'
import 'vant/lib/index.css'
import '@/assets/styles/reset.scss'
import '@/assets/styles/common.scss'

const app = createApp(App)
const pinia = createPinia()

// 注册 Lazyload 指令
app.use(Lazyload, {
  lazyComponent: true,
})

app.use(pinia)
app.use(router)
app.mount('#app')