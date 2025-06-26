'use client'

import { useState } from 'react'
import { Link, useRouter } from '@/navigation'
import Image from 'next/image'
import { Button } from '@/components/other-ui/Button'
import {
    Pencil,
    ArrowRight,
    Brain,
    Sparkles,
    Zap,
    FerrisWheel,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import LoginModal from '../home/LoginModal'
import { useAuth } from '@/contexts/auth/AuthContext'

interface HeroSectionProps {
    onSubscribeClick: () => void
}

export function HeroSection({ onSubscribeClick }: HeroSectionProps) {
    const t = useTranslations('landing.HeroSection')
    const [isHovered, setIsHovered] = useState(false)

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
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    return (
        <>
            <LoginModal
                visible={isLoginModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            />
            <section className="relative mt-[80px] sm:mt-6 pb-20 sm:pb-6 overflow-hidden py-12 md:py-20 lg:py-28 bg-gradient-to-b from-purple-50 to-white">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-32 md:w-64 h-32 md:h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-32 md:w-64 h-32 md:h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/3 w-32 md:w-64 h-32 md:h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <motion.div
                            className="space-y-4 md:space-y-6 text-center lg:text-left"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-block px-3 py-1 text-sm md:text-base bg-purple-100 text-purple-800 rounded-full font-medium mb-2">
                                {t('tagline')}
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                                {t('title')}{' '}
                                <span className="text-purple-600 relative">
                                    <span className="relative z-10">
                                        {t('highlight')}
                                    </span>
                                    <svg
                                        className="absolute -bottom-2 left-0 w-full h-3 text-purple-200"
                                        viewBox="0 0 100 12"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M0,0 Q50,12 100,0"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-xl mx-auto lg:mx-0">
                                {t('description')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    href="/blog"
                                    className="flex items-center gap-2"
                                >
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700 text-white group relative overflow-hidden w-full sm:w-auto"
                                        size="lg"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        {t('exploreBlog')}
                                        <ArrowRight
                                            className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                                        />
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                                    size="lg"
                                    onClick={onSubscribeClick}
                                >
                                    {t('joinNewsletter')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-purple-500 text-purple-500 hover:bg-purple-50 w-full sm:w-auto"
                                    size="lg"
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            showModal()
                                        } else {
                                            router.push('/write')
                                        }
                                    }}
                                >
                                    <p className="flex items-center gap-2 justify-center w-full">
                                        <Pencil className="h-4 w-4" />
                                        {t('writeBlog')}
                                    </p>
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative mt-8 lg:mt-0"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="relative h-[350px] sm:h-[350px] md:h-[350px] lg:h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                                <Image
                                    src="/images/ai-book.jpg"
                                    alt="Visualization of knowledge and insights"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                                {/* Floating badges */}
                                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 shadow-md flex items-center gap-1 md:gap-2">
                                    <Brain className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                                    <span className="font-medium text-xs md:text-sm">
                                        {t('technology')}
                                    </span>
                                </div>
                                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 shadow-md flex items-center gap-1 md:gap-2">
                                    <FerrisWheel className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                    <span className="font-medium text-xs md:text-sm">
                                        {t('entertainment')}
                                    </span>
                                </div>
                                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 shadow-md flex items-center gap-1 md:gap-2">
                                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                                    <span className="font-medium text-xs md:text-sm">
                                        {t('finance')}
                                    </span>
                                </div>
                                <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2 shadow-md flex items-center gap-1 md:gap-2">
                                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                                    <span className="font-medium text-xs md:text-sm">
                                        {t('health')}
                                    </span>
                                </div>
                            </div>

                            {/* Stats overlay */}
                            <div className="absolute border border-b-2 z-[100] -bottom-20 sm:-bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg p-2 md:p-3 flex justify-center gap-8 md:gap-8 w-11/12 sm:w-3/5 md:w-2/4 lg:w-3/6">
                                <div className="text-center">
                                    <p className="text-lg md:text-2xl font-bold text-purple-600">
                                        500+
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        {t('blog')}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg md:text-2xl font-bold text-purple-600">
                                        10k+
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        {t('readers')}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg md:text-2xl font-bold text-purple-600">
                                        50+
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        {t('contributors')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    )
}
