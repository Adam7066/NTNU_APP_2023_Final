import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import 'tdesign-mobile-vue/es/style/index.css'
import {createPinia} from "pinia"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.mount('#app')