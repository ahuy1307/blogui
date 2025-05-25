import React, { useCallback } from 'react'
import { Button } from '@/components/other-ui/Button'
import {
    XCircle,
    ArrowLeft,
    RefreshCcw,
    History,
    ShoppingCart,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/other-ui/Card'

export const CancelPayment = () => {
    const t = useTranslations('pricing')
    const ct = useTranslations('pricing.Checkout')
    const tt = useTranslations('pricing.TransactionHistory')
    const router = useRouter()

    const handleBuyAgain = useCallback(() => {
        router.push('/pricing')
    }, [router])

    const handleBackToHome = useCallback(() => {
        router.push('/')
    }, [router])

    const handleViewHistory = useCallback(() => {
        router.push('/transaction-history')
    }, [router])

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-[60px] sm:mt-[80px] pb-8">
            <Card className="border-amber-200 shadow-lg w-full">
                <CardHeader className="bg-amber-50 border-b border-amber-100 px-4 sm:px-6 py-5 sm:py-6">
                    <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="bg-amber-100 text-amber-800 p-4 sm:p-5 rounded-full shadow-inner">
                            <XCircle className="h-10 w-10 sm:h-14 sm:w-14" />
                        </div>
                    </div>
                    <CardTitle className="text-center text-xl sm:text-2xl text-amber-800">
                        {tt('statusCancelled')}
                    </CardTitle>
                    <CardDescription className="text-center text-amber-700 text-base sm:text-lg mt-1">
                        {ct('paymentCancelled')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6">
                    <div className="space-y-5 sm:space-y-6">
                        <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-lg">
                            <div className="flex items-center gap-4 sm:gap-5 mb-2 sm:mb-3 text-amber-800">
                                <RefreshCcw className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <h5 className="font-medium">
                                    {ct('whatNext')}
                                </h5>
                            </div>
                            <ul className="list-disc list-inside space-y-2 text-sm text-amber-800 pl-1">
                                <li>{ct('paymentCancelMessage')}</li>
                                <li>{t('buyCoinsDescription')}</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4 pb-5 sm:pb-6 px-4 sm:px-6">
                    <Button
                        className="w-full h-11 sm:h-12 text-sm sm:text-base flex items-center justify-center"
                        onClick={handleBuyAgain}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t('buyCoin')}
                    </Button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                        <Button
                            variant="outline"
                            className="h-11 sm:h-12 text-sm sm:text-base"
                            onClick={handleViewHistory}
                        >
                            <History className="mr-2 h-4 w-4" />
                            {ct('viewTransactionHistory')}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 sm:h-12 text-sm sm:text-base"
                            onClick={handleBackToHome}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {ct('backToHome')}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
