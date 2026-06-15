import './global.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'

// Service worker
import { registerSW } from 'virtual:pwa-register'

const intervalMS = 5 * 60 * 1000
let updateSW
updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        updateSW?.(true)
    },
    onRegistered(r) {
        r && setInterval(() => {
            r.update()
        }, intervalMS)
    }
})

createApp(App).use(router).mount('#app')
