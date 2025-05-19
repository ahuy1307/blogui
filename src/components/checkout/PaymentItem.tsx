'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/other-ui/Button'
import { Badge } from '@/components/other-ui/Badge'
import {
    Coins,
    ChevronDown,
    ChevronUp,
    Calendar,
    CreditCard,
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    ExternalLink,
    X,
    TriangleAlert,
} from 'lucide-react'
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Transaction } from '@/types/interface'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/other-ui/Dialog'
import { Progress } from '@/components/other-ui/Progress'

interface PackageInfo {
    id: string
    tenGoi: string
    giaBan: number
    soLuongCoin: number
    trangThai: number
    noiBat: boolean
}

interface TransactionItemProps {
    transaction: Transaction
    packageInfo: PackageInfo
    onCancel: (id: string) => void
    onCountdownExpired?: () => Promise<void>
}

export function PaymentItem({
    transaction,
    packageInfo,
    onCancel,
    onCountdownExpired,
}: TransactionItemProps) {
    const t = useTranslations('pricing.TransactionHistory')
    const [expanded, setExpanded] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
    const [checkoutExpired, setCheckoutExpired] = useState<boolean>(false)
    const [isRemoved, setIsRemoved] = useState(false)

    // Check if transaction is still within 15 minutes for checkout
    const isCheckoutAvailable = () => {
        if (
            !transaction.urlThanhToan ||
            transaction.trangThai !== 'pending' ||
            checkoutExpired
        ) {
            return false
        }
        return true
    }

    // Calculate remaining time and update countdown
    useEffect(() => {
        if (transaction.trangThai !== 'pending') return

        // Initial calculation
        const createdAt = new Date(transaction.createdAt)
        const now = new Date()
        const timeLimit = 15 * 60 // 15 minutes in seconds
        const elapsedSeconds = differenceInSeconds(now, createdAt)
        const remaining = Math.max(0, timeLimit - elapsedSeconds)

        setRemainingSeconds(remaining)
        setCheckoutExpired(remaining <= 0)

        // If already expired at initial load, trigger data refresh
        if (remaining <= 0) {
            setTimeout(() => {
                onCancel(transaction.id) // This triggers refetch in the parent component
                if (onCountdownExpired) onCountdownExpired()
            }, 1000)
            return
        }

        // Setup countdown intervals with automatic refresh trigger points
        const intervalId = setInterval(() => {
            setRemainingSeconds((prev) => {
                const newValue = Math.max(0, prev - 1)

                // Trigger refresh at specific intervals (5min, 1min, 30sec, expired)
                // This ensures UI stays in sync with backend status changes
                if ([300, 60, 30, 0].includes(newValue)) {
                    onCancel(transaction.id) // This triggers refetch in the parent component
                    if (onCountdownExpired && newValue === 0)
                        onCountdownExpired()
                }

                if (newValue === 0) {
                    setCheckoutExpired(true)
                    clearInterval(intervalId)
                }

                return newValue
            })
        }, 1000)

        return () => clearInterval(intervalId)
    }, [
        transaction.createdAt,
        transaction.trangThai,
        transaction.id,
        onCancel,
        onCountdownExpired,
    ])

    // Format countdown time as MM:SS
    const formatCountdown = () => {
        const minutes = Math.floor(remainingSeconds / 60)
        const seconds = remainingSeconds % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // Calculate progress percentage (0-100)
    const calculateProgress = () => {
        const timeLimit = 15 * 60 // 15 minutes in seconds
        return Math.max(0, Math.min(100, (remainingSeconds / timeLimit) * 100))
    }

    // Format date
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
    }

    // Get status badge with icon
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 px-2.5 py-1"
                    >
                        <Clock className="h-3.5 w-3.5" />
                        {t('statusPending', { defaultMessage: 'Chờ xử lý' })}
                    </Badge>
                )
            case 'accept':
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2.5 py-1"
                    >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t('statusSuccess', { defaultMessage: 'Thành công' })}
                    </Badge>
                )
            case 'cancel':
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1 px-2.5 py-1"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        {t('statusCancelled', { defaultMessage: 'Đã hủy' })}
                    </Badge>
                )
            case 'failed':
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 px-2.5 py-1"
                    >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {t('statusFailed', { defaultMessage: 'Thất bại' })}
                    </Badge>
                )
            default:
                return (
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1 px-2.5 py-1"
                    >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {t('statusUnknown', {
                            defaultMessage: 'Không xác định',
                        })}
                    </Badge>
                )
        }
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    const handleContinueCheckout = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (transaction.urlThanhToan) {
            window.location.href = transaction.urlThanhToan
        }
    }

    const handleCancel = async () => {
        // Immediately hide dialog and mark component as being removed
        setShowCancelDialog(false)
        setIsRemoved(true)

        try {
            // Call API in the background
            await authenticationService.cancelPayment({
                order_id: transaction.id,
            })

            toast.success(
                t('cancelSuccess', {
                    defaultMessage: 'Order cancelled successfully',
                })
            )

            // Use a long delay before triggering parent refetch to ensure component is fully unmounted
            setTimeout(() => {
                onCancel(transaction.id)
            }, 500)
        } catch (error) {
            console.error('Error cancelling payment:', error)
            toast.error(
                t('cancelError', { defaultMessage: 'Failed to cancel order' })
            )
        }
    }

    // If removed from DOM, don't render anything except a placeholder
    if (isRemoved) {
        // Return minimal placeholder instead of null to maintain DOM structure
        return <div className="hidden"></div>
    }

    return (
        <>
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800">
                <div
                    className={`p-5 bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${expanded ? 'border-b border-dashed' : ''}`}
                    onClick={() => setExpanded(!expanded)}
                >
                    {/* Transaction info */}
                    <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('dateCreated')}
                                </p>
                                <p className="font-medium">
                                    {formatDate(transaction.createdAt)}
                                </p>
                            </div>

                            <div className="hidden md:block text-muted-foreground">
                                •
                            </div>

                            <div>{getStatusBadge(transaction.trangThai)}</div>

                            <div className="hidden md:block text-muted-foreground">
                                •
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('paymentMethod')}
                                </p>
                                <p className="font-medium flex items-center">
                                    <span
                                        className={`inline-block w-4 h-4 mr-1.5 rounded-full ${
                                            transaction.hinhThucThanhToan ===
                                            'VNPay'
                                                ? 'bg-blue-500'
                                                : transaction.hinhThucThanhToan ===
                                                    'Momo'
                                                  ? 'bg-pink-500'
                                                  : 'bg-gray-500'
                                        }`}
                                    ></span>
                                    {transaction.hinhThucThanhToan}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Price and coins */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                {t('totalAmount')}
                            </p>
                            <p className="font-bold text-lg">
                                {formatCurrency(transaction.tongTien)}
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                            <Coins className="h-4 w-4 text-primary" />
                            <span className="font-medium text-primary">
                                {packageInfo.soLuongCoin.toLocaleString()}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-8 w-8 ml-2"
                            onClick={(e) => {
                                e.stopPropagation()
                                setExpanded(!expanded)
                            }}
                        >
                            {expanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Expanded details with animation - updated timing */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                duration: 0.35, // Increased from 0.2 to 0.35
                                ease: [0.04, 0.62, 0.23, 0.98], // Custom easing for smoother feel
                                opacity: { duration: 0.25 }, // Separate timing for opacity
                            }}
                            className="overflow-hidden"
                        >
                            <div className="p-5 bg-muted/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                                        <h4 className="font-medium mb-3 flex items-center text-base">
                                            <Calendar className="h-4 w-4 mr-2 text-primary" />
                                            {t('orderDetails')}
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('dateCreated')}
                                                    </p>
                                                    <p className="font-medium text-sm">
                                                        {formatDate(
                                                            transaction.createdAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('paymentMethod')}
                                                    </p>
                                                    <p className="font-medium text-sm">
                                                        {
                                                            transaction.hinhThucThanhToan
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                                        <h4 className="font-medium mb-3 flex items-center text-base">
                                            <Package className="h-4 w-4 mr-2 text-primary" />
                                            {t('packageDetails')}
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('packageName')}
                                                    </p>
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-sm">
                                                            {packageInfo.tenGoi}
                                                        </span>
                                                        {packageInfo.noiBat && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-2 text-xs bg-primary/20 text-primary border-none"
                                                            >
                                                                {t('featured')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('packagePrice')}
                                                    </p>
                                                    <p className="font-medium text-sm">
                                                        {formatCurrency(
                                                            packageInfo.giaBan
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                                                    <Coins className="h-3.5 w-3.5 text-primary" />
                                                    <span className="text-xs font-medium text-primary">
                                                        {packageInfo.soLuongCoin.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons for pending transactions */}
                                {transaction.trangThai === 'pending' && (
                                    <div className="mt-4">
                                        {isCheckoutAvailable() ? (
                                            <div>
                                                <div className="flex flex-col mb-3 p-3 bg-amber-50 border border-amber-100 rounded-md">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <div className="flex items-center text-amber-700 text-sm font-medium">
                                                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                                                            {t(
                                                                'checkoutTimeRemaining',
                                                                {
                                                                    defaultMessage:
                                                                        'Checkout time remaining',
                                                                }
                                                            )}
                                                        </div>
                                                        <span className="text-amber-800 font-mono font-semibold">
                                                            {formatCountdown()}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={calculateProgress()}
                                                        className="h-2 bg-amber-200"
                                                        indicatorClassName="bg-amber-500"
                                                    />
                                                    <p className="text-xs text-amber-600 mt-1.5">
                                                        {t('checkoutWarning', {
                                                            defaultMessage:
                                                                'Complete the payment before the timer expires or the order will be automatically cancelled.',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex justify-end gap-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowCancelDialog(
                                                                true
                                                            )
                                                        }}
                                                        disabled={isCancelling}
                                                    >
                                                        {isCancelling ? (
                                                            <Clock className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                                        ) : null}
                                                        {t('cancelOrder')}
                                                    </Button>

                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-primary hover:bg-primary/90 transition-colors"
                                                        onClick={
                                                            handleContinueCheckout
                                                        }
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                                        {t('continueCheckout', {
                                                            defaultMessage:
                                                                'Continue Checkout',
                                                        })}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                {checkoutExpired && (
                                                    <div className="mb-2 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                                        {t('checkoutExpired', {
                                                            defaultMessage:
                                                                'Checkout time has expired. You can no longer complete this payment.',
                                                        })}
                                                    </div>
                                                )}
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowCancelDialog(
                                                                true
                                                            )
                                                        }}
                                                        disabled={isCancelling}
                                                    >
                                                        {isCancelling ? (
                                                            <Clock className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                                        ) : null}
                                                        {t('cancelOrder')}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Custom Modal Dialog for cancellation confirmation */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="flex flex-col z-[200]">
                    <DialogHeader>
                        <div className="flex items-center justify-between w-full">
                            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                                <XCircle className="h-6 w-6 text-red-500" />
                                {t('confirmCancelTitle')}
                            </DialogTitle>
                            {/* <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => setShowCancelDialog(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button> */}
                        </div>
                        <p className="text-muted-foreground text-base pt-2">
                            {t('confirmCancelDescription')}
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 py-2 w-full">
                        {/* Order details */}
                        <div className="bg-muted/40 rounded-lg p-4 border border-muted">
                            <h4 className="text-base mb-3 flex items-center font-bold">
                                <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                                {t('orderSummary')}
                            </h4>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        {t('packageName')}:
                                    </span>
                                    <span className="font-medium">
                                        {packageInfo.tenGoi}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        {t('totalAmount')}:
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(transaction.tongTien)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                        {t('paymentMethod')}:
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`inline-block w-3 h-3 rounded-full ${
                                                transaction.hinhThucThanhToan ===
                                                'VNPay'
                                                    ? 'bg-blue-500'
                                                    : transaction.hinhThucThanhToan ===
                                                        'Momo'
                                                      ? 'bg-pink-500'
                                                      : 'bg-gray-500'
                                            }`}
                                        ></span>
                                        <span className="font-medium">
                                            {transaction.hinhThucThanhToan}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warning message */}
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-800">
                            <TriangleAlert className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs">
                                    {t('cancelWarning', {
                                        defaultMessage:
                                            'This action cannot be undone. The order will be permanently cancelled.',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            className="w-fit"
                        >
                            {t('keepOrder')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={isCancelling}
                        >
                            {isCancelling ? (
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                            )}
                            {t('confirmCancel')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
