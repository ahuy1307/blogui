'use client'

import type React from 'react'

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
import { Coins, Check, Loader2, ShoppingCart } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/other-ui/Dialog'
import { formatCurrency } from '@/lib/utils'
import { useMissionStore } from '@/store/mission-store'
import Link from 'next/link'
import { useToast } from '@/components/other-ui/useToast'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useRouter } from '@/navigation'
import { useAuth } from '@/contexts/auth/AuthContext'
import LoginModal from '../features/home/LoginModal'

export interface CoinPackage {
    id: string
    tenGoi: string
    giaBan: number
    soLuongCoin: number
    noiBat?: boolean
    description?: string
}

// Save cart to localStorage
const saveCart = (cart: CoinPackage[]) => {
    try {
        localStorage.setItem('ai-blog-cart', JSON.stringify(cart))
    } catch (error) {
        console.error('Error saving cart:', error)
    }
}

export function CoinPurchase() {
    const t = useTranslations('pricing')
    const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(
        null
    )
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    // const { addCoins } = useMissionStore()
    const { toast } = useToast()
    const [cartItems, setCartItems] = useState<number>(0)
    const [packages, setPackages] = useState<CoinPackage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)

    const showModal = () => {
        setIsLoginModalVisible(true)
    }

    const handleOk = () => {
        setIsLoginModalVisible(false)
    }

    const handleCancel = () => {
        setIsLoginModalVisible(false)
    }
    const { isAuthenticated } = useAuth()

    // Fetch packages from the service
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const response =
                    await authenticationService.getSubscriptionPackages()

                if (response && response.data) {
                    // Additional debugging to see exactly what structure we're receiving

                    // Examine the first item in the array if it exists
                    if (
                        Array.isArray(response.data) &&
                        response.data.length > 0
                    ) {
                        // Set the packages with a more explicit callback to verify data is properly set
                        setPackages((prevPackages) => {
                            return response.data
                        })
                    } else if (
                        response.data.packages &&
                        Array.isArray(response.data.packages)
                    ) {
                        // Same check for nested packages structure

                        setPackages(response.data.packages)
                    } else {
                        // If we can't find the array, show the exact response for debugging

                        setError('Unexpected response format')
                    }
                } else {
                    setError('No data received')
                }
            } catch (error) {
                setError(
                    `API error: ${error instanceof Error ? error.message : String(error)}`
                )
            } finally {
                setIsLoading(false)
                // After loading, check if packages state was properly updated
                setTimeout(() => {}, 0)
            }
        }

        fetchPackages()
    }, [toast, t])

    // Debugging useEffect to track changes to packages state
    useEffect(() => {}, [packages])

    const handleSelectPackage = (pkg: CoinPackage) => {
        if (!isAuthenticated) {
            showModal()
            return
        }
        setSelectedPackage(pkg)
        saveCart([pkg])
        setCartItems(1)
        setShowConfirmation(true)
        router.push('/checkout')
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12,
            },
        },
    }

    const titleVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                duration: 0.6,
            },
        },
    }

    const featureSectionVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.8,
                staggerChildren: 0.1,
                delayChildren: 1,
            },
        },
    }

    return (
        <>
            <LoginModal
                visible={isLoginModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            />
            <motion.div
                className="text-center mb-12"
                initial="hidden"
                animate="visible"
                variants={titleVariants}
            >
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                    {t('buyCoin')}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {t('buyCoinsDescription')}
                </p>
            </motion.div>

            {isLoading ? (
                <motion.div
                    className="flex justify-center items-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="ml-2 text-lg">{t('loadingPackages')}</span>
                </motion.div>
            ) : (
                <>
                    {packages.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-lg text-muted-foreground">
                                {t('noPackagesAvailable')}
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="mt-4"
                            >
                                {t('refresh')}
                            </Button>
                        </div>
                    ) : (
                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto pt-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {packages.map((pkg, index) => {
                                return (
                                    <motion.div
                                        key={pkg.id || index}
                                        variants={itemVariants}
                                        custom={index}
                                        className="package-card"
                                    >
                                        <Card
                                            className={`flex flex-col ${
                                                pkg.noiBat
                                                    ? 'border-primary shadow-lg scale-105 relative'
                                                    : ''
                                            } transition-all hover:shadow-md`}
                                        >
                                            {pkg.noiBat && (
                                                <motion.div
                                                    className="absolute -top-4 left-0 right-0 flex justify-center"
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    transition={{
                                                        delay: 0.6,
                                                        duration: 0.3,
                                                    }}
                                                >
                                                    <span className="bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full">
                                                        {t('mostPopular')}
                                                    </span>
                                                </motion.div>
                                            )}
                                            <CardHeader
                                                className={
                                                    pkg.noiBat ? 'pt-8' : ''
                                                }
                                            >
                                                <CardTitle className="text-xl">
                                                    {pkg.tenGoi}
                                                </CardTitle>
                                                <CardDescription>
                                                    {pkg.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <div className="mb-6">
                                                    <p className="text-3xl font-bold">
                                                        {formatCurrency(
                                                            pkg.giaBan,
                                                            'VND'
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex items-center mb-6 bg-primary/10 p-3 rounded-lg mt-12">
                                                    <Coins className="h-8 w-8 text-primary mr-3" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t(
                                                                'youWillReceive'
                                                            )}
                                                        </p>
                                                        <p className="text-2xl font-bold text-primary">
                                                            {pkg.soLuongCoin.toLocaleString()}{' '}
                                                            {t('coin')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex gap-2 pt-12">
                                                <Button
                                                    className="flex-1"
                                                    onClick={() =>
                                                        handleSelectPackage(pkg)
                                                    }
                                                    variant={
                                                        pkg.noiBat
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {t('buyNow')}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    )}
                </>
            )}

            <motion.div
                className="mt-16 text-center"
                variants={featureSectionVariants}
                initial="hidden"
                animate="visible"
                viewport={{ once: true }}
            >
                <motion.h2
                    className="text-2xl font-bold mb-6"
                    variants={titleVariants}
                >
                    {t('usingCoins')}
                </motion.h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <FeatureCardAnimated
                        title={t('createAIContent')}
                        description={t('createAIContentDescription')}
                        icon={<Coins className="h-6 w-6 text-purple-500" />}
                        coinCost={10}
                        delay={0}
                    />
                    <FeatureCardAnimated
                        title={t('createAIImage')}
                        description={t('createAIImageDescription')}
                        icon={<Coins className="h-6 w-6 text-green-500" />}
                        coinCost={15}
                        delay={0.1}
                    />
                    <FeatureCardAnimated
                        title={t('unlockPremiumFeatures')}
                        description={t('unlockPremiumFeaturesDescription')}
                        icon={<Coins className="h-6 w-6 text-blue-500" />}
                        coinCost={0}
                        delay={0.2}
                    />
                </div>
            </motion.div>
        </>
    )
}

interface FeatureCardProps {
    title: string
    description: string
    icon: React.ReactNode
    coinCost: number
    delay?: number
}

function FeatureCardAnimated({
    title,
    description,
    icon,
    coinCost,
    delay = 0,
}: FeatureCardProps) {
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15,
                delay,
            },
        },
        hover: {
            scale: 1.05,
            transition: { type: 'spring', stiffness: 400, damping: 10 },
        },
    }

    return (
        <motion.div
            className="bg-card border rounded-lg p-6 flex flex-col items-center text-center"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <motion.div
                className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    delay: delay + 0.3,
                    type: 'spring',
                    stiffness: 200,
                }}
            >
                {icon}
            </motion.div>
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            <motion.div
                className="mt-auto flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.4, duration: 0.3 }}
            >
                <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-medium">{coinCost} coin</span>
            </motion.div>
        </motion.div>
    )
}

// Keep the original FeatureCard component for fallback or non-animated versions
function FeatureCard({ title, description, icon, coinCost }: FeatureCardProps) {
    return (
        <div className="bg-card border rounded-lg p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            <div className="mt-auto flex items-center">
                <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-medium">{coinCost} coin</span>
            </div>
        </div>
    )
}
