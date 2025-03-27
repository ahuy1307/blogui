'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/other-ui/button'
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

interface HeroSectionProps {
    onSubscribeClick: () => void
}

export function HeroSection({ onSubscribeClick }: HeroSectionProps) {
    const t = useTranslations('landing.HeroSection')
    const [isHovered, setIsHovered] = useState(false)

    return (
        <section className="relative overflow-hidden py-20 bg-gradient-to-b from-purple-50 to-white">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-2">
                            {t('tagline')}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900">
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
                        <p className="text-gray-600 text-lg md:text-xl">
                            {t('description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/articles/"
                                className="flex items-center gap-2"
                            >
                                <Button
                                    className="bg-purple-600 hover:bg-purple-700 text-white group relative overflow-hidden"
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
                                className="border-gray-300 hover:bg-gray-50"
                                size="lg"
                                onClick={onSubscribeClick}
                            >
                                {t('joinNewsletter')}
                            </Button>
                            <Button
                                variant="outline"
                                className="border-purple-500 text-purple-500 hover:bg-purple-50"
                                size="lg"
                            >
                                <Link
                                    href="/write/"
                                    className="flex items-center gap-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                    {t('writeBlog')}
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="relative h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                            <Image
                                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&h=800&auto=format&fit=crop"
                                alt="Visualization of knowledge and insights"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                            {/* Floating badges */}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-600" />
                                <span className="font-medium text-sm">
                                    {t('technology')}
                                </span>
                            </div>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md flex items-center gap-2">
                                <FerrisWheel className="h-5 w-5 text-green-600" />
                                <span className="font-medium text-sm">
                                    {t('entertainment')}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-600" />
                                <span className="font-medium text-sm">
                                    {t('finance')}
                                </span>
                            </div>
                            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-sm">
                                    {t('health')}
                                </span>
                            </div>
                        </div>

                        {/* Stats overlay */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex justify-center gap-8 w-3/5">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    500+
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t('blog')}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    10k+
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t('readers')}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    50+
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t('contributors')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
