'use client'

import TopicCard from '@/components/features/blog/TopicCard'
import { Footer } from '@/components/features/home/Footer'
import Header from '@/components/features/home/Header'
import { useAppData } from '@/contexts/AppDataProvider'
import { useTranslations } from 'next-intl'

export default function TopicsPage() {
    const { topics, isLoading, error } = useAppData()
    const t = useTranslations('topic')

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Header />
            <main className="container mx-auto px-4 py-28">
                <section className="mb-12">
                    <h1 className="text-4xl font-bold mb-2 text-center">
                        {t('exploreTopics')}
                    </h1>
                    <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                        {t('exploreTopicsDescription')}
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.slice(0, 9).map((topic, index) => (
                            <TopicCard key={index} topic={topic} />
                        ))}
                    </div>
                </section>
            </main>
            <Footer topics={topics.slice(0, 6)} />
        </div>
    )
}
