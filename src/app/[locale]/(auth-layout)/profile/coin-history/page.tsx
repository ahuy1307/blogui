'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Coins,
    Plus,
    Minus,
    Filter,
    Calendar,
    Search,
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/other-ui/Card'
import { Tabs, TabsList, TabsTrigger } from '@/components/other-ui/Tabs'
import { Button } from '@/components/other-ui/Button'
import { Input } from '@/components/other-ui/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/other-ui/Select'
import { Badge } from '@/components/other-ui/Badge'
import { useMissionStore, type Transaction } from '@/store/mission-store'
import { TransactionItem } from '@/components/coins/TransactionItem'
import { TransactionList } from '@/components/coins/TransactionList'
import { useAuth } from '@/contexts/auth/AuthContext'
import { useTranslations } from 'next-intl'

export default function CoinHistoryPage() {
    const { transactions, fetchTransactionHistory, needsLazyLoading } =
        useMissionStore()
    const t = useTranslations('header.CoinHistoryPage')
    const { user } = useAuth()
    const [filter, setFilter] = useState<'all' | 'earned' | 'spent'>('all')
    const [sourceFilter, setSourceFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
    const [filteredTransactions, setFilteredTransactions] = useState<
        Transaction[]
    >([])
    const [isFiltering, setIsFiltering] = useState(false)

    // Fetch transaction history - only on initial load
    useEffect(() => {
        // Initial fetch is now handled by the TransactionList component
        // This ensures we don't trigger duplicate fetches
    }, [])

    // Calculate total earned and spent
    const totalEarned = transactions.reduce((sum, txn) => {
        // Nếu có loaiNhiemVu, kiểm tra xem có phải là charge không
        if (txn.loaiNhiemVu) {
            if (!txn.loaiNhiemVu.startsWith('charge_')) {
                return sum + (txn.amount || txn.coinNhanThuong || 0)
            }
            return sum
        }
        // Nếu không có loaiNhiemVu, sử dụng logic cũ
        return txn.type === 'earned' ? sum + (txn.amount || 0) : sum
    }, 0)

    const totalSpent = transactions.reduce((sum, txn) => {
        // Nếu có loaiNhiemVu, kiểm tra xem có phải là charge không
        if (txn.loaiNhiemVu) {
            if (txn.loaiNhiemVu.startsWith('charge_')) {
                return sum + (txn.amount || txn.coinNhanThuong || 0)
            }
            return sum
        }
        // Nếu không có loaiNhiemVu, sử dụng logic cũ
        return txn.type === 'spent' ? sum + (txn.amount || 0) : sum
    }, 0)

    // Cập nhật phần lấy unique sources để bao gồm cả loaiNhiemVu
    // Update sources to include task names
    const sources = Array.from(
        new Set([
            ...transactions
                .filter((txn) => txn.source)
                .map((txn) => txn.source),
            ...transactions
                .filter((txn) => txn.loaiNhiemVu)
                .map((txn) => txn.loaiNhiemVu),
        ])
    )

    // Get task names for display in filters
    const getSourceDisplayName = (sourceId: string) => {
        // Try to find a transaction with this source that has a task name
        const transactionWithName = transactions.find(
            (txn) =>
                (txn.source === sourceId || txn.loaiNhiemVu === sourceId) &&
                txn.tenNhiemVu
        )

        if (transactionWithName?.tenNhiemVu) {
            return transactionWithName.tenNhiemVu
        }

        // Default display names for known sources
        if (sourceId === 'mission') return 'Nhiệm vụ'
        if (sourceId === 'purchase') return 'Mua coin'
        if (sourceId === 'feature') return 'Tính năng'
        if (sourceId === 'boost') return 'Tăng hiển thị'
        if (sourceId === 'referral') return 'Giới thiệu'
        if (sourceId === 'login') return 'Đăng nhập'
        if (sourceId === 'post') return 'Đăng bài'
        if (sourceId === 'like') return 'Thích bài viết'
        if (sourceId === 'comment') return 'Bình luận'
        if (sourceId === 'share') return 'Chia sẻ'
        if (sourceId === 'charge_gen_blog') return 'Tạo bài viết AI'
        if (sourceId === 'charge_gen_image') return 'Tạo hình ảnh AI'
        if (sourceId === 'complete_profile') return 'Hoàn thành hồ sơ'

        return sourceId
    }

    // Apply filters
    useEffect(() => {
        setIsFiltering(
            filter !== 'all' ||
                sourceFilter !== 'all' ||
                searchQuery !== '' ||
                !!dateRange.from ||
                !!dateRange.to
        )

        let filtered = [...transactions]

        // Filter by type
        if (filter !== 'all') {
            if (filter === 'earned') {
                filtered = filtered.filter(
                    (txn) =>
                        (txn.loaiNhiemVu &&
                            !txn.loaiNhiemVu.startsWith('charge_')) ||
                        (!txn.loaiNhiemVu && txn.type === 'earned')
                )
            } else if (filter === 'spent') {
                filtered = filtered.filter(
                    (txn) =>
                        (txn.loaiNhiemVu &&
                            txn.loaiNhiemVu.startsWith('charge_')) ||
                        (!txn.loaiNhiemVu && txn.type === 'spent')
                )
            }
        }

        // Filter by source
        if (sourceFilter !== 'all') {
            filtered = filtered.filter(
                (txn) =>
                    (txn.loaiNhiemVu && txn.loaiNhiemVu === sourceFilter) ||
                    (!txn.loaiNhiemVu && txn.source === sourceFilter)
            )
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (txn) =>
                    (txn.description &&
                        txn.description.toLowerCase().includes(query)) ||
                    (txn.tenNhiemVu &&
                        txn.tenNhiemVu.toLowerCase().includes(query)) ||
                    (txn.source && txn.source.toLowerCase().includes(query)) ||
                    (txn.loaiNhiemVu &&
                        txn.loaiNhiemVu.toLowerCase().includes(query))
            )
        }

        // Filter by date range
        if (dateRange.from) {
            filtered = filtered.filter((txn) => {
                const date = txn.timestamp
                    ? new Date(txn.timestamp)
                    : new Date(txn.createdAt || Date.now())
                return date >= dateRange.from!
            })
        }
        if (dateRange.to) {
            const endDate = new Date(dateRange.to)
            endDate.setHours(23, 59, 59, 999)
            filtered = filtered.filter((txn) => {
                const date = txn.timestamp
                    ? new Date(txn.timestamp)
                    : new Date(txn.createdAt || Date.now())
                return date <= endDate
            })
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => {
            const dateA = a.timestamp
                ? new Date(a.timestamp)
                : new Date(a.createdAt || Date.now())
            const dateB = b.timestamp
                ? new Date(b.timestamp)
                : new Date(b.createdAt || Date.now())
            return dateB.getTime() - dateA.getTime()
        })

        setFilteredTransactions(filtered)
    }, [transactions, filter, sourceFilter, searchQuery, dateRange])

    // Clear all filters
    const clearFilters = () => {
        setFilter('all')
        setSourceFilter('all')
        setSearchQuery('')
        setDateRange({})
    }

    // Format date range for display
    const formatDateRange = () => {
        if (dateRange.from && dateRange.to) {
            return `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
        }
        if (dateRange.from) {
            return `Từ ${format(dateRange.from, 'dd/MM/yyyy')}`
        }
        if (dateRange.to) {
            return `Đến ${format(dateRange.to, 'dd/MM/yyyy')}`
        }
        return 'Tất cả ngày'
    }

    // Get display name for the selected source filter
    const sourceFilterDisplayName =
        sourceFilter !== 'all' ? getSourceDisplayName(sourceFilter) : ''

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <main className="container mx-auto px-4 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-500 hover:text-purple-600 mb-8"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('backToHome')}
                </Link>

                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">
                        {t('transactionHistory')}
                    </h1>

                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <Card className="bg-yellow-50 border-yellow-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-yellow-700">
                                    {t('currentBalance')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-2xl font-bold text-yellow-700">
                                    <Coins className="h-6 w-6" />
                                    {user?.soLuongCoin} {t('coin')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-green-700">
                                    {t('totalEarned')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-2xl font-bold text-green-700">
                                    <Plus className="h-5 w-5" />
                                    {totalEarned} {t('coin')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-red-700">
                                    {t('totalSpent')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-2xl font-bold text-red-700">
                                    <Minus className="h-5 w-5" />
                                    {totalSpent} {t('coin')}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <CardTitle>
                                    {t('transactionHistoryList')}
                                </CardTitle>
                                <Tabs
                                    defaultValue="all"
                                    value={filter}
                                    onValueChange={(v) => setFilter(v as any)}
                                >
                                    <TabsList>
                                        <TabsTrigger value="all">
                                            {t('all')}
                                        </TabsTrigger>
                                        <TabsTrigger value="earned">
                                            {t('earned')}
                                        </TabsTrigger>
                                        <TabsTrigger value="spent">
                                            {t('spent')}
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <CardDescription>
                                {t('viewAllTransactions')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="search"
                                            placeholder={t(
                                                'searchTransactions'
                                            )}
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Select
                                        value={sourceFilter}
                                        onValueChange={setSourceFilter}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue
                                                placeholder={t(
                                                    'transactionSource'
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                {t('allSources')}
                                            </SelectItem>
                                            {sources.map((source) => (
                                                <SelectItem
                                                    key={source}
                                                    value={source!}
                                                >
                                                    {getSourceDisplayName(
                                                        source!
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Active filters */}
                            {(filter !== 'all' ||
                                sourceFilter !== 'all' ||
                                searchQuery ||
                                dateRange.from ||
                                dateRange.to) && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {filter !== 'all' && (
                                        <Badge
                                            variant="secondary"
                                            className="gap-1"
                                        >
                                            {filter === 'earned'
                                                ? t('earned')
                                                : t('spent')}
                                            <button
                                                className="ml-1 hover:text-red-500"
                                                onClick={() => setFilter('all')}
                                                aria-label="Xóa bộ lọc loại"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {sourceFilter !== 'all' && (
                                        <Badge
                                            variant="secondary"
                                            className="gap-1"
                                        >
                                            {t('transactionSource')}:{' '}
                                            {sourceFilterDisplayName}
                                            <button
                                                className="ml-1 hover:text-red-500"
                                                onClick={() =>
                                                    setSourceFilter('all')
                                                }
                                                aria-label="Xóa bộ lọc nguồn"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    {searchQuery && (
                                        <Badge
                                            variant="secondary"
                                            className="gap-1"
                                        >
                                            {
                                                t('searchTransactions').split(
                                                    '...'
                                                )[0]
                                            }
                                            : {searchQuery}
                                            <button
                                                className="ml-1 hover:text-red-500"
                                                onClick={() =>
                                                    setSearchQuery('')
                                                }
                                                aria-label="Xóa tìm kiếm"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-6 text-xs"
                                    >
                                        {t('clearAll')}
                                    </Button>
                                </div>
                            )}

                            {isFiltering ? (
                                // When filters are active, show filtered results
                                filteredTransactions.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredTransactions.map((txn) => (
                                            <TransactionItem
                                                key={txn.id}
                                                transaction={txn}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Coins className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                        <p>{t('noTransactionsFound')}</p>
                                        <p className="text-sm">
                                            {t('tryDifferentFilters')}
                                        </p>
                                    </div>
                                )
                            ) : (
                                // When no filters, use the TransactionList component with lazy loading
                                <TransactionList />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
