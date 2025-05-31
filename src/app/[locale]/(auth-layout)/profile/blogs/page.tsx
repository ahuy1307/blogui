'use client'

import { useState, useEffect } from 'react'
import {
    useQuery,
    keepPreviousData,
    useQueryClient,
} from '@tanstack/react-query'
import { Filter, Search } from 'lucide-react'
import { Input } from '@/components/other-ui/Input'
import { Button } from '@/components/other-ui/Button'
import { Card, CardContent } from '@/components/other-ui/Card'
import { Badge } from '@/components/other-ui/Badge'
import { useToast } from '@/components/other-ui/useToast'
import { useRouter } from 'next/navigation'
import { useLibraryStore } from '@/store/library-store'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useLocale, useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { DatePicker, Spin } from 'antd'
import dayjs from 'dayjs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/other-ui/Select'
import Pagination from '@/components/ui/Pagination/Pagination'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/other-ui/DropdownMenu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Blog } from '@/types/interface'
import { Toaster } from '@/components/other-ui/Toaster'

type BlogStatus = 'all' | 'draft' | 'published'
const { RangePicker } = DatePicker

export default function BlogPage() {
    const t = useTranslations('profile.BlogPage')
    const locale = useLocale()
    const { toast } = useToast()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [statusFilter, setStatusFilter] = useState<BlogStatus>('all')
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [published, setPublished] = useState<boolean | undefined>(undefined)

    // Debounce search term to avoid frequent refetching
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300) // 300ms debounce delay

        return () => {
            clearTimeout(handler)
        }
    }, [searchTerm])

    const clearFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
        setPublished(undefined)
        setStartDate(undefined)
        setEndDate(undefined)
    }

    // Fetch blogs using useQuery with parameters
    const { data: userBlogs = [], isLoading } = useQuery({
        queryKey: [
            'userBlogs',
            { page, limit, debouncedSearchTerm, startDate, endDate, published },
        ],
        queryFn: () =>
            authenticationService.getAllBlogs({
                page,
                limit,
                search: debouncedSearchTerm,
                start_date: startDate
                    ? dayjs(startDate).format('YYYY-MM-DD')
                    : undefined,
                end_date: endDate
                    ? dayjs(endDate).format('YYYY-MM-DD')
                    : undefined,
                published,
            }),
        placeholderData: keepPreviousData, // Keep previous data while fetching new data
    })

    const handleEdit = (blogId: string) => {
        router.push(`/${locale}/edit/${blogId}`)
    }

    const handleDelete = async (blogId: string) => {
        await authenticationService.deleteBlog({ id: blogId })
        toast({
            title: t('deleteBlog'),
            description: t('deleteBlogSuccess'),
        })
        // Refetch blogs after deletion
        queryClient.invalidateQueries({ queryKey: ['userBlogs'] })
    }

    const handleView = (slug: string) => {
        router.push(`/${locale}/blog/${slug}`)
    }

    const handlePusblish = async (blogId: string, publish: boolean) => {
        try {
            const res = await authenticationService.publishOrDraftBlog({
                id: blogId,
            })
            // onSuccess callback
            queryClient.invalidateQueries({ queryKey: ['userBlogs'] })
            toast({
                title: !publish ? t('publishBlog') : t('draftBlogMessage'),
                description: res.data.message,
                variant: 'default',
            })
        } catch (error: any) {
            // onError callback
            console.error('Error publishing/drafting blog:', error)
            toast({
                title: t('errorPublishDraft'),
                description: error?.response.data.errors.other[0],
                variant: 'destructive',
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div className="md:container mx-auto py-8 md:px-6 mt-[80px]">
            <Toaster />
            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
                {t('title')}
            </h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title={t('totalPosts')}
                    value={userBlogs.data.count}
                    color="from-blue-400 to-blue-600"
                />
                <StatCard
                    title={t('totalLikes')}
                    value={userBlogs.data.tongLuotYeuThich}
                    color="from-rose-400 to-rose-600"
                />
                <StatCard
                    title={t('totalViews')}
                    value={userBlogs.data.tongLuotXem}
                    color="from-emerald-400 to-emerald-600"
                />
            </div>

            {/* Filter Section - Updated for mobile/tablet responsiveness */}
            <div className="mb-6 flex flex-col gap-4 md:gap-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            size={18}
                        />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            className="pl-10 pr-4 py-2 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value as BlogStatus)
                            if (value === 'all') setPublished(undefined)
                            else setPublished(value === 'published')
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allBlogs')}</SelectItem>
                            <SelectItem value="draft">{t('draft')}</SelectItem>
                            <SelectItem value="published">
                                {t('published')}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Date Range Picker */}
                    <div className="w-full">
                        <RangePicker
                            placeholder={[t('startDate'), t('endDate')]}
                            value={[
                                startDate ? dayjs(startDate) : null,
                                endDate ? dayjs(endDate) : null,
                            ]}
                            onChange={(dates) => {
                                setStartDate(dates?.[0]?.toDate() || undefined)
                                setEndDate(dates?.[1]?.toDate() || undefined)
                            }}
                            style={{
                                width: '100%',
                            }}
                            placement="bottomRight"
                        />
                    </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end mt-2">
                    <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex items-center"
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        <span>{t('clearFilters')}</span>
                    </Button>
                </div>
            </div>

            {/* Blog List */}
            <div className="space-y-6 mt-6">
                {userBlogs && userBlogs.data.results.length > 0 ? (
                    userBlogs.data.results.map((blog: any) => (
                        <BlogItem
                            key={blog.id}
                            blog={blog}
                            onEdit={() => handleEdit(blog.id)}
                            onDelete={() => handleDelete(blog.id)}
                            onView={() => handleView(blog.slug)}
                            onPublishOrDraft={() =>
                                handlePusblish(blog.id, blog.daXuatBan)
                            }
                        />
                    ))
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-2xl font-semibold mb-2">
                            {t('noBlogsFound')}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm
                                ? 'Try a different search term'
                                : "You haven't created any blogs yet"}
                        </p>
                        <Button onClick={() => router.push(`/${locale}/write`)}>
                            {t('createFirstBlog')}
                        </Button>
                    </div>
                )}
                <div className="flex justify-center">
                    <Pagination
                        defaultPageSize={limit}
                        total={userBlogs.data.count}
                        pageSize={limit}
                        current={page}
                        onChange={(page) => {
                            setPage(page)
                        }}
                        hideOnSinglePage
                        className="mt-6"
                    />
                </div>
            </div>
        </div>
    )
}

