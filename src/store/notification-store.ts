import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '@/types/notification'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'

interface NotificationState {
    notifications: Notification[]
    unreadCount: number
    markAllAsRead: () => void
    markAsRead: (id: string) => void
    clearNotifications: () => void
    fetchNotifications: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            markAllAsRead: async () => {
                await authenticationService.markAsReadAllNotifications()
                set((state) => ({
                    notifications: state.notifications.map((notification) => ({
                        ...notification,
                        daDoc: true,
                    })),
                    unreadCount: 0,
                }))
            },

            clearNotifications: async () => {
                await authenticationService.clearAllNotifications()
                set({
                    notifications: [],
                    unreadCount: 0,
                })
            },

            fetchNotifications: async () => {
                try {
                    const response =
                        await authenticationService.getNotifications()
                    set({
                        notifications: response.data.results,
                        unreadCount: response.data.results.filter(
                            (notification: Notification) => !notification.daDoc
                        ).length,
                    })
                } catch (error) {
                    console.error('Failed to fetch notifications:', error)
                }
            },

            markAsRead: async (id: string) => {
                try {
                    await authenticationService.markAsReadNotification({ id })
                    set((state) => {
                        const notification = state.notifications.find(
                            (n) => n.id === id
                        )
                        const wasUnread = notification?.daDoc === false

                        return {
                            notifications: state.notifications.map(
                                (notification) =>
                                    notification.id === id
                                        ? { ...notification, daDoc: true }
                                        : notification
                            ),
                            unreadCount: wasUnread
                                ? state.unreadCount - 1
                                : state.unreadCount,
                        }
                    })
                } catch (error) {
                    console.error('Failed to mark notification as read:', error)
                }
            },
        }),
        {
            name: 'notification-storage',
        }
    )
)
