'use client'

import { useEffect, useState } from 'react'
import { Eye, Heart, Clock, Bookmark } from 'lucide-react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/other-ui/Tabs'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import { useTranslations } from 'next-intl'
import { SavedLikeBlog } from './SavedLikedBlog'
import { motion } from 'framer-motion'
import { Button } from '@/components/other-ui/Button'
import { Link } from '@/navigation'

// Empty state component
function EmptyState({ icon, title, description, actionText }: any) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            <div className="mb-6 rounded-full bg-gray-100 p-6">{icon}</div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-gray-600 mb-8 max-w-lg">{description}</p>
            <Button
                asChild
                size="lg"
                className="px-8 py-6 text-base font-medium hover:text-white"
            >
                <Link href="/blog">{actionText}</Link>
            </Button>
        </motion.div>
    )
}

export function BlogLibrary() {
    const t = useTranslations('blog.BlogLibrary')
    const [activeTab, setActiveTab] = useState('liked')

    const {
        data: blogPosts = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['blogs', activeTab],
        queryFn: async () => {
            const response = await authenticationService.getSavedLikedBlogs({
                type: activeTab,
            })
            return response.data.results
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Always refetch blogs when the component is mounted
    useEffect(() => {
        refetch()
    }, [activeTab])

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <Tabs defaultValue="liked" onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {t('title')}
                        </h2>
                        <TabsList>
                            <TabsTrigger
                                value="liked"
                                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                            >
                                <Heart className="h-4 w-4 mr-2" />
                                {t('liked')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="saved"
                                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {t('saved')}
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spin />
                        </div>
                    ) : (
                        <TabsContent value={activeTab} className="mt-0">
                            {Array.isArray(blogPosts) &&
                            blogPosts.length > 0 ? (
                                <div className="grid md:grid-cols-3 gap-6">
                                    {blogPosts.map((blog, index) => (
                                        <SavedLikeBlog
                                            key={index}
                                            blog={blog.baiViet}
                                            refetch={refetch}
                                            type={activeTab}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={
                                        activeTab === 'liked' ? (
                                            <Heart className="h-12 w-12 text-red-300" />
                                        ) : (
                                            <Bookmark className="h-12 w-12 text-purple-300" />
                                        )
                                    }
                                    title={
                                        activeTab === 'liked'
                                            ? t('noBlogsLiked')
                                            : t('noBlogsSaved')
                                    }
                                    description={
                                        activeTab === 'liked'
                                            ? t('noBlogsLikedDescription')
                                            : t('noBlogsSavedDescription')
                                    }
                                    actionText={t('discoverBlogs')}
                                />
                            )}
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </section>
    )
}
