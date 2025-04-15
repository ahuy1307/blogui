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
        router.push(`/write?edit=${blogId}`)
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
        const res = await authenticationService.publishOrDraftBlog({
            id: blogId,
        })
        queryClient.invalidateQueries({ queryKey: ['userBlogs'] })
        toast({
            title: !publish ? t('publishBlog') : t('draftBlogMessage'),
            description: res.data.message,
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 mt-[80px]">
            <Toaster />
            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
                {t('title')}
            </h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Posts"
                    value={userBlogs.data.count}
                    icon="📝"
                    color="bg-gradient-to-br from-purple-300 to-blue-500"
                />
                <StatCard
                    title="Total Likes"
                    value={userBlogs.data.tongLuotYeuThich}
                    icon="❤️"
                    color="bg-gradient-to-br from-purple-300 to-red-500"
                />
                <StatCard
                    title="Total Views"
                    value={userBlogs.data.tongLuotXem}
                    icon="👁️"
                    color="bg-gradient-to-br from-purple-300 to-yellow-500"
                />
            </div>
            <div className="mb-4 flex gap-4">
                {/* Search Input */}
                <div className="relative w-[40%]">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
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
                    <SelectTrigger className="w-[200px] text-gray-500">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="text-gray-500">
                        <SelectItem value="all">{t('allBlogs')}</SelectItem>
                        <SelectItem value="draft">{t('draft')}</SelectItem>
                        <SelectItem value="published">
                            {t('published')}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <div className="w-full flex gap-4 flex-1">
                    <RangePicker
                        placeholder={[t('startDate'), t('endDate')]}
                        value={[
                            startDate ? dayjs(startDate) : null,
                            endDate ? dayjs(endDate) : null,
                        ]}
                        onChange={(dates) => {
                            console.log(dates)
                            setStartDate(dates?.[0]?.toDate() || undefined)
                            setEndDate(dates?.[1]?.toDate() || undefined)
                        }}
                    />
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center"
                >
                    <Filter className="mr-2 h-4 w-4" />
                    <span>{t('clearFilters')}</span>
                </Button>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-200">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold line-clamp-1">
                                {blog.tieuDe}
                            </h3>
                            <StatusBadge isDraft={!blog.daXuatBan} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
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
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center mr-4">
                                <span className="mr-1">❤️</span>{' '}
                                {blog.luotYeuThich || 0} {t('likes')}
                            </span>
                            <span className="flex items-center mr-4">
                                <span className="mr-1">💬</span>{' '}
                                {blog.comments?.length || 0} {t('comments')}
                            </span>
                            <span className="flex items-center">
                                <span className="mr-1">👁️</span>{' '}
                                {blog.luotXem || 0} {t('views')}
                            </span>
                            {blog.ngayXuatBan && (
                                <span className="flex items-center ml-4">
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

                    <div className="flex items-center space-x-2">
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
                            <DropdownMenuContent align="start" sideOffset={5}>
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
    icon,
    color,
}: {
    title: string
    value: number
    icon: string
    color: string
}) {
    return (
        <Card className={`overflow-hidden ${color} text-white rounded-xl`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-base font-bold text-white">
                            {title}
                        </p>
                        <p className="text-4xl font-bold mt-1">{value}</p>
                    </div>
                    <div className="text-4xl opacity-80">{icon}</div>
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
