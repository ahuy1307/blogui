'use client'

import { useEffect, useState } from 'react'
import { Eye, Heart, Clock } from 'lucide-react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/other-ui/Tabs'
import { BlogFeatureCard } from '../blog/BlogFeatureCard'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Blog } from '@/types/interface'
import { Spin } from 'antd'
import { useTranslations } from 'next-intl'
import { useIsMobile } from '@/hooks/useMobile'

export function FeaturedBlogSection() {
    const t = useTranslations('landing.FeaturedBlogSection')
    const [activeTab, setActiveTab] = useState('most_viewed')

    const {
        data: blogPosts = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['blogs', activeTab],
        queryFn: async () => {
            const response = await authenticationService.searchBlogs({
                type: activeTab,
            })
            return response.data.results.slice(0, 6) as Blog[]
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Always refetch blogs when the component is mounted
    useEffect(() => {
        refetch()
    }, [refetch])

    const isMobile = useIsMobile()

    return (
        <section className="py-10 bg-white">
            <div className="container mx-auto px-4">
                <Tabs defaultValue="most_viewed" onValueChange={setActiveTab}>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {t('title')}
                        </h2>
                        <TabsList>
                            <TabsTrigger
                                value="most_viewed"
                                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {t('mostViewed')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="most_liked"
                                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                            >
                                <Heart className="h-4 w-4 mr-2" />
                                {t('mostLiked')}
                            </TabsTrigger>
                            <TabsTrigger
                                value=""
                                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                {t('latest')}
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spin />
                        </div>
                    ) : (
                        <TabsContent value={activeTab} className="mt-0">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.isArray(blogPosts) &&
                                    blogPosts.length > 0 &&
                                    blogPosts.map((blog, index) => (
                                        <BlogFeatureCard
                                            countTopics={isMobile ? 2 : 3}
                                            key={index}
                                            blog={blog}
                                            icon={<Clock className="h-5 w-5" />}
                                        />
                                    ))}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </section>
    )
}
