import { defineStore } from 'pinia'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
    id: string
    type: NotificationType
    message: string
    duration?: number // duration in ms, 0 for infinite
}

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [] as Notification[]
    }),
    actions: {
        add(message: string, type: NotificationType = 'info', duration: number = 5000) {
            const id = crypto.randomUUID()
            const notification: Notification = {
                id,
                type,
                message,
                duration
            }
            this.notifications.push(notification)

            if (duration > 0) {
                setTimeout(() => {
                    this.remove(id)
                }, duration)
            }
            return id
        },
        remove(id: string) {
            this.notifications = this.notifications.filter(n => n.id !== id)
        },
        clear() {
            this.notifications = []
        }
    }
})
