'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/other-ui/Button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/other-ui/Card'
import { Input } from '@/components/other-ui/Input'
import { Label } from '@/components/other-ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/other-ui/RadioGroup'
import { Separator } from '@/components/other-ui/Separator'
import {
    Coins,
    CreditCard,
    Trash2,
    ArrowLeft,
    Loader2,
    Check,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Link } from '@/navigation'
import { CoinPackage } from '../pricing/CoinPurchase'
import { useLocale, useTranslations } from 'next-intl'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'

// Cart key for localStorage
const CART_KEY = 'ai-blog-cart'

// Tax percentage - 5%
const TAX_PERCENT = 5

export function CheckoutClient() {
    const t = useTranslations('pricing.Checkout')
    const [cart, setCart] = useState<CoinPackage[]>([])
    const [paymentMethod, setPaymentMethod] = useState<string>('card')
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const router = useRouter()
    const [orderNumber, setOrderNumber] = useState('')

    // Generate random order number
    useEffect(() => {
        const randomOrderNumber = Math.floor(
            100000000 + Math.random() * 900000000
        ).toString()
        setOrderNumber(randomOrderNumber)
    }, [])

    // Load cart from localStorage on component mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_KEY)
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart)
                // Reconstruct the cart with the full package objects
                console.log('Parsed Cart:', parsedCart)

                setCart(parsedCart)
            } else {
                // Initialize with sample items if cart is empty
            }
        } catch (error) {
            console.error('Error loading cart:', error)
        }
    }, [])

    const removeFromCart = (packageId: string) => {
        setCart(cart.filter((item) => item.id !== packageId))
    }

    const subtotal = cart.reduce((sum, item) => sum + item.giaBan, 0)
    const taxAmount = (subtotal * TAX_PERCENT) / 100
    const totalAmount = subtotal + taxAmount
    const totalCoins = cart.reduce((sum, item) => sum + item.soLuongCoin, 0)
    const locale = useLocale()

    const handleCheckout = async () => {
        if (cart.length === 0) return

        try {
            setIsProcessing(true)

            // Get first package ID for payment - in a real implementation you might need to handle multiple packages
            const packageId = cart[0].id

            // Call VNPay service to get payment URL
            const response = await authenticationService.getVnPayUrl({
                package_id: packageId,
                redirect_endpoint: `${locale}/checkout/confirm`,
            })

            // If we have a payment URL, prepare for navigation
            if (response?.data?.paymentUrl) {
                // Set a flag in sessionStorage to indicate a redirect is happening
                // This prevents additional React updates
                sessionStorage.setItem('payment_redirect_in_progress', 'true')

                // Use setTimeout to give the browser a moment before navigation
                // This helps prevent the React error by delaying the navigation slightly
                setTimeout(() => {
                    window.location.href = response.data.paymentUrl
                }, 10)

                return
            } else {
                throw new Error('Payment URL not received')
            }
        } catch (error) {
            console.error('Payment error:', error)
            setIsProcessing(false)
        }
    }

    // Add a cleanup effect to handle the redirect flag
    useEffect(() => {
        // Clean up the redirect flag when component unmounts
        return () => {
            sessionStorage.removeItem('payment_redirect_in_progress')
        }
    }, [])

    const handleSuccessClose = () => {
        setShowSuccess(false)
        router.push('/')
    }

    if (cart.length === 0 && !showSuccess) {
        return (
            <div className="max-w-3xl mx-auto text-center mt-[80px]">
                <h1 className="text-3xl font-bold mb-6">{t('cart')}</h1>
                <Card className="shadow-lg border-muted/30">
                    <CardContent className="pt-8 pb-10">
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="bg-primary/5 p-6 rounded-full mb-6">
                                <Coins className="h-20 w-20 text-primary/60" />
                            </div>
                            <h2 className="text-2xl font-medium mb-3">
                                {t('emptyCart')}
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-md">
                                {t('noPackagesAdded')}
                            </p>
                            <Link href="/pricing">
                                <Button
                                    size="lg"
                                    className="px-8 py-6 text-base font-medium"
                                >
                                    {t('buyNow')}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // If showing success screen
    if (showSuccess) {
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
                            <div className="bg-muted/50 p-5 rounded-lg shadow-sm">
                                <h3 className="font-medium mb-3 text-lg">
                                    {t('orderDetails')}
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('orderNumber')}
                                        </span>
                                        <span className="font-medium">
                                            {orderNumber}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('date')}
                                        </span>
                                        <span className="font-medium">
                                            {new Date().toLocaleDateString(
                                                'vi-VN'
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('paymentMethod')}
                                        </span>
                                        <span className="font-medium">
                                            {paymentMethod === 'card'
                                                ? t('creditCard')
                                                : paymentMethod === 'momo'
                                                  ? t('momoWallet')
                                                  : t('vnpay')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('totalAmount')}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(totalAmount, 'VND')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-4 text-lg">
                                    {t('coins')} đã mua
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

                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-muted px-4 py-2 font-medium">
                                    {t('packageDetails')}
                                </div>
                                <div className="divide-y">
                                    {cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center p-4"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {item.tenGoi}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.soLuongCoin.toLocaleString()}{' '}
                                                    {t('coin')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatCurrency(
                                                        item.giaBan,
                                                        'VND'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-4 pb-6">
                        <Button
                            onClick={handleSuccessClose}
                            className="w-full h-12 text-base"
                        >
                            {t('backToHome')}
                        </Button>
                        <Button
                            variant="outline"
                            asChild
                            className="w-full h-12 text-base"
                        >
                            <Link href="/transaction-history">
                                {t('viewTransactionHistory')}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="max-w-6xl mx-auto mt-[80px]">
                <Link
                    href="/subscription"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('backToPricing')}
                </Link>

                <h1 className="text-3xl font-bold mb-8">
                    {t('confirmPayment')}
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-muted/20">
                                <CardTitle>{t('yourCart')}</CardTitle>
                                <CardDescription>
                                    {t('selectedPackages')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-5 border rounded-lg hover:bg-muted/5 transition-colors"
                                        >
                                            <div className="flex-grow">
                                                <h3 className="font-medium text-lg">
                                                    {item.tenGoi}
                                                </h3>
                                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                    <Coins className="h-3.5 w-3.5 mr-1 text-primary/70" />
                                                    <span>
                                                        {item.soLuongCoin.toLocaleString()}{' '}
                                                        {t('coin')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-28 text-right font-medium text-lg">
                                                    {formatCurrency(
                                                        item.giaBan,
                                                        'VND'
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-muted/20">
                                <CardTitle>{t('paymentMethods')}</CardTitle>
                                <CardDescription>
                                    {t('choosePaymentMethod')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={setPaymentMethod}
                                    className="space-y-4"
                                >
                                    {/* Credit card payment option - commented out as requested */}
                                    {/* <div className="flex items-center space-x-2 border p-4 rounded-lg">
                                        <RadioGroupItem
                                            value="card"
                                            id="card"
                                        />
                                        <Label
                                            htmlFor="card"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <CreditCard className="h-5 w-5" />
                                            {t('creditCard')}
                                        </Label>
                                    </div> */}

                                    {/* MOMO wallet option - commented out as requested */}
                                    {/* <div className="flex items-center space-x-3 border p-5 rounded-lg hover:bg-muted/5 transition-colors">
                                        <RadioGroupItem
                                            value="momo"
                                            id="momo"
                                        />
                                        <Label
                                            htmlFor="momo"
                                            className="cursor-pointer flex items-center"
                                        >
                                            <div className="w-7 h-7 mr-2 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">M</div>
                                            {t('momoWallet')}
                                        </Label>
                                    </div> */}

                                    <div className="flex items-center space-x-3 border p-5 rounded-lg hover:bg-muted/5 transition-colors">
                                        <RadioGroupItem
                                            value="vnpay"
                                            id="vnpay"
                                            checked
                                        />
                                        <Label
                                            htmlFor="vnpay"
                                            className="cursor-pointer flex items-center"
                                        >
                                            <div className="w-7 h-7 mr-2 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                V
                                            </div>
                                            {t('vnpay')}
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {/* Credit card details section - commented out as requested */}
                                {/* {paymentMethod === 'card' && (
                                    <div className="mt-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardName">
                                                    Tên chủ thẻ
                                                </Label>
                                                <Input
                                                    id="cardName"
                                                    placeholder="Nguyễn Văn A"
                                                    value={
                                                        paymentDetails.cardName
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentDetails({
                                                            ...paymentDetails,
                                                            cardName:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">
                                                    Số thẻ
                                                </Label>
                                                <Input
                                                    id="cardNumber"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={
                                                        paymentDetails.cardNumber
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentDetails({
                                                            ...paymentDetails,
                                                            cardNumber:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry">
                                                    Ngày hết hạn
                                                </Label>
                                                <Input
                                                    id="expiry"
                                                    placeholder="MM/YY"
                                                    value={
                                                        paymentDetails.expiry
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentDetails({
                                                            ...paymentDetails,
                                                            expiry: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvc">CVC</Label>
                                                <Input
                                                    id="cvc"
                                                    placeholder="123"
                                                    value={paymentDetails.cvc}
                                                    onChange={(e) =>
                                                        setPaymentDetails({
                                                            ...paymentDetails,
                                                            cvc: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )} */}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="sticky top-6 shadow-md border-primary/10">
                            <CardHeader className="bg-muted/20">
                                <CardTitle className="flex justify-between items-center">
                                    <span>{t('orderSummary')}</span>
                                    <Coins className="h-5 w-5 text-primary/70" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('subtotal')}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(subtotal, 'VND')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('tax', { percent: TAX_PERCENT })}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(taxAmount, 'VND')}
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-medium text-lg">
                                        <span>{t('total')}</span>
                                        <span>
                                            {formatCurrency(totalAmount, 'VND')}
                                        </span>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-lg mt-2">
                                        <div className="flex justify-between text-primary">
                                            <span className="font-medium">
                                                {t('totalCoinsReceived')}
                                            </span>
                                            <div className="flex items-center">
                                                <Coins className="h-4 w-4 mr-1" />
                                                <span className="font-bold">
                                                    {totalCoins.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-6">
                                <Button
                                    className="w-full h-12 text-base font-medium"
                                    size="lg"
                                    onClick={handleCheckout}
                                    disabled={isProcessing || cart.length === 0}
                                >
                                    {isProcessing && (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    )}
                                    {isProcessing
                                        ? t('processing')
                                        : t('confirmPayment')}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
