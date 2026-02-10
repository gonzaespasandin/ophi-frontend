import './global.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'

// Service worker
import { registerSW } from 'virtual:pwa-register'

const intervalMS = 60 * 60 * 1000
const updateSW = registerSW({
    onRegistered(r) {
        r && setInterval(() => {
            r.update()
        }, intervalMS)
    }
})

createApp(App).use(router).mount('#app')
