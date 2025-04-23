'use client'

import { BlogDetail } from '@/components/features/blog/BlogDetail'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import { AppDataProvider } from '@/contexts/AppDataProvider'
import { useEffect } from 'react'
import Header from '@/components/features/home/Header'
import styles from '@/components/ui/NotFound404/NotFound404.module.scss'
import Image from 'next/image'
import Button from '@/components/ui/Button/Button'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function BlogPost({ params }: any) {
    const { slug } = params
    const t = useTranslations('blog')
    const locale = useLocale()
    const router = useRouter()

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

    // Fetch related blogs by topic only if blog details exist
    const { data: blogsByTopic, isLoading: isBlogsByTopicLoading } = useQuery({
        queryKey: ['blogsByTopic', blogDetail?.id],
        queryFn: async () => {
            const response = await authenticationService.getBlogsByTopic({
                blog_id: blogDetail.id,
            })
            return response.data
        },
        enabled: !!blogDetail?.id, // Only fetch if blogDetail exists and has an id
    })

    const { data: comments, refetch: refetchComment } = useQuery({
        queryKey: ['comments', blogDetail?.id],
        queryFn: async () => {
            const response = await authenticationService.getCommentsByBlogId({
                blog_id: blogDetail.id,
            })
            return response.data
        },
    })

    // Combine refetch functions for convenience
    const refetchAll = () => {
        refetchBlogDetail()
    }

    const handleReturnToBlogPage = () => {
        router.push(`${locale}/blog`)
    }

    useEffect(() => {
        if (blogDetail?.tieuDe) {
            document.title = `${blogDetail.tieuDe} | Suyndy Blog`
        }
    }, [blogDetail?.tieuDe])

    // Show loading only when fetching blog details
    if (isBlogDetailLoading) {
        return (
            <Spin
                size="large"
                className="flex justify-center items-center h-screen"
            />
        )
    }

    // Show not found when blog doesn't exist
    if (!blogDetail) {
        return (
            <>
                <Header />
                <div>
                    <div className={styles.container}>
                        <div className={styles.content_wrapper}>
                            <div className={styles.image_wrapper}>
                                <Image
                                    width={400}
                                    height={240}
                                    src="/images/404_notfound.webp"
                                    alt=""
                                    className={styles.image}
                                />
                            </div>
                            <div className={styles.text_wrapper}>
                                <p
                                    data-testid="not-found-404-main-text"
                                    className={styles.text_main}
                                >
                                    {t('blogNotFound')}
                                </p>
                                <p
                                    data-testid="not-found-404-sub-text"
                                    className={styles.text_sub}
                                >
                                    {t('blogNotFoundSubText')}
                                </p>
                            </div>
                            <div className={styles.button_wrapper}>
                                <Button
                                    onClick={handleReturnToBlogPage}
                                    shape="square"
                                    className={styles.return_btn}
                                >
                                    {t('returnBlogPage')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // Show loading for related blogs
    if (isBlogsByTopicLoading) {
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
                comments={comments && comments.results}
                refetch={refetchAll}
                refetchComment={refetchComment}
            />
        </AppDataProvider>
    )
}
