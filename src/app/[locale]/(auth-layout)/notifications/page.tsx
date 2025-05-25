'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/other-ui/Button'
import { useNotificationStore } from '@/store/notification-store'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/other-ui/Tabs'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import type { Notification } from '@/types/notification'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function NotificationsPage() {
    const t = useTranslations('header.Notification')
    const {
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        clearNotifications,
        fetchNotifications,
    } = useNotificationStore()
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id)
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
        <div className="container mx-auto max-w-3xl px-4 py-12 mt-[60px]">
            <div className="mb-6 flex items-center justify-center w-full">
                {/* <Link href="/dashboard" className="mr-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link> */}
                <h1 className="text-2xl font-bold text-center">
                    {t('notificationLabel')}
                </h1>
            </div>

            <div className="mb-4">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                        setActiveTab(value as 'all' | 'unread')
                    }
                    className="w-full"
                >
                    <TabsList className="grid w-[200px] grid-cols-2 mx-auto">
                        <TabsTrigger value="all">{t('all')}</TabsTrigger>
                        <TabsTrigger value="unread">
                            {t('unread')}{' '}
                            {unreadCount > 0 && `(${unreadCount})`}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex justify-center mt-4 space-x-4">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8"
                        >
                            <Check className="mr-2 h-3 w-3" />
                            {t('markAllAsRead')}
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearNotifications}
                            className="h-8"
                        >
                            <X className="mr-2 h-3 w-3" />
                            {t('clearAll')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                {filteredNotifications.length > 0 ? (
                    <div className="divide-y">
                        {filteredNotifications.map((notification) => (
                            <div key={notification.id} className="p-2">
                                <NotificationItem
                                    notification={notification}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    blogSlug={notification.baiViet?.slug || ''}
                                    fullWidth
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <Bell className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">
                            {t('noNotifications')}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {t('notificationDescription')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
