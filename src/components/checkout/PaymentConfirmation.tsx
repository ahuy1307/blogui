'use client'

import { Button } from '@/components/other-ui/Button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/other-ui/Card'
import {
    ArrowLeft,
    Check,
    Coins,
    AlertTriangle,
    RefreshCcw,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useCallback } from 'react'
import { CoinPackage } from '../pricing/CoinPurchase'
import { useRouter } from '@/navigation'

interface PaymentConfirmationProps {
    isSuccess: boolean
    errorMessage?: string
}

const CART_KEY = 'ai-blog-cart'

export function PaymentConfirmation({
    isSuccess,
    errorMessage,
}: PaymentConfirmationProps) {
    const t = useTranslations('pricing.Checkout')
    const router = useRouter()
    const [totalCoins, setTotalCoins] = useState<number>(0)

    // Load cart data only once on component mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_KEY)
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart) as CoinPackage[]

                // Calculate total coins from cart
                const calculatedTotalCoins = parsedCart.reduce(
                    (sum, item) => sum + (item.soLuongCoin || 0),
                    0
                )

                setTotalCoins(calculatedTotalCoins)
            }
        } catch (error) {
            console.error('Error loading cart:', error)
        }
    }, [])

    const handleBackToHome = useCallback(() => {
        // Clear cart data from localStorage
        localStorage.removeItem(CART_KEY)
        router.push('/')
    }, [router])

    const handleViewHistory = useCallback(() => {
        // Clear cart data from localStorage
        localStorage.removeItem(CART_KEY)
        router.push('/transaction-history')
    }, [router])

    const handleTryAgain = useCallback(() => {
        router.push('/checkout')
    }, [router])

    if (isSuccess) {
        return (
            <div className="max-w-3xl mx-auto mt-[80px]">
                <Card className="border-green-200 shadow-lg">
                    <CardHeader className="bg-green-50 border-b border-green-100">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 text-green-800 p-5 rounded-full shadow-inner">
                                <Check className="h-14 w-14" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-2xl text-green-800">
                            {t('purchaseSuccessful')}
                        </CardTitle>
                        <CardDescription className="text-center text-green-700 text-lg">
                            {t('thankYou')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-medium mb-4 text-lg">
                                    {t('coins')} {t('received')}
                                </h3>
                                <div className="flex items-center justify-center bg-primary/10 p-8 rounded-lg shadow-inner">
                                    <Coins className="h-12 w-12 text-primary mr-5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('youWillReceive')}
                                        </p>
                                        <p className="text-4xl font-bold text-primary">
                                            {totalCoins.toLocaleString()}{' '}
                                            <span className="text-xl">
                                                {t('coin')}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-4 pb-6">
                        <Button
                            className="w-full h-12 text-base"
                            onClick={handleBackToHome}
                        >
                            {t('backToHome')}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12 text-base"
                            onClick={handleViewHistory}
                        >
                            {t('viewTransactionHistory')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Error state
    return (
        <div className="max-w-3xl mx-auto mt-[80px]">
            <Card className="border-red-200 shadow-lg">
                <CardHeader className="bg-red-50 border-b border-red-100">
                    <div className="flex justify-center mb-4">
                        <div className="bg-red-100 text-red-800 p-5 rounded-full shadow-inner">
                            <AlertTriangle className="h-14 w-14" />
                        </div>
                    </div>
                    <CardTitle className="text-center text-2xl text-red-800">
                        {t('paymentFailed')}
                    </CardTitle>
                    {/* Error message hidden as requested */}
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
                            <div className="flex items-center gap-4 mb-3 text-amber-800">
                                <RefreshCcw className="h-5 w-5" />
                                <h5 className="font-medium">{t('whatNext')}</h5>
                            </div>
                            <ul className="list-disc list-inside space-y-2 text-sm text-amber-800">
                                <li>{t('checkPaymentMethod')}</li>
                                <li>{t('tryAgainLater')}</li>
                                <li>{t('contactSupport')}</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-4 pb-6">
                    <Button
                        className="w-full h-12 text-base"
                        onClick={handleTryAgain}
                    >
                        {t('tryAgain')}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-12 text-base"
                        onClick={handleBackToHome}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('backToHome')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