function BlogItem({
    blog,
    onEdit,
    onDelete,
    onView,
    onPublishOrDraft,
}: {
    blog: any
    onEdit: () => void
    onDelete: () => void
    onView: () => void
    onPublishOrDraft: () => void
}) {
    const locale = useLocale()
    const t = useTranslations('profile.BlogPage')

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-200">
            <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="w-full">
                        <div className="flex items-start md:items-center flex-wrap gap-2 mb-2">
                            <h3 className="text-xl font-semibold line-clamp-1 mr-2">
                                {blog.tieuDe}
                            </h3>
                            <StatusBadge isDraft={!blog.daXuatBan} />
                        </div>
                        <p className="text-gray-500 mb-3 line-clamp-2">
                            {blog.noiDungTomTat}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {blog.chuDes.map((topic: any, index: number) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-purple-100 text-purple-500"
                                >
                                    {topic.tenChuDe[locale]}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center text-sm text-gray-500  gap-y-2">
                            <span className="flex items-center mr-4">
                                <span className="mr-1">❤️</span>{' '}
                                {blog.luotYeuThich || 0} {t('likes')}
                            </span>
                            <span className="flex items-center mr-4">
                                <span className="mr-1">💬</span>{' '}
                                {blog.comments?.length || 0} {t('comments')}
                            </span>
                            <span className="flex items-center mr-4">
                                <span className="mr-1">👁️</span>{' '}
                                {blog.luotXem || 0} {t('views')}
                            </span>
                            {blog.ngayXuatBan && (
                                <span className="flex items-center">
                                    <span className="mr-1">📅</span>{' '}
                                    {format(
                                        new Date(
                                            blog.ngayXuatBan || new Date()
                                        ),
                                        locale === 'vi'
                                            ? 'dd/MM/yyyy'
                                            : 'MMM d, yyyy'
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-2 md:mt-0 self-end md:self-start">
                        {!blog.daXuatBan ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-500 border-emerald-500 hover:bg-emerald-500 hover:text-white"
                                onClick={onPublishOrDraft}
                            >
                                {t('publish')}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-500 border-amber-500 hover:bg-amber-500 hover:text-white"
                                onClick={onPublishOrDraft}
                            >
                                {t('draftBlog')}
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    •••
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={5}>
                                {blog.daXuatBan && (
                                    <DropdownMenuItem
                                        onClick={onView}
                                        className="text-gray-800 focus:text-gray-800 font-semibold"
                                    >
                                        {t('view')}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={onEdit}
                                    className="text-blue-600 focus:text-blue-600 font-semibold"
                                >
                                    {t('edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-red-600 focus:text-red-600 font-semibold"
                                >
                                    {t('delete')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    color,
}: {
    title: string
    value: number
    color: string
}) {
    return (
        <Card className="overflow-hidden border-none rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
                <div className="flex flex-col h-full">
                    <div
                        className={`bg-gradient-to-r ${color} p-4 relative h-2`}
                    ></div>

                    <div className="p-5 bg-white ">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                            {title}
                        </h3>
                        <div className="flex items-baseline">
                            <p className="text-2xl font-extrabold tracking-tight">
                                {value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function StatusBadge({ isDraft }: { isDraft: boolean }) {
    const t = useTranslations('profile.BlogPage')

    if (isDraft) {
        return (
            <Badge
                variant="outline"
                className="border-amber-500 text-amber-500"
            >
                {t('draft')}
            </Badge>
        )
    }

    return (
        <Badge variant="outline" className="border-green-500 text-green-500">
            {t('published')}
        </Badge>
    )
}
