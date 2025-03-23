'use client'

import { useState } from 'react'
import { Eye, Heart, Clock, BrainCircuit } from 'lucide-react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/other-ui/tabs'
import { blogPosts } from '@/components/data/blog-posts'
import { FeaturedCard } from '../blog/FeaturedCard'

export function FeaturedArticlesSection() {
    const [activeTab, setActiveTab] = useState('trending')

    // Convert blog posts object to array for easier manipulation
    const blogPostsArray = Object.entries(blogPosts).map(([slug, post]) => ({
        ...post,
        slug,
    }))

    // Get most viewed articles
    const mostViewedArticles = [...blogPostsArray]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 3)

    // Get most favorited articles
    const mostFavoritedArticles = [...blogPostsArray]
        .sort((a, b) => (b.favorites || 0) - (a.favorites || 0))
        .slice(0, 3)

    // Get recent articles
    const recentArticles = [...blogPostsArray]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <Tabs defaultValue="trending" onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Featured Articles
                        </h2>
                        <TabsList>
                            <TabsTrigger
                                value="trending"
                                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Most Viewed
                            </TabsTrigger>
                            <TabsTrigger
                                value="favorites"
                                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                            >
                                <Heart className="h-4 w-4 mr-2" />
                                Most Favorited
                            </TabsTrigger>
                            <TabsTrigger
                                value="latest"
                                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Latest
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="trending" className="mt-0">
                        <div className="grid md:grid-cols-3 gap-6">
                            {mostViewedArticles.map((article, index) => (
                                <FeaturedCard
                                    key={index}
                                    title={article.title}
                                    description={
                                        article.summary ||
                                        article.content.substring(0, 150) +
                                            '...'
                                    }
                                    image={article.image}
                                    date={article.date}
                                    category={article.category}
                                    icon={<BrainCircuit className="h-5 w-5" />}
                                    slug={article.slug}
                                    views={article.views}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="favorites" className="mt-0">
                        <div className="grid md:grid-cols-3 gap-6">
                            {mostFavoritedArticles.map((article, index) => (
                                <FeaturedCard
                                    key={index}
                                    title={article.title}
                                    description={
                                        article.summary ||
                                        article.content.substring(0, 150) +
                                            '...'
                                    }
                                    image={article.image}
                                    date={article.date}
                                    category={article.category}
                                    icon={<Heart className="h-5 w-5" />}
                                    slug={article.slug}
                                    favorites={article.favorites}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="latest" className="mt-0">
                        <div className="grid md:grid-cols-3 gap-6">
                            {recentArticles.map((article, index) => (
                                <FeaturedCard
                                    key={index}
                                    title={article.title}
                                    description={
                                        article.summary ||
                                        article.content.substring(0, 150) +
                                            '...'
                                    }
                                    image={article.image}
                                    date={article.date}
                                    category={article.category}
                                    icon={<Clock className="h-5 w-5" />}
                                    slug={article.slug}
                                />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    )
}
