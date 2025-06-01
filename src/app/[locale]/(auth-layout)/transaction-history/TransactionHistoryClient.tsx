'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/other-ui/Button'
import { Input } from '@/components/other-ui/Input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/other-ui/Select'
import { Calendar } from '@/components/other-ui/Calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/other-ui/Popover'
import { vi } from 'date-fns/locale'
import { CalendarIcon, X, Loader2, Filter, RefreshCw } from 'lucide-react'
import { PaymentItem } from '@/components/checkout/PaymentItem'
import { Transaction } from '@/types/interface'
import { useInfiniteQuery } from '@tanstack/react-query'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { format } from 'date-fns'
import { Badge } from '@/components/other-ui/Badge'
import { Separator } from '@/components/other-ui/Separator'
import { useTranslations } from 'next-intl'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import { toast } from 'sonner'

const { RangePicker } = DatePicker

export default function TransactionHistoryClient() {
    const t = useTranslations('pricing.TransactionHistory')

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentMethodFilter, setPaymentMethodFilter] =
        useState<string>('all')
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
    const observerTarget = useRef<HTMLDivElement>(null)
    const [activeFilters, setActiveFilters] = useState<number>(0)
    const [totalItems, setTotalItems] = useState<number>(0)
    // Add state to track pending transactions
    const [hasPendingTransactions, setHasPendingTransactions] =
        useState<boolean>(false)

    // Track items being removed to avoid rendering them during state transitions
    const [removedItemIds, setRemovedItemIds] = useState<Set<string>>(new Set())

    // Handle date range picker changes
    const handleDateRangeChange = (
        dates: any,
        dateStrings: [string, string]
    ) => {
        if (dates) {
            setDateFrom(dates[0]?.toDate())
            setDateTo(dates[1]?.toDate())
        } else {
            setDateFrom(undefined)
            setDateTo(undefined)
        }
    }

    // Fetch payment history with infinite query
    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: [
            'paymentHistory',
            statusFilter,
            paymentMethodFilter,
            dateFrom,
            dateTo,
        ],
        queryFn: async ({ pageParam = 1 }) => {
            const params: {
                page: number
                limit: number
                start_date?: string
                end_date?: string
                status?: string
            } = {
                page: pageParam,
                limit: 10,
            }

            if (dateFrom) {
                params.start_date = format(dateFrom, 'yyyy-MM-dd')
            }

            if (dateTo) {
                params.end_date = format(dateTo, 'yyyy-MM-dd')
            }

            // Pass status filter to API if it's not 'all'
            if (statusFilter !== 'all') {
                params.status = statusFilter
            }

            const response =
                await authenticationService.getPaymentHistory(params)

            // Update total items count from the response
            if (response.data && response.data.count !== undefined) {
                setTotalItems(response.data.count)
            }

            return response.data
        },
        getNextPageParam: (lastPage, allPages) => {
            // Return undefined if we don't have proper page info
            if (!lastPage || lastPage.count === undefined) return undefined

            // Check if total count is greater than 10 and if we have more items to load
            const loadedItemsCount = allPages.reduce(
                (acc, page) => acc + (page.results?.length || 0),
                0
            )

            // Only enable pagination if count > 10 and we haven't loaded all items yet
            if (lastPage.count > 10 && loadedItemsCount < lastPage.count) {
                // If page is available use that, otherwise calculate based on loaded items
                if (lastPage.page !== undefined) {
                    return lastPage.page + 1
                } else {
                    return Math.floor(loadedItemsCount / 10) + 1
                }
            }

            return undefined
        },
        initialPageParam: 1,
        // Use the state variable instead of direct data access
        refetchInterval: hasPendingTransactions ? 30000 : false,
    })

    // Update pending transaction state whenever data changes
    useEffect(() => {
        if (data?.pages) {
            const pending = data.pages.some((page) =>
                page.results?.some(
                    (transaction: any) => transaction.trangThai === 'pending'
                )
            )
            setHasPendingTransactions(pending)
        }
    }, [data])

    // Get current loaded items count
    const loadedItemsCount = useMemo(() => {
        if (!data?.pages) return 0
        return data.pages.reduce(
            (acc, page) => acc + (page.results?.length || 0),
            0
        )
    }, [data?.pages])

    // Check if there are more items to load (specifically when count > 10)
    const hasMoreItems = useMemo(() => {
        return totalItems > 10 && loadedItemsCount < totalItems
    }, [totalItems, loadedItemsCount])

    // Setup intersection observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage &&
                    hasMoreItems
                ) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, hasMoreItems])

    // Filter transactions based on filters - now only filter by payment method client-side
    const filteredTransactions = useMemo(() => {
        if (!data?.pages) return []

        let transactions = data.pages.flatMap((page) => page.results || [])

        // Status filtering is now handled by the API

        // Filter by payment method if using the API doesn't support it
        if (paymentMethodFilter !== 'all') {
            transactions = transactions.filter(
                (t) => t.hinhThucThanhToan === paymentMethodFilter
            )
        }

        return transactions
    }, [data?.pages, paymentMethodFilter])

    // Filter out items that are being removed
    const displayTransactions = useMemo(() => {
        return filteredTransactions.filter((t) => !removedItemIds.has(t.id))
    }, [filteredTransactions, removedItemIds])

    // Count active filters
    useEffect(() => {
        let count = 0
        if (statusFilter !== 'all') count++
        if (paymentMethodFilter !== 'all') count++
        if (dateFrom) count++
        if (dateTo && !dateFrom) count++
        setActiveFilters(count)
    }, [statusFilter, paymentMethodFilter, dateFrom, dateTo])

    const clearFilters = () => {
        setStatusFilter('all')
        setPaymentMethodFilter('all')
        setDateFrom(undefined)
        setDateTo(undefined)
    }

    // Effect to refetch when date filters change
    useEffect(() => {
        refetch()
    }, [dateFrom, dateTo, refetch])

    // Format date range for display
    const getDateRangeText = () => {
        if (dateFrom && dateTo) {
            return `${format(dateFrom, 'dd/MM/yyyy')} - ${format(dateTo, 'dd/MM/yyyy')}`
        } else if (dateFrom) {
            return t('fromDate', { date: format(dateFrom, 'dd/MM/yyyy') })
        } else if (dateTo) {
            return t('toDate', { date: format(dateTo, 'dd/MM/yyyy') })
        }
        return t('selectDate')
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return t('statusPending')
            case 'accept':
                return t('statusSuccess')
            case 'cancel':
                return t('statusCancelled')
            case 'reject':
                return t('statusRejected')
            default:
                return t('statusAll')
        }
    }

    // Handle transaction cancellation with completely detached refetch process
    const handleCancelTransaction = async (id: string) => {
        // Mark this item as removed to prevent re-rendering it
        setRemovedItemIds((prev) => new Set(prev).add(id))

        // Completely detach refresh from the component lifecycle
        setTimeout(() => {
            // Use direct query client refetch instead of component refetch
            refetch().catch((err) => {
                console.error('Error in detached refetch:', err)
            })
        }, 1000)
    }

    // Countdown expired handler - used by child components
    const handleCountdownExpired = async () => {
        try {
            await refetch()
        } catch (err) {
            console.error('Error refreshing after countdown:', err)
        }
    }

    return (
        <div className="py-10 md:container mt-[80px]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        {t('filters')}
                        {activeFilters > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFilters}
                            </Badge>
                        )}
                    </h2>

                    {activeFilters > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                        >
                            <RefreshCw className="h-3 w-3" />
                            {t('reset')}
                        </Button>
                    )}
                </div>

                <Separator className="my-2" />

                <div className="flex flex-wrap gap-6 mt-4">
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-gray-900">
                            <SelectValue placeholder={t('statusPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('statusAll')}
                            </SelectItem>
                            <SelectItem value="pending">
                                {t('statusPending')}
                            </SelectItem>
                            <SelectItem value="accept">
                                {t('statusSuccess')}
                            </SelectItem>
                            <SelectItem value="cancel">
                                {t('statusCancelled')}
                            </SelectItem>
                            <SelectItem value="failed">
                                {t('statusFailed')}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={paymentMethodFilter}
                        onValueChange={setPaymentMethodFilter}
                    >
                        <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-gray-900">
                            <SelectValue
                                placeholder={t('paymentMethodPlaceholder')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('paymentMethodAll')}
                            </SelectItem>
                            <SelectItem value="VNPay">VNPay</SelectItem>
                            {/* <SelectItem value="Momo">Momo</SelectItem> */}
                        </SelectContent>
                    </Select>

                    <RangePicker
                        className="w-full md:w-[300px] border border-input rounded-md focus-within:ring-1 focus-within:ring-purple-300 focus-within:border-purple-200 shadow-sm"
                        placeholder={[t('startDate'), t('endDate')]}
                        value={[
                            dateFrom ? dayjs(dateFrom) : null,
                            dateTo ? dayjs(dateTo) : null,
                        ]}
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                        allowClear
                        style={{
                            color: 'inherit',
                            height: '40px',
                        }}
                        popupStyle={{
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                        }}
                        inputReadOnly={true}
                        placement="bottomRight"
                    />
                </div>

                {activeFilters > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {statusFilter !== 'all' && (
                            <Badge
                                variant="secondary"
                                className="flex gap-1.5 items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                {t('statusLabel')}:{' '}
                                <span className="font-medium">
                                    {getStatusText(statusFilter)}
                                </span>
                                <X
                                    className="h-3.5 w-3.5 ml-1 hover:text-red-500 transition-colors"
                                    onClick={() => setStatusFilter('all')}
                                />
                            </Badge>
                        )}
                        {paymentMethodFilter !== 'all' && (
                            <Badge
                                variant="secondary"
                                className="flex gap-1 items-center"
                            >
                                {t('paymentMethodLabel')}: {paymentMethodFilter}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() =>
                                        setPaymentMethodFilter('all')
                                    }
                                />
                            </Badge>
                        )}
                        {(dateFrom || dateTo) && (
                            <Badge
                                variant="secondary"
                                className="flex gap-1 items-center"
                            >
                                {t('dateLabel')}: {getDateRangeText()}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => {
                                        setDateFrom(undefined)
                                        setDateTo(undefined)
                                    }}
                                />
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">
                        {t('transactions')}
                        {!isLoading && totalItems > 0 && (
                            <Badge
                                variant="outline"
                                className="ml-2 font-normal"
                            >
                                {totalItems}{' '}
                                {t('totalItems', { defaultMessage: 'total' })}
                            </Badge>
                        )}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : displayTransactions.length > 0 ? (
                    <div className="space-y-4">
                        {/* Ensure the list items container has sufficient min-height to display items properly */}
                        <div
                            className="space-y-4"
                            style={{
                                minHeight:
                                    displayTransactions.length > 0
                                        ? `${Math.min(displayTransactions.length * 100, 600)}px`
                                        : 'auto',
                            }}
                        >
                            {/* Replace filteredTransactions with displayTransactions in the mapping */}
                            {displayTransactions.map((transaction) => (
                                <PaymentItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    packageInfo={transaction.goiDangKy}
                                    onCancel={handleCancelTransaction}
                                    onCountdownExpired={handleCountdownExpired}
                                />
                            ))}
                        </div>

                        {/* Infinite scroll load point - with better height handling */}
                        <div
                            ref={observerTarget}
                            className="w-full"
                            style={{
                                // Only add height when there are actually more items to load (count > 10)
                                minHeight: hasMoreItems ? '80px' : '1px',
                                display: hasMoreItems ? 'block' : 'none',
                            }}
                        >
                            {isFetchingNextPage && (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-4">
                            <X className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">
                            {t('noTransactionsFound')}
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                            {t('noTransactionsDescription')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
