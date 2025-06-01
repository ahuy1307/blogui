'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useMissionStore } from '@/store/mission-store'
import { TransactionItem } from './TransactionItem'
import { useTranslations } from 'next-intl'

interface TransactionListProps {
    filter?: 'all' | 'earned' | 'spent'
}

export function TransactionList({ filter = 'all' }: TransactionListProps) {
    const {
        transactions,
        hasMoreTransactions,
        isLoading,
        fetchTransactionHistory,
        loadMoreTransactions,
        needsLazyLoading,
        currentFilter,
    } = useMissionStore()
    const t = useTranslations('header.CoinHistoryPage')

    const [initialLoad, setInitialLoad] = useState(true)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const previousFilterRef = useRef<string>(filter)

    // Convert filter to charge_coin parameter
    const getChargeCoin = useCallback(() => {
        if (filter === 'earned') return false
        if (filter === 'spent') return true
        return undefined
    }, [filter])

    // Load initial transactions only once or when filter changes
    useEffect(() => {
        const charge_coin = getChargeCoin()

        // Check if filter actually changed to avoid unnecessary API calls
        if (initialLoad || previousFilterRef.current !== filter) {
            // Only fetch if we need to change the filter or haven't loaded yet
            fetchTransactionHistory(1, true, charge_coin)
            setInitialLoad(false)
            previousFilterRef.current = filter
        }
    }, [filter, fetchTransactionHistory, getChargeCoin, initialLoad])

    // Set up intersection observer for infinite scrolling
    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoading) return

            // Disconnect previous observer if exists
            if (observerRef.current) observerRef.current.disconnect()

            // Create new observer
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    // If the sentinel element is visible and we have more transactions to load
                    if (
                        entries[0]?.isIntersecting &&
                        hasMoreTransactions &&
                        needsLazyLoading
                    ) {
                        // Pass the charge_coin parameter when loading more
                        const charge_coin = getChargeCoin()
                        loadMoreTransactions(charge_coin)
                    }
                },
                { threshold: 0.1 }
            )

            // Observe the sentinel element
            if (node) observerRef.current.observe(node)
        },
        [
            isLoading,
            hasMoreTransactions,
            loadMoreTransactions,
            needsLazyLoading,
            getChargeCoin,
        ]
    )

    return (
        <div className="space-y-4">
            {transactions.length > 0 ? (
                <>
                    {transactions.map((transaction, index) => (
                        <TransactionItem
                            key={`${transaction.id}-${index}`}
                            transaction={transaction}
                        />
                    ))}

                    {/* Loading indicator and sentinel element for lazy loading */}
                    {needsLazyLoading && (
                        <div
                            ref={lastElementRef}
                            className="h-10 flex items-center justify-center"
                        >
                            {isLoading && hasMoreTransactions && (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
                                    <span className="text-sm text-gray-500">
                                        {t('loadingMore') || 'Loading more...'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full mb-2"></div>
                            <span>{t('loading') || 'Loading...'}</span>
                        </div>
                    ) : (
                        <span>
                            {t('noTransactionsFound') ||
                                'No transactions found'}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
