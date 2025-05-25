'use client'

import { de } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
    Lightbulb,
    PenTool,
    Users,
    Award,
    Sparkles,
    BookOpen,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { brandName } from '@/core/config/appConfig'

export function FeaturesSection() {
    const t = useTranslations('landing.FeaturesSection')
    const features = [
        {
            icon: (
                <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            ),
            title: t('creativation'),
            description: t('creativationDescription'),
        },
        {
            icon: <PenTool className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />,
            title: t('writePublish'),
            description: t('writePublishDescription'),
        },
        {
            icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />,
            title: t('communityEngagement'),
            description: t('communityEngagementDescription'),
        },
        {
            icon: <Award className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />,
            title: t('earnRewards'),
            description: t('earnRewardsDescription'),
        },
        {
            icon: (
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            ),
            title: t('aiPoweredTools'),
            description: t('aiPoweredToolsDescription'),
        },
        {
            icon: (
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            ),
            title: t('curatedContent'),
            description: t('curatedContentDescription'),
        },
    ]

    return (
        <section className="py-12 md:py-16 lg:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-10 md:mb-16">
                    <motion.h2
                        className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        {t('whyChoose')}
                        {` `}
                        <span className="text-purple-600">{brandName}</span>
                    </motion.h2>
                    <motion.p
                        className="text-gray-600 max-w-2xl mx-auto px-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {t('ourPlatformDescription')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow hover:border-purple-200"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="bg-purple-50 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm md:text-base">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
