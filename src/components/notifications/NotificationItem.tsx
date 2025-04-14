'use client'

import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, AtSign, Star, Bell } from 'lucide-react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/other-ui/Avatar'
import { Badge } from '@/components/other-ui/Badge'
import type { Notification, NotificationType } from '@/types/notification'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'

interface NotificationItemProps {
    notification: Notification
    onClick: (notification: Notification) => void
    blogSlug: string
}

export function NotificationItem({
    notification,
    onClick,
    blogSlug,
}: NotificationItemProps) {
    const t = useTranslations('header.Notification')
    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'liked':
                return <Heart className="h-4 w-4 text-red-500" />
            case 'comment':
                return <MessageCircle className="h-4 w-4 text-blue-500" />
            default:
                return <Bell className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <Link
            href={`/blog/${blogSlug}`}
            passHref
            className={`flex cursor-pointer gap-4 p-4 ${notification.daDoc ? 'opacity-70' : 'bg-purple-50'}`}
            onClick={() => onClick(notification)}
        >
            <div className="flex-shrink-0">
                {notification && (
                    <div className="relative h-10 w-10">
                        <Avatar className="h-10 w-10 border-2 border-white">
                            <AvatarImage
                                src={
                                    notification.thongTinNguoiCuoiCungThucHien
                                        .avatar || '/images/default_avatar.jpg'
                                }
                                alt={
                                    notification.thongTinNguoiCuoiCungThucHien
                                        .hoTen
                                }
                            />
                            <AvatarFallback>
                                {notification.thongTinNguoiCuoiCungThucHien.hoTen.charAt(
                                    0
                                )}
                            </AvatarFallback>
                        </Avatar>
                        {notification.danhSachNguoiCungThucHien.length > 0 && (
                            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[10px] font-medium text-purple-600 ring-2 ring-white">
                                +{notification.danhSachNguoiCungThucHien.length}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                        {notification.noiDung}
                    </p>
                    {!notification.daDoc && (
                        <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800 text-[10px] h-5"
                        >
                            {t('new')}
                        </Badge>
                    )}
                </div>
                {notification.baiViet && (
                    <p className="text-xs text-gray-500">
                        {t('on')} {notification.baiViet.tieuDe}
                    </p>
                )}
                <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                    })}
                </p>
            </div>
        </Link>
    )
}
