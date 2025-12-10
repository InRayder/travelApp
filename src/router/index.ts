import { createRouter, createWebHistory } from 'vue-router'
import ItineraryView from '../views/ItineraryView.vue'
import GuidesView from '../views/GuidesView.vue'
import AccountingView from '../views/AccountingView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'itinerary',
            component: ItineraryView
        },
        {
            path: '/guides',
            name: 'guides',
            component: GuidesView
        },
        {
            path: '/accounting',
            name: 'accounting',
            component: AccountingView
        },
        {
            path: '/conversation',
            name: 'conversation',
            component: () => import('../views/ConversationView.vue')
        },
        {
            path: '/checklist',
            name: 'checklist',
            component: () => import('../views/ChecklistView.vue')
        },
        {
            path: '/vlog-script',
            name: 'vlog-script',
            component: () => import('../views/VlogScriptView.vue')
        },
        {
            path: '/ai-camera',
            name: 'ai-camera',
            component: () => import('../views/AiCameraView.vue')
        }
    ]
})

router.beforeEach((to, _from, next) => {
    // Check if we have share target params
    if (to.path === '/' && (to.query.title || to.query.text || to.query.url)) {
        console.log('Share target params detected:', to.query)
        next({
            name: 'guides',
            query: to.query
        })
    } else {
        next()
    }
})

export default router
