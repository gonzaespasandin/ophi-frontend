import { createRouter, createWebHistory } from 'vue-router'
import {suscribeToAuthObserver} from "./services/auth.js";

import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import ScannerView from './views/ScannerView.vue'
import ProfileView from './views/ProfileView.vue'
import RegisterView from "./views/RegisterView.vue";
import SearchView from "./views/SearchView.vue";
import HistoryView from "./views/HistoryView.vue";
import FirstView from "./views/FirstView.vue";
import ProductView from './views/ProductView.vue';
import NotFoundView from './views/NotFoundView.vue';
import SearchListView from './views/SearchListView.vue';
import AddNewProfileView from "./views/AddNewProfileView.vue";

// TODO: Implement named routes
const routes = [
    {
        'path': '/welcome',
        'component': FirstView,
        'meta': { 'auth': false }
    },
    {
        'path': '/login',
        'component': LoginView,
        'meta': { 'auth': false }
    },
    {
        'path': '/register',
        'component': RegisterView,
        'meta': { 'auth': false }
    },
    {
        'path': '/',
        'component': HomeView,
        'meta': { 'auth': true }
    },
    {
        'path': '/profile',
        'component': ProfileView,
        'meta': { 'auth': true }
    },
    {
        'path': '/scanner',
        'component': ScannerView,
        'meta': { 'auth': true }
    },
    {
        'path': '/search',
        'component': SearchView,
        'meta': { 'auth': true }
    },
    {
        'path': '/history',
        'component': HistoryView,
        'meta': { 'auth': true }
    },
    {
        'path': '/product/:name/:brand',
        'component': ProductView,
        'meta': { 'auth': true }
    },
    {
        'path': '/not-found',
        'component': NotFoundView,
        'meta': { 'auth': true }
    },
    {
        'path': '/search-list/:search',
        'component': SearchListView,
        'meta': { 'auth': true }
    },
    {
        'path': '/add-new-profile',
        'component': AddNewProfileView,
        'meta': { 'auth': true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

let user = {}

suscribeToAuthObserver((state) => user = state)

router.beforeEach((to) => {
    if(to.meta.auth && user.id === null) {
        return '/welcome'
    }
})

export default router