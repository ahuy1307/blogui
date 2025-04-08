'use client'
import { useState, useCallback, useEffect } from 'react'
import { Link } from '@/navigation'
import {
    ArrowLeft,
    Clock,
    Share2,
    Bookmark,
    Heart,
    AlertTriangle,
} from 'lucide-react'
import { LuFacebook } from 'react-icons/lu'
import { SlSocialLinkedin } from 'react-icons/sl'
import { Button } from '@/components/other-ui/Button'
import { useToast } from '@/components/other-ui/useToast'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/other-ui/Avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/other-ui/DropdownMenu'
import { useMissionStore } from '@/store/mission-store'
import { useNotificationStore } from '@/store/notification-store'
import { Badge } from '@/components/other-ui/Badge'
import Header from '@/components/features/home/Header'
import { PreviewSection } from '@/components/editor/PreviewSection'
import { ReportDialog } from '@/components/features/blog/ReportDialog'
import { FacebookShareButton, LinkedinShareButton } from 'react-share'
import {
    CommentsSection,
    type Comment,
} from '@/components/features/blog/CommentsSection'
import { SectionType } from '@/types/editor'
import { getBaseUrl, getInitials } from '@/helper/utils'
import { Footer } from '../home/Footer'
import { formatReadingTime } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import { Image as AntdImage } from 'antd'
import Image from 'next/image'
import { Toaster } from '@/components/other-ui/Toaster'
import { Blog } from '@/types/interface'
import { useMutation } from '@tanstack/react-query'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useAppData } from '@/contexts/AppDataProvider'
import { useAuth } from '@/contexts/auth/AuthContext'
import LoginModal from '../home/LoginModal'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/other-ui/Tooltip'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/other-ui/Popover'
import { useUnlockBodyScroll } from '@/hooks/useUnlockBodyScroll'
// Helper function to convert API component to SectionType
const convertToSectionType = (component: any): SectionType | null => {
    const { loaiThanhPhan, noiDung, dinhDang, hang, cot, id } = component

    switch (loaiThanhPhan) {
        case 'text': {
            let content = noiDung
            if (
                typeof noiDung === 'string' &&
                noiDung.startsWith('{') &&
                noiDung.endsWith('}')
            ) {
                try {
                    const parsedContent = JSON.parse(noiDung)
                    if (
                        parsedContent.text !== undefined &&
                        parsedContent.format !== undefined
                    ) {
                        content = JSON.stringify({
                            text: parsedContent.text,
                            format: parsedContent.format,
                        })
                    }
                } catch (e) {
                    // Fallback to raw content
                }
            }
            return {
                type: 'text',
                content,
                id,
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        }
        case 'heading':
            return {
                type: 'heading',
                content: noiDung,
                level: dinhDang?.level || 2,
                id,
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        case 'image':
            return {
                type: 'image',
                url: JSON.parse(noiDung)?.url || '',
                caption: JSON.parse(noiDung)?.caption || '',
                size: dinhDang?.size || 'medium',
                id,
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        case 'code':
            return {
                type: 'code',
                content: JSON.parse(noiDung)?.content || '',
                language: JSON.parse(noiDung)?.language || 'javascript',
                id,
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        case 'numbered-list':
            return {
                type: 'numbered-list',
                items: JSON.parse(noiDung)?.items || [],
                fontSize: dinhDang?.fontSize || 'normal',
                title: JSON.parse(noiDung)?.title || '',
                id,
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        case 'bullet-list':
            return {
                type: 'bullet-list',
                items: JSON.parse(noiDung)?.items || [],
                fontSize: dinhDang?.fontSize || 'normal',
                title: JSON.parse(noiDung)?.title || '',
                id,
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        case 'quote':
            return {
                type: 'quote',
                content: JSON.parse(noiDung)?.content || '',
                citation: JSON.parse(noiDung)?.citation || '',
                fontSize: dinhDang?.fontSize || 'normal',
                id,
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        case 'divider':
            return {
                type: 'divider',
                id,
                row: hang,
                column: cot,
                dinhDang: {
                    dividerType: dinhDang?.dividerType || 'solid',
                    spacing: dinhDang?.spacing || 8,
                    thickness: dinhDang?.thickness || 1,
                    color: dinhDang?.color || '#9c65d0',
                },
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        case 'video':
            return {
                type: 'video',
                url: JSON.parse(noiDung)?.url || '',
                caption: JSON.parse(noiDung)?.caption || '',
                id,
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
        default:
            return null
    }
}

// Mock related posts - would be fetched from API in production
export function BlogDetail({
    blogDetail,
    blogsByTopic,
    refetch,
}: {
    blogDetail: Blog
    blogsByTopic: Blog[]
    refetch: () => void
}) {
    const t = useTranslations('blog.BlogDetail')
    const { topics, isLoading, error } = useAppData()
    const { user } = useAuth()

    const { toast } = useToast()
    const locale = useLocale()
    const [comments, setComments] = useState<Comment[]>([])
    const [reportDialogOpen, setReportDialogOpen] = useState(false)
    const { incrementMissionProgress } = useMissionStore()
    const { addNotification } = useNotificationStore()
    const [commentIdCounter, setCommentIdCounter] = useState(1)
    const shareUrl = `${getBaseUrl()}/${locale}/blog/${blogDetail?.slug}`

    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)

    useUnlockBodyScroll()

    useEffect(() => {
        refetch()
    }, [user])

    const showModal = () => {
        setIsLoginModalVisible(true)
    }

    const handleOk = () => {
        setIsLoginModalVisible(false)
    }

    const handleCancel = () => {
        setIsLoginModalVisible(false)
    }

    const { mutate } = useMutation({
        mutationFn: authenticationService.saveOrLikeBlog,
        onSuccess: (res) => {
            toast({
                title: t('successTitle'),
                description: res.data.message,
            })
            refetch()
        },
        onError: (error) => {
            toast({
                title: t('errorTitle'),
                description: error.message,
                variant: 'destructive',
            })
        },
    })

    const generateCommentId = useCallback(() => {
        const id = commentIdCounter
        setCommentIdCounter((prev) => prev + 1)
        return id
    }, [commentIdCounter])

    const handleAddComment = useCallback(
        (newComment: Omit<Comment, 'id' | 'date'>) => {
            const comment = {
                ...newComment,
                id: generateCommentId(),
                date: t('justNow'),
                replies: [],
            }
            setComments((prev) => [...prev, comment])
            incrementMissionProgress('comment')

            if (newComment.mentions?.length && blogDetail) {
                addNotification({
                    type: 'mention',
                    message: t('mentionCommentMessage'),
                    blogSlug: blogDetail.slug,
                    blogTitle: blogDetail.tieuDe,
                })
            }
        },
        [
            generateCommentId,
            incrementMissionProgress,
            addNotification,
            blogDetail,
            t,
        ]
    )

    const handleAddReply = useCallback(
        (parentId: number, newReply: Omit<Comment, 'id' | 'date'>) => {
            const reply = {
                ...newReply,
                id: generateCommentId(),
                date: t('justNow'),
            }

            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === parentId
                        ? {
                              ...comment,
                              replies: [...(comment.replies || []), reply],
                          }
                        : comment
                )
            )
            incrementMissionProgress('comment')

            if (newReply.mentions?.length && blogDetail) {
                addNotification({
                    type: 'mention',
                    message: t('mentionReplyMessage'),
                    blogSlug: blogDetail.slug,
                    blogTitle: blogDetail.tieuDe,
                })
            }
        },
        [
            generateCommentId,
            incrementMissionProgress,
            addNotification,
            blogDetail,
            t,
        ]
    )

    if (!blogDetail) {
        return (
            <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        {t('notFoundTitle')}
                    </h1>
                    <p className="mb-6">{t('notFoundDescription')}</p>
                    <Button asChild>
                        <Link href="/">{t('returnHome')}</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const firstCharName =
        blogDetail.tacGia.fullName !== ''
            ? getInitials(
                  blogDetail.tacGia.fullName,
                  blogDetail.tacGia?.email ?? ''
              )
            : getInitials('', blogDetail.tacGia?.email ?? '')

    const handleShare = (platform: string) => {
        const url = window.location.href
        switch (platform) {
            default:
                navigator.clipboard.writeText(url)
                toast({
                    title: t('linkCopiedTitle'),
                    description: t('linkCopiedDescription'),
                })
                return
        }
    }

    const handleSave = () => {
        if (!user) {
            showModal()
            return
        }
        mutate({
            baiViet: blogDetail.id,
            loaiDanhDau: 'saved',
        })
    }

    const handleFavorite = () => {
        if (!user) {
            showModal()
            return
        }
        mutate({
            baiViet: blogDetail.id,
            loaiDanhDau: 'liked',
        })
    }

    const handleReport = () => {
        if (!user) {
            showModal()
            return
        }
        setReportDialogOpen(true)
    }

    const sortedComponents = [...blogDetail.thanhPhans].sort((a, b) => {
        if (a.hang === b.hang) return a.cot - b.cot
        return a.hang - b.hang
    })

    return (
        <>
            <div className="min-h-screen bg-white text-gray-900">
                <Header />
                <Toaster />
                <main className="container mx-auto px-4 py-12 mt-[90px]">
                    <div className="max-w-5xl mx-auto">
                        {/* Example button to trigger refetch */}

                        <Link
                            href="/blogs"
                            className="inline-flex items-center text-base text-gray-500 hover:text-purple-600 mb-8"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('back_to_blogs')}
                        </Link>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {blogDetail.chuDes.map((topic: any) => (
                                <Badge
                                    key={topic.id}
                                    variant="outline"
                                    className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-base"
                                >
                                    {topic.tenChuDe.en}
                                </Badge>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-gray-900">
                            {blogDetail.tieuDe}
                        </h1>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {formatReadingTime(
                                        blogDetail.thoiGianDoc,
                                        locale as 'en' | 'vi'
                                    )}
                                </span>
                            </div>
                            <div>
                                {new Date(
                                    blogDetail.ngayXuatBan
                                ).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Summary section */}
                        {blogDetail.noiDungTomTat && (
                            <div className="mb-8 p-6 bg-purple-50 border-l-4 border-purple-500 rounded-r-md">
                                <h2 className="text-lg font-bold mb-2 text-gray-900">
                                    {t('summary')}
                                </h2>
                                <p className="text-gray-700">
                                    {blogDetail.noiDungTomTat}
                                </p>
                            </div>
                        )}

                        {/* Author info */}
                        <Link
                            href={`/info/${blogDetail.tacGia.slug}`}
                            className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg"
                        >
                            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                <AvatarImage
                                    src={
                                        blogDetail.tacGia.avatar ||
                                        '/images/default_avatar.jpg'
                                    }
                                    alt={blogDetail.tacGia.fullName}
                                />
                                <AvatarFallback>{firstCharName}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium text-lg">
                                    {blogDetail.tacGia.fullName}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {blogDetail.tacGia.ngheNghiep &&
                                    blogDetail.tacGia.congTy
                                        ? `${blogDetail.tacGia.ngheNghiep} - ${blogDetail.tacGia.congTy}`
                                        : t('author')}
                                </p>
                            </div>
                        </Link>

                        <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-gray-200 mb-8">
                            <AntdImage
                                src={
                                    blogDetail.anhBia ||
                                    '/images/default_image.jpg'
                                }
                                alt="Article hero image"
                                className="object-cover"
                                width="100%"
                                height="100%"
                            />
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-2">
                                <FacebookShareButton
                                    url={shareUrl}
                                    hashtag={'Suyndy'}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 border-gray-200 hover:bg-gray-50 text-gray-700"
                                    >
                                        <LuFacebook className="h-4 w-4 mr-1 text-blue-600" />
                                        {t('share')}
                                    </Button>
                                </FacebookShareButton>
                                <LinkedinShareButton
                                    url={shareUrl}
                                    title={blogDetail.tieuDe}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 border-gray-200 hover:bg-gray-50 text-gray-700"
                                    >
                                        <SlSocialLinkedin className="h-4 w-4 mr-1 text-blue-700" />
                                        {t('share')}
                                    </Button>
                                </LinkedinShareButton>
                            </div>
                            <div className="flex gap-2">
                                {!blogDetail.blogCuaBan && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant={
                                                blogDetail.daYeuThich
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            className={`h-8 px-3 ${blogDetail.daYeuThich ? 'bg-red-500 text-white hover:bg-red-400 border-red-500' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                                            onClick={handleFavorite}
                                        >
                                            <Heart
                                                className={`h-4 w-4 mr-1 ${blogDetail.daYeuThich ? 'fill-white' : ''}`}
                                            />
                                            {/* {blogDetail.daYeuThich
                                                ? t('favorited')
                                                : t('favorite')} */}
                                        </Button>
                                        <Popover>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="px-3 border text-sm text-gray-600 hover:text-black h-full"
                                                            >
                                                                {
                                                                    blogDetail.luotYeuThich
                                                                }
                                                            </Button>
                                                        </PopoverTrigger>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            {t('seeWhoLikes')}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <PopoverContent className="w-64 p-0 mt-4 mr-4 shadow-xl">
                                                <div className="p-3 border-b ">
                                                    <p className="font-bold">
                                                        {t('totalLikes')}
                                                    </p>
                                                </div>
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    {blogDetail
                                                        .nguoiDungYeuThich
                                                        .length > 0 ? (
                                                        blogDetail.nguoiDungYeuThich.map(
                                                            (liker, index) => (
                                                                <Link
                                                                    href={`/info/${liker.slug}`}
                                                                    key={index}
                                                                    className="flex items-center gap-3 p-3 hover:bg-gray-200 transition-colors"
                                                                >
                                                                    <div className="relative rounded-full overflow-hidden">
                                                                        <Avatar className="border-2 border-white shadow-sm">
                                                                            <AvatarImage
                                                                                src={
                                                                                    liker.avatar ||
                                                                                    '/images/default_avatar.jpg'
                                                                                }
                                                                                alt={
                                                                                    blogDetail
                                                                                        .tacGia
                                                                                        .fullName
                                                                                }
                                                                            />
                                                                            <AvatarFallback>
                                                                                {liker.hoTen !==
                                                                                ''
                                                                                    ? getInitials(
                                                                                          liker.hoTen,
                                                                                          ''
                                                                                      )
                                                                                    : getInitials(
                                                                                          '',
                                                                                          ''
                                                                                      )}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {
                                                                                liker.hoTen
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </Link>
                                                            )
                                                        )
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-500">
                                                            <p className="text-sm">
                                                                {t('noLikes')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant={
                                                blogDetail.daLuu
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            className={`h-8 px-3 ${blogDetail.daLuu ? 'bg-purple-600 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                                            onClick={handleSave}
                                        >
                                            <Bookmark
                                                className={`h-4 w-4 mr-1 ${blogDetail.daLuu ? 'fill-white' : ''}`}
                                            />
                                            {blogDetail.daLuu
                                                ? t('saved')
                                                : t('save')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 border-gray-300 hover:bg-red-50 text-gray-700 hover:text-red-500 hover:border-red-200"
                                            onClick={handleReport}
                                        >
                                            <AlertTriangle className="h-4 w-4 mr-1" />
                                            {t('report')}
                                        </Button>
                                    </div>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 border-gray-300 hover:bg-gray-50 text-gray-700"
                                        >
                                            <Share2 className="h-4 w-4 mr-1" />
                                            {t('more')}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleShare('clipboard')
                                            }
                                        >
                                            {t('copy_link')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Article content using PreviewSection */}
                        <article className="prose prose-purple max-w-none">
                            {sortedComponents.map((component) => {
                                const sectionData =
                                    convertToSectionType(component)
                                if (sectionData) {
                                    return (
                                        <PreviewSection
                                            key={component.id}
                                            section={sectionData as SectionType}
                                        />
                                    )
                                }
                                return null
                            })}
                        </article>

                        {/* Comments section */}
                        <CommentsSection
                            comments={comments}
                            onAddComment={handleAddComment}
                            onAddReply={handleAddReply}
                        />

                        {blogsByTopic && blogsByTopic.length > 0 && (
                            <div className="border-t border-gray-200 mt-12 pt-8">
                                <h3 className="text-2xl font-bold mb-6">
                                    {t('related_articles')}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {blogsByTopic.map(
                                        (relatedPost: any, index: number) => (
                                            <Link
                                                href={`/blog/${relatedPost.slug}/`}
                                                className="group"
                                                key={index}
                                            >
                                                <div className="space-y-3">
                                                    <div className="relative h-48 rounded-lg overflow-hidden border border-gray-200 group-hover:border-purple-300 transition-colors">
                                                        <Image
                                                            src={
                                                                relatedPost.anhBia ||
                                                                '/images/default_image.jpg'
                                                            }
                                                            alt={`${relatedPost.title} thumbnail`}
                                                            className="object-cover"
                                                            fill
                                                        />{' '}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 pt-2 text-xs text-purple-600 mb-2">
                                                            {relatedPost.chuDes.map(
                                                                (
                                                                    topic: any
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            topic.id
                                                                        }
                                                                        variant="outline"
                                                                        className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-sm"
                                                                    >
                                                                        {
                                                                            topic
                                                                                .tenChuDe
                                                                                .en
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                        <h5 className="font-medium group-hover:text-purple-600 pt-2 transition-colors">
                                                            {relatedPost.tieuDe}
                                                        </h5>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                {/* Report dialog */}
                <ReportDialog
                    isOpen={reportDialogOpen}
                    onClose={() => setReportDialogOpen(false)}
                    blogId={blogDetail.id}
                />
                <LoginModal
                    visible={isLoginModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                />
            </div>
            <Footer topics={topics} />
        </>
    )
}
