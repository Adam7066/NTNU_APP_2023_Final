import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from "path"


if (!process.env.VITE_API_ENDPOINT) {
    process.env.VITE_API_ENDPOINT = "http://127.0.0.1:8000";
}

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
    plugins: [vue()],
})
