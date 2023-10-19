import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import TDesign from 'tdesign-mobile-vue';
import 'tdesign-mobile-vue/es/style/index.css';

const app = createApp(App)
app.use(TDesign)
app.mount('#app')