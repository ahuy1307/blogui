'use client'

import { BlogDetail } from '@/components/features/blog/BlogDetail'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import { AppDataProvider } from '@/contexts/AppDataProvider'

export default function BlogPost({ params }: any) {

    const { slug } = params

    // Fetch blog details
    const {
        data: blogDetail,
        refetch: refetchBlogDetail,
        isLoading: isBlogDetailLoading,
    } = useQuery({
        queryKey: ['blogDetail', slug],
        queryFn: async () => {
            const response = await authenticationService.getBlogBySlug({
                slug,
            })
            return response.data
        },
        enabled: !!slug, // Only fetch if slug exists
    })

    // Fetch related blogs by topic
    const { data: blogsByTopic, isLoading: isBlogsByTopicLoading } = useQuery({
        queryKey: ['blogsByTopic', blogDetail?.id],
        queryFn: async () => {
            if (!blogDetail?.id) return []
            const response = await authenticationService.getBlogsByTopic({
                blog_id: blogDetail.id,
            })
            return response.data
        },
        enabled: !!blogDetail?.id, // Only fetch if blogDetail exists
    })

    // Combine refetch functions for convenience
    const refetchAll = () => {
        refetchBlogDetail()
    }

    if (isBlogDetailLoading || isBlogsByTopicLoading) {
        return (
            <Spin
                size="large"
                className="flex justify-center items-center h-screen"
            />
        )
    }

    return (
        <AppDataProvider>
            <BlogDetail
                blogDetail={blogDetail}
                blogsByTopic={blogsByTopic}
                refetch={refetchAll} // Pass refetch function to BlogDetail
            />
        </AppDataProvider>
    )
}
