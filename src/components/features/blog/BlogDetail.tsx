'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from '@/navigation'
import {
    ArrowLeft,
    Clock,
    Share2,
    Bookmark,
    Heart,
    AlertTriangle,
    Calendar,
    List,
    Eye,
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
import { Badge } from '@/components/other-ui/Badge'
import Header from '@/components/features/home/Header'
import { PreviewSection } from '@/components/editor/PreviewSection'
import { ReportDialog } from '@/components/features/blog/ReportDialog'
import { FacebookShareButton, LinkedinShareButton } from 'react-share'
import {
    CommentsSection,
    CommentData,
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
import ScrollToTop from '../home/ScrollToTop'
import { useMissions } from '@/hooks/useMissions'
import { ChatAssistant } from './ChatAssistant'
import { TASK_TYPE } from '@/types/constants'
import { useIsMobile } from '@/hooks/useMobile'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
        case 'heading': {
            // Create slug-style anchor ID for headings
            const headingText = noiDung || ''
            const anchorId = headingText
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')

            return {
                type: 'heading',
                content: noiDung,
                level: dinhDang?.level || 2,
                id,
                anchorId, // Add anchor ID for navigation
                row: hang,
                column: cot,
                marginTop: dinhDang?.marginTop,
                marginBottom: dinhDang?.marginBottom,
            }
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
                content: (() => {
                    try {
                        const parsedOuter = JSON.parse(noiDung)
                        return parsedOuter?.content || ''
                    } catch (e) {
                        console.error('Error parsing quote content:', e)
                        return ''
                    }
                })(),
                citation: (() => {
                    try {
                        const parsedOuter = JSON.parse(noiDung)
                        return parsedOuter?.citation || ''
                    } catch (e) {
                        console.error('Error parsing quote citation:', e)
                        return ''
                    }
                })(),
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

// New Table of Contents component
const TableOfContentsBlog = ({
    sections,
    shouldShow,
}: {
    sections: SectionType[]
    shouldShow: boolean
}) => {
    const t = useTranslations('blog.BlogDetail')
    const [activeSection, setActiveSection] = useState<string | null>(null)
    const [isExpanded, setIsExpanded] = useState(true)
    const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Filter out only heading sections
    const headings = sections.filter(
        (section) => section.type === 'heading' && section.anchorId
    )

    // Scroll to section when clicked
    const scrollToHeading = (anchorId: string) => {
        const element = document.getElementById(anchorId)
        if (element) {
            // Scroll to element with some offset for header
            const yOffset = -100
            const y =
                element.getBoundingClientRect().top +
                window.pageYOffset +
                yOffset
            window.scrollTo({ top: y, behavior: 'smooth' })
            setActiveSection(anchorId)
        }
    }

    // Update active section on scroll with debouncing
    useEffect(() => {
        const debounceTime = 50 // milliseconds

        const handleScroll = () => {
            // Clear previous timeout
            if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current)
            }

            // Set new timeout
            scrollTimerRef.current = setTimeout(() => {
                // Find all heading elements
                const headingElements = headings
                    .map((heading) => ({
                        id: heading.anchorId,
                        element: document.getElementById(
                            heading.anchorId || ''
                        ),
                    }))
                    .filter((item) => item.element !== null)

                if (headingElements.length === 0) return

                // Calculate which heading is most visible in the viewport
                let mostVisibleHeading = {
                    id: headingElements[0].id,
                    visiblePercent: 0,
                }
                let currentFound = false

                for (const { id, element } of headingElements) {
                    if (!element) continue

                    const rect = element.getBoundingClientRect()

                    // If element is fully above the viewport - consider it passed
                    if (rect.bottom <= 100) {
                        mostVisibleHeading = { id, visiblePercent: 0 }
                        continue
                    }

                    // If heading is in view (with offset)
                    if (rect.top <= 120) {
                        currentFound = true
                        // Calculate visibility percentage
                        const visibleHeight =
                            Math.min(rect.bottom, window.innerHeight) -
                            Math.max(rect.top, 0)
                        const visiblePercent = visibleHeight / rect.height

                        if (
                            visiblePercent > mostVisibleHeading.visiblePercent
                        ) {
                            mostVisibleHeading = { id, visiblePercent }
                        }
                    }

                    // If we've already found a visible heading and this one isn't visible yet, break
                    if (rect.top > 120 && currentFound) {
                        break
                    }
                }

                if (mostVisibleHeading.id !== activeSection) {
                    setActiveSection(mostVisibleHeading.id ?? null)
                }
            }, debounceTime)
        }

        // Initial call to set the active section when component mounts
        handleScroll()

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current)
            }
        }
    }, [headings, activeSection])

    if (headings.length === 0 || !shouldShow) return null

    const toggleExpand = () => {
        setIsExpanded(!isExpanded)
    }
    return (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden w-[350px]">
            <div
                className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 flex justify-between items-center cursor-pointer border-b border-purple-100"
                onClick={toggleExpand}
            >
                <h6 className="font-medium text-purple-800 flex items-center">
                    <List className="h-4 w-4 mr-2 text-purple-600" />
                    {t('tableOfContents')}
                </h6>
                <button
                    className="text-purple-600 hover:text-purple-800 duration-500 transition-all"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                    {isExpanded ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m18 15-6-6-6 6" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    )}
                </button>
            </div>

            {isExpanded && (
                <nav className="px-4 py-3 max-h-[calc(100vh-200px)] overflow-y-auto bg-white">
                    <ul className="space-y-1">
                        {headings.map((heading, index) => {
                            const isActive = activeSection === heading.anchorId
                            const headingLevel = heading.level || 2

                            // Apply styling based on heading level
                            let fontSizeClass = ''
                            let paddingClass = ''
                            let prefix = ''

                            if (headingLevel === 1) {
                                // Only level 1 headings get an index
                                fontSizeClass = 'text-sm font-semibold'
                                paddingClass = 'pl-2'
                                const h1Index = headings.filter(
                                    (h) =>
                                        h.level === 1 &&
                                        headings.indexOf(h) <=
                                            headings.indexOf(heading)
                                ).length
                                prefix = `${h1Index}. `
                            } else if (headingLevel === 2) {
                                fontSizeClass = 'text-sm'
                                paddingClass = 'pl-6' // More indentation for level 2
                                // No index for level 2
                            } else if (headingLevel === 3) {
                                fontSizeClass = 'text-xs'
                                paddingClass = 'pl-10' // Even more indentation for level 3
                                // No index for level 3
                            }

                            return (
                                <li
                                    key={headings.indexOf(heading)}
                                    className={`
                                        ${headingLevel === 1 ? 'mt-3' : headingLevel === 2 ? 'mt-1' : ''}
                                    `}
                                >
                                    <button
                                        onClick={() =>
                                            scrollToHeading(heading.anchorId!)
                                        }
                                        className={`
                                            relative text-left py-2 px-2 rounded w-full transition-all duration-300
                                            ${paddingClass}
                                            ${fontSizeClass}
                                            ${
                                                isActive
                                                    ? 'bg-purple-50 text-purple-700 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                                            }
                                        `}
                                    >
                                        {isActive && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-purple-500 rounded-r-lg transition-all duration-300"></span>
                                        )}
                                        <span className="line-clamp-1">
                                            {/* {prefix} */}
                                            {heading.content}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            )}
        </div>
    )
}

// Mock related posts - would be fetched from API in production
export function BlogDetail({
    blogDetail,
    blogsByTopic,
    comments,
    refetch,
    refetchComment,
}: {
    blogDetail: Blog
    blogsByTopic: Blog[]
    comments: CommentData[]
    refetch: () => void
    refetchComment: () => void
}) {
    const t = useTranslations('blog.BlogDetail')
    const { topics, isLoading, error } = useAppData()
    const { user } = useAuth()

    const { toast } = useToast()
    const locale = useLocale()
    const [reportDialogOpen, setReportDialogOpen] = useState(false)
    const { fetchUserTasks } = useMissions()
    const readingTimerRef = useRef<NodeJS.Timeout | null>(null)
    const hasTrackedReading = useRef(false)

    const [commentIdCounter, setCommentIdCounter] = useState(1)
    const shareUrl = `${getBaseUrl()}/${locale}/blog/${blogDetail?.slug}`

    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
    const isMobile = useIsMobile()

    useUnlockBodyScroll()

    useEffect(() => {
        refetch()
    }, [user])

    // Track reading time for authenticated users
    useEffect(() => {
        // Only track for authenticated users and if not already tracked
        if (user && blogDetail && !hasTrackedReading.current) {
            // Check if this blog has already been tracked in localStorage
            const trackedBlogs = localStorage.getItem('trackedReadBlogs')
                ? JSON.parse(localStorage.getItem('trackedReadBlogs') || '{}')
                : {}

            // If this blog hasn't been tracked by this user yet
            if (
                !trackedBlogs[blogDetail.id] ||
                trackedBlogs[blogDetail.id].userId !== user.id
            ) {
                // Set a timer for 2 minutes (120000ms)
                readingTimerRef.current = setTimeout(() => {
                    trackBlogReading()
                }, 120000)
            } else {
                // Blog already tracked, no need to track again
                hasTrackedReading.current = true
            }
        }

        return () => {
            if (readingTimerRef.current) {
                clearTimeout(readingTimerRef.current)
            }
        }
    }, [user, blogDetail])

    const trackBlogReading = async () => {
        try {
            if (!hasTrackedReading.current && user && blogDetail) {
                const response = await authenticationService.trackingBlog({
                    blog_id: blogDetail.id,
                    task_type: TASK_TYPE.READ_BLOG,
                })

                // If tracking was successful, organize blogs by date in localStorage
                if (response) {
                    // Get the existing tracked blogs object
                    const trackedBlogs = localStorage.getItem(
                        'trackedReadBlogs'
                    )
                        ? JSON.parse(
                              localStorage.getItem('trackedReadBlogs') || '{}'
                          )
                        : {}

                    // Get today's date in YYYY-MM-DD format
                    const today = new Date().toISOString().split('T')[0]

                    // Initialize the date entry if it doesn't exist
                    if (!trackedBlogs[today]) {
                        trackedBlogs[today] = []
                    }

                    // Check if this blog is already tracked today
                    const alreadyTrackedToday = trackedBlogs[today].some(
                        (blog: any) =>
                            blog.blogId === blogDetail.id &&
                            blog.userId === user.id
                    )

                    // Only add if not already tracked today
                    if (!alreadyTrackedToday) {
                        trackedBlogs[today].push({
                            blogId: blogDetail.id,
                            userId: user.id,
                            title: blogDetail.tieuDe,
                            timestamp: new Date().toISOString(),
                        })
                    }

                    localStorage.setItem(
                        'trackedReadBlogs',
                        JSON.stringify(trackedBlogs)
                    )
                    hasTrackedReading.current = true
                    fetchUserTasks() // Refresh user tasks to update progress
                }
            }
        } catch (error) {
            console.error('Error tracking blog reading:', error)
        }
    }

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
            fetchUserTasks()
            refetch()
        },
        onError: (res: any) => {
            toast({
                title: t('errorTitle'),
                description: res.response.data.errors.other[0],
                variant: 'destructive',
            })
        },
    })

    // Add ref for tracking when footer is visible and state for table of contents
    const footerRef = useRef<HTMLDivElement>(null)
    const [showTableOfContents, setShowTableOfContents] = useState(true)

    // Setup intersection observer to detect when footer is in view
    useEffect(() => {
        if (!footerRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                // Simply toggle TableOfContents visibility based on footer visibility
                entries.forEach((entry) => {
                    setShowTableOfContents(!entry.isIntersecting)
                })
            },
            { threshold: 0.1 } // Trigger when at least 10% of the footer is visible
        )

        observer.observe(footerRef.current)

        return () => {
            if (footerRef.current) {
                observer.unobserve(footerRef.current)
            }
        }
    }, [])

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
        blogDetail && blogDetail.tacGia?.fullName !== ''
            ? getInitials(
                  blogDetail.tacGia?.fullName,
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

    // Convert components to section types for rendering
    const convertedSections = sortedComponents
        .map(convertToSectionType)
        .filter(Boolean) as SectionType[]

    const [showFullSummary, setShowFullSummary] = useState(false)
    const summaryRef = useRef<HTMLParagraphElement>(null)
    const [isSummaryLong, setIsSummaryLong] = useState(false)

    // Check if summary is long enough to need truncation
    useEffect(() => {
        if (summaryRef.current && blogDetail.noiDungTomTat) {
            // If text is longer than 150 characters, consider it long
            setIsSummaryLong(blogDetail.noiDungTomTat.length > 150)
        }
    }, [blogDetail.noiDungTomTat])

    const toggleSummary = () => {
        setShowFullSummary(!showFullSummary)
    }

    return (
        <>
            <div className="min-h-screen bg-white text-gray-900">
                <Header />
                <Toaster />
                <ScrollToTop isBlogDetail={!!(blogDetail && user)} />
                {/* Move ChatAssistant here to ensure it's correctly positioned */}
                {blogDetail && user && (
                    <ChatAssistant
                        blogTitle={blogDetail.tieuDe}
                        blogId={blogDetail.id}
                    />
                )}
                <div className="container mx-auto px-4 py-12 mt-[80px] flex flex-col lg:flex-row gap-6 justify-center">
                    <main className="w-full lg:w-3/4 max-w-4xl">
                        <div className="mx-auto">
                            {/* Example button to trigger refetch */}

                            {/* <Link
                                href="/blog"
                                className="inline-flex items-center text-base text-gray-500 hover:text-purple-600 mb-8"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('back_to_blogs')}
                            </Link> */}

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
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(
                                            blogDetail.ngayXuatBan
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    <span>
                                        {blogDetail.luotXem} {t('views')}
                                    </span>
                                </div>
                            </div>

                            {/* Summary section */}
                            {blogDetail.noiDungTomTat && (
                                <div className="mb-8 p-6 bg-purple-50 border-l-4 border-purple-500 rounded-r-md">
                                    <h2 className="text-lg font-bold mb-2 text-gray-900">
                                        {t('summary')}
                                    </h2>
                                    <div className="relative">
                                        <p
                                            ref={summaryRef}
                                            className={`text-gray-700 text-left ${!showFullSummary && isSummaryLong ? 'line-clamp-5' : ''}`}
                                        >
                                            {blogDetail.noiDungTomTat}
                                        </p>

                                        {isSummaryLong && (
                                            <button
                                                onClick={toggleSummary}
                                                className="flex items-center mt-2 text-purple-600 hover:text-purple-800 font-medium text-sm"
                                            >
                                                {showFullSummary ? (
                                                    <>
                                                        {/* <span>
                                                            {t('seeLess')}
                                                        </span>
                                                        <ChevronUp className="h-4 w-4 ml-1" /> */}
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            {t('seeMore')}
                                                        </span>
                                                        <ChevronDown className="h-4 w-4 ml-1" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
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
                                        className="object-cover"
                                    />
                                    <AvatarFallback>
                                        {firstCharName}
                                    </AvatarFallback>
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
                                    preview={!isMobile}
                                />
                            </div>

                            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
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
                                <div className="flex flex-col sm:flex-row gap-4">
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
                                                                className="px-3 h-8 border text-sm text-gray-600 hover:text-black"
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
                                                                                className="object-cover"
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
                                                                            {!liker.nguoiDungHienTai
                                                                                ? liker.hoTen
                                                                                : t(
                                                                                      'you'
                                                                                  )}
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
                                        {!blogDetail.blogCuaBan && (
                                            <>
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
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {!blogDetail.blogCuaBan && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 border-gray-300 hover:bg-red-50 text-gray-700 hover:text-red-500 hover:border-red-200"
                                                onClick={handleReport}
                                            >
                                                <AlertTriangle className="h-4 w-4 mr-1" />
                                                {t('report')}
                                            </Button>
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
                            </div>

                            {/* Article content using PreviewSection */}
                            <article className="prose prose-purple max-w-none">
                                {sortedComponents.map((component) => {
                                    const sectionData =
                                        convertToSectionType(component)
                                    if (sectionData) {
                                        // For heading sections, add an ID for the anchor
                                        if (
                                            sectionData.type === 'heading' &&
                                            sectionData.anchorId
                                        ) {
                                            return (
                                                <div
                                                    key={component.id}
                                                    id={sectionData.anchorId}
                                                >
                                                    <PreviewSection
                                                        section={
                                                            sectionData as SectionType
                                                        }
                                                    />
                                                </div>
                                            )
                                        }
                                        return (
                                            <PreviewSection
                                                key={component.id}
                                                section={
                                                    sectionData as SectionType
                                                }
                                            />
                                        )
                                    }
                                    return null
                                })}
                            </article>

                            {/* Comments section */}
                            <CommentsSection
                                comments={comments}
                                postId={blogDetail.id}
                                refetchComment={refetchComment}
                            />

                            {blogsByTopic && blogsByTopic.length > 0 && (
                                <div className="border-t border-gray-200 mt-12 pt-8">
                                    <h3 className="text-2xl font-bold mb-6">
                                        {t('related_blogs')}
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {blogsByTopic
                                            .slice(0, 3)
                                            .map(
                                                (
                                                    relatedPost: any,
                                                    index: number
                                                ) => (
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
                                                                <div className="flex items-center gap-4 pt-2 text-xs text-purple-600 mb-2">
                                                                    {relatedPost.chuDes &&
                                                                        relatedPost.chuDes
                                                                            .slice(
                                                                                0,
                                                                                3
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    chuDe: any
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            chuDe.id
                                                                                        }
                                                                                        className="bg-purple-50 text-purple-600 hover:bg-purple-100 text-sm"
                                                                                    >
                                                                                        {
                                                                                            chuDe
                                                                                                .tenChuDe[
                                                                                                locale
                                                                                            ]
                                                                                        }
                                                                                    </span>
                                                                                )
                                                                            )}
                                                                    {relatedPost.chuDes &&
                                                                        relatedPost
                                                                            .chuDes
                                                                            .length >
                                                                            3 && (
                                                                            <span className="text-xs text-purple-500 w-fit bg-purple-100 px-2 py-1 rounded-full">
                                                                                +
                                                                                {relatedPost
                                                                                    .chuDes
                                                                                    .length -
                                                                                    4}{' '}
                                                                                {locale ===
                                                                                'en'
                                                                                    ? 'more'
                                                                                    : 'khác'}
                                                                            </span>
                                                                        )}
                                                                </div>
                                                                <h6 className="font-medium group-hover:text-purple-600 pt-2 transition-colors">
                                                                    {
                                                                        relatedPost.tieuDe
                                                                    }
                                                                </h6>
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
                    {/* Table of Contents */}
                    {convertedSections.some(
                        (section) => section.type === 'heading'
                    ) && (
                        <aside className="hidden lg:block w-full lg:w-2/4 max-w-xs">
                            <div
                                className={`fixed top-[100px] max-h-[calc(100vh-120px)] transition-opacity duration-300 ${showTableOfContents ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            >
                                <TableOfContentsBlog
                                    sections={convertedSections}
                                    shouldShow={showTableOfContents}
                                />
                            </div>
                        </aside>
                    )}
                </div>
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
            <div ref={footerRef}>
                <Footer topics={topics} />
            </div>
        </>
    )
}
