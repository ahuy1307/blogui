'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, X, Info } from 'lucide-react'
import { Button } from '@/components/other-ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/other-ui/DropdownMenu'
import { useNotificationStore } from '@/store/notification-store'
import { Tabs, TabsList, TabsTrigger } from '@/components/other-ui/Tabs'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import type { Notification } from '@/types/notification'
import { useTranslations } from 'next-intl'

export function NotificationDropdown() {
    const t = useTranslations('header.Notification')
    const {
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        clearNotifications,
        fetchNotifications,
    } = useNotificationStore()
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
    const [selectedNotification, setSelectedNotification] =
        useState<Notification | null>(null)

    // Close dropdown when navigating
    useEffect(() => {
        const handleRouteChange = () => {
            setOpen(false)
        }
        fetchNotifications()

        window.addEventListener('popstate', handleRouteChange)
        return () => {
            window.removeEventListener('popstate', handleRouteChange)
        }
    }, [])

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id)
        // Show notification detail
        setSelectedNotification(notification)
    }

    // Filter notifications based on active tab
    const getFilteredNotifications = () => {
        if (activeTab === 'unread') {
            return notifications.filter((notification) => !notification.daDoc)
        } else {
            return notifications
        }
    }

    const filteredNotifications = getFilteredNotifications()

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="default" className="relative">
                    <Bell
                        className="h-8 w-8"
                        style={{ width: '20px', height: '20px' }}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <>
                    <div className="flex items-center justify-between p-4">
                        <DropdownMenuLabel className="text-lg">
                            {t('notificationLabel')}
                        </DropdownMenuLabel>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-8 text-xs"
                            >
                                <Check className="mr-1 h-3 w-3" />
                                {t('markAllAsRead')}
                            </Button>
                        )}
                        {notifications.length > 0 && unreadCount == 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearNotifications}
                                className="h-8 text-xs"
                            >
                                <X className="mr-1 h-3 w-3" />
                                {t('clearAll')}
                            </Button>
                        )}
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            setActiveTab(value as 'all' | 'unread')
                        }
                    >
                        <div className="px-4 pb-2">
                            <TabsList className="w-full">
                                <TabsTrigger value="all" className="flex-1">
                                    {t('all')}
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="flex-1">
                                    {t('unread')}
                                    {unreadCount > 0 && `(${unreadCount})`}
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <DropdownMenuItem key={notification.id} asChild>
                                    <NotificationItem
                                        notification={notification}
                                        onClick={() => {
                                            handleNotificationClick(
                                                notification
                                            )
                                            setOpen(false)
                                        }}
                                        blogSlug={
                                            notification.baiViet?.slug || ''
                                        }
                                    />
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                <Bell className="h-12 w-12 text-gray-300 mb-2" />
                                <p className="text-sm font-medium">
                                    {t('noNotifications')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('notificationDescription')}
                                </p>
                            </div>
                        )}
                    </DropdownMenuGroup>
                </>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
