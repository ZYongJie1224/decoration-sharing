import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import './assets/main.css'
import { useUserStore } from './stores/user'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
const userStore = useUserStore()
userStore.init()

app.mount('#app')