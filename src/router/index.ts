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
        }
    ]
})

export default router
