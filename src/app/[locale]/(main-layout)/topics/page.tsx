'use client'

import TopicCard from '@/components/features/blog/TopicCard'
import { Footer } from '@/components/features/home/Footer'
import Header from '@/components/features/home/Header'
import { useAppData } from '@/contexts/AppDataProvider'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export default function TopicsPage() {
    const { topics, isLoading, error } = useAppData()
    const t = useTranslations('topic')

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Header />
            <main className="md:container mx-auto md:px-4 py-28">
                <section className="mb-12">
                    <motion.h1
                        className="text-4xl font-bold mb-2 text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {t('exploreTopics')}
                    </motion.h1>
                    <motion.p
                        className="text-gray-600 text-center mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {t('exploreTopicsDescription')}
                    </motion.p>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {topics.slice(0, 9).map((topic, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                transition={{ duration: 0.3 }}
                            >
                                <TopicCard topic={topic} />
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            </main>
            <Footer topics={topics.slice(0, 6)} />
        </div>
    )
}
