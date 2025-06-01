'use client'

import { format } from 'date-fns'
import {
    Plus,
    Minus,
    Award,
    ShoppingCart,
    Zap,
    Users,
    Sparkles,
    LogIn,
    MessageSquare,
    Heart,
    Share2,
    ImageIcon,
    FileText,
    UserCheck,
} from 'lucide-react'
import type { Transaction } from '@/store/mission-store'
import { useLocale } from 'next-intl'

interface TransactionItemProps {
    transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
    // Xác định loại giao dịch dựa vào loaiNhiemVu
    const locale = useLocale()
    const isCharge =
        transaction.loaiNhiemVu?.startsWith('charge_') ||
        transaction.loaiNhiemVu?.startsWith('ask')
    const transactionType = isCharge ? 'spent' : 'earned'

    // Get the appropriate icon based on the loaiNhiemVu
    const getSourceIcon = () => {
        if (transaction.loaiNhiemVu) {
            switch (transaction.loaiNhiemVu) {
                case 'login':
                case 'post':
                case 'like':
                case 'comment':
                case 'share':
                    return <Award className="h-5 w-5" />
                case 'charge_gen_blog':
                    return <FileText className="h-5 w-5" />
                case 'charge_gen_image':
                    return <ImageIcon className="h-5 w-5" />
                case 'complete_profile':
                    return <UserCheck className="h-5 w-5" />
                default:
                    return transaction.type === 'earned' ? (
                        <Plus className="h-5 w-5" />
                    ) : (
                        <Minus className="h-5 w-5" />
                    )
            }
        } else {
            // Fallback to original logic for backward compatibility
            switch (transaction.source) {
                case 'mission':
                    return <Award className="h-5 w-5" />
                case 'purchase':
                    return <ShoppingCart className="h-5 w-5" />
                case 'feature':
                    return <Sparkles className="h-5 w-5" />
                case 'boost':
                    return <Zap className="h-5 w-5" />
                case 'referral':
                    return <Users className="h-5 w-5" />
                default:
                    return transaction.type === 'earned' ? (
                        <Plus className="h-5 w-5" />
                    ) : (
                        <Minus className="h-5 w-5" />
                    )
            }
        }
    }

    // Get the source name in Vietnamese based on loaiNhiemVu
    const getSourceName = () => {
        if (transaction.loaiNhiemVu) {
            switch (transaction.loaiNhiemVu) {
                case 'login':
                    return 'Đăng nhập'
                case 'post':
                    return 'Đăng bài'
                case 'like':
                    return 'Thích bài viết'
                case 'comment':
                    return 'Bình luận'
                case 'share':
                    return 'Chia sẻ'
                case 'charge_gen_blog':
                    return 'Tạo bài viết AI'
                case 'charge_gen_image':
                    return 'Tạo hình ảnh AI'
                case 'complete_profile':
                    return 'Hoàn thành hồ sơ'
                default:
                    return transaction.loaiNhiemVu
            }
        } else {
            // Fallback to original logic for backward compatibility
            switch (transaction.source) {
                case 'mission':
                    return 'Nhiệm vụ'
                case 'purchase':
                    return 'Mua coin'
                case 'feature':
                    return 'Tính năng'
                case 'boost':
                    return 'Tăng hiển thị'
                case 'referral':
                    return 'Giới thiệu'
                default:
                    return transaction.source
            }
        }
    }

    // Get description based on tenNhiemVu or original description
    const getDescription = () => {
        if (transaction.tenNhiemVu) {
            return transaction.tenNhiemVu
        }
        return transaction.description
    }

    // Determine transaction type based on loaiNhiemVu or original type
    const getTransactionType = () => {
        if (transaction.loaiNhiemVu) {
            return isCharge ? 'spent' : 'earned'
        }
        return transaction.type
    }

    const type = getTransactionType()

    return (
        <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-6">
                <div
                    className={`p-2 rounded-full ${
                        type === 'earned'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                    }`}
                >
                    {getSourceIcon()}
                </div>
                <div>
                    <p className="font-medium">{getDescription()}</p>
                    <p className="text-xs text-gray-500 py-1">
                        {/* {getSourceName()} •{' '} */}
                        {transaction.timestamp
                            ? format(
                                  new Date(transaction.timestamp),
                                  'dd/MM/yyyy HH:mm'
                              )
                            : format(
                                  new Date(transaction.createdAt || Date.now()),
                                  'dd/MM/yyyy HH:mm'
                              )}
                    </p>
                    {transaction.tienDo !== undefined &&
                        transaction.soLanCanThucHien !== undefined && (
                            <p className="text-xs text-gray-500">
                                {locale == 'vi' ? 'Tiến độ' : 'Progress'}:{' '}
                                {transaction.tienDo}/
                                {transaction.soLanCanThucHien}
                            </p>
                        )}
                </div>
            </div>
            <div
                className={`font-bold ${type === 'earned' ? 'text-green-600' : 'text-red-600'}`}
            >
                {type === 'earned' ? '+' : '-'}
                {transaction.amount || transaction.coinNhanThuong}
            </div>
        </div>
    )
}
