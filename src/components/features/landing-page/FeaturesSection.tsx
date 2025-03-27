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
            icon: <Lightbulb className="h-6 w-6 text-purple-600" />,
            title: t('creativation'),
            description: t('creativationDescription'),
        },
        {
            icon: <PenTool className="h-6 w-6 text-purple-600" />,
            title: t('writePublish'),
            description: t('writePublishDescription'),
        },
        {
            icon: <Users className="h-6 w-6 text-purple-600" />,
            title: t('communityEngagement'),
            description: t('communityEngagementDescription'),
        },
        {
            icon: <Award className="h-6 w-6 text-purple-600" />,
            title: t('earnRewards'),
            description: t('earnRewardsDescription'),
        },
        {
            icon: <Sparkles className="h-6 w-6 text-purple-600" />,
            title: t('aiPoweredTools'),
            description: t('aiPoweredToolsDescription'),
        },
        {
            icon: <BookOpen className="h-6 w-6 text-purple-600" />,
            title: t('curatedContent'),
            description: t('curatedContentDescription'),
        },
    ]

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-3xl font-bold text-gray-900 mb-4"
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
                        className="text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {t('ourPlatformDescription')}
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:border-purple-200"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
