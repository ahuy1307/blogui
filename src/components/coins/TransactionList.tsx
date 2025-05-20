'use client'

import { useEffect, useRef, useState } from 'react'
import { useMissionStore } from '@/store/mission-store'
import { TransactionItem } from './TransactionItem'
import { Button } from '@/components/other-ui/Button'
import { useTranslations } from 'next-intl'

export function TransactionList() {
    const {
        transactions,
        hasMoreTransactions,
        isLoading,
        fetchTransactionHistory,
        loadMoreTransactions,
        needsLazyLoading,
    } = useMissionStore()
    const t = useTranslations('header.CoinHistoryPage')

    const listRef = useRef<HTMLDivElement>(null)
    const [initialLoad, setInitialLoad] = useState(true)

    // Load initial transactions only once
    useEffect(() => {
        if (initialLoad) {
            fetchTransactionHistory(1, true) // Reset any existing data
            setInitialLoad(false)
        }
    }, [fetchTransactionHistory, initialLoad])

    // Set up scroll event listener for lazy loading
    useEffect(() => {
        const currentListRef = listRef.current

        if (!currentListRef || !needsLazyLoading) return

        const handleScroll = () => {
            if (!currentListRef || isLoading || !hasMoreTransactions) return

            const { scrollTop, scrollHeight, clientHeight } = currentListRef

            // If we're near the bottom (within 50px), load more transactions
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMoreTransactions()
            }
        }

        // Add event listener to the list element
        currentListRef.addEventListener('scroll', handleScroll)

        // Clean up event listener when component unmounts
        return () => {
            if (currentListRef) {
                currentListRef.removeEventListener('scroll', handleScroll)
            }
        }
    }, [needsLazyLoading, isLoading, hasMoreTransactions, loadMoreTransactions])

    return (
        <div className="space-y-4">
            <div
                ref={listRef}
                className="space-y-3 overflow-y-auto"
                style={{ maxHeight: '500px' }}
            >
                {transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                        <TransactionItem
                            key={`${transaction.id}-${index}`}
                            transaction={transaction}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {isLoading
                            ? t('loading') || 'Đang tải...'
                            : t('noTransactionsFound')}
                    </div>
                )}

                {/* Only show loading indicator when lazy loading in progress */}
                {isLoading && transactions.length > 0 && (
                    <div className="text-center py-4 text-gray-500">
                        {t('loadingMore') || 'Đang tải thêm...'}
                    </div>
                )}
            </div>

            {/* Only show "Load More" button when we have more than 10 items total and more pages exist */}
            {/* {needsLazyLoading && hasMoreTransactions && !isLoading && (
                <div className="text-center">
                    <Button
                        variant="outline"
                        onClick={loadMoreTransactions}
                        className="w-full"
                    >
                        Tải thêm
                    </Button>
                </div>
            )} */}
        </div>
    )
}
