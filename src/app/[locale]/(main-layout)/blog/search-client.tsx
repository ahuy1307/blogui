'use client'

import type React from 'react'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { format } from 'date-fns'
import { DatePicker, Spin, Select } from 'antd'
import { Search, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/other-ui/Button'
import { Input } from '@/components/other-ui/Input'
import { Badge } from '@/components/other-ui/Badge'
import { Card, CardContent, CardFooter } from '@/components/other-ui/Card'
import { Skeleton } from '@/components/other-ui/Skeleton'
import { Checkbox } from '@/components/other-ui/Checkbox'
import { Label } from '@/components/other-ui/Label'
import { Blog, Topic, BlogSearchParams } from '@/types/interface'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useLocale, useTranslations } from 'next-intl'
import dayjs from 'dayjs'
import { Link } from '@/navigation'
import { BlogFeatureCard } from '@/components/features/blog/BlogFeatureCard'
import { debounce } from 'lodash'
import { cn } from '@/lib/utils'
import Header from '@/components/features/home/Header'
import { Footer } from '@/components/features/home/Footer'
import ScrollToTop from '@/components/features/home/ScrollToTop'
import { Dropdown } from 'antd'

const { RangePicker } = DatePicker

// Create a client
const queryClient = new QueryClient()

function SearchContent() {
    const t = useTranslations('blog')
    const searchParams = useSearchParams()
    const locale = useLocale()
    const router = useRouter()
    const [search, setSearch] = useState(searchParams.get('q') || '')
    const [searchInputValue, setSearchInputValue] = useState(search)
    const [startDate, setStartDate] = useState(
        searchParams.get('start_date') || ''
    )
    const [endDate, setEndDate] = useState(searchParams.get('end_date') || '')
    const [selectedTopics, setSelectedTopics] = useState(
        searchParams.get('topics')?.split(',').filter(Boolean).map(Number) || []
    )
    const [sortOrder, setSortOrder] = useState(
        searchParams.get('sort') || 'newest'
    )
    const [isFiltersVisible, setIsFiltersVisible] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [isUpdatingFilters, setIsUpdatingFilters] = useState(false)
    const observer = useRef<IntersectionObserver | null>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const queryClient = useQueryClient()

    // Create debounced search function with longer delay for better performance
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            setSearch(value)
            setIsSearching(false)
        }, 700),
        []
    )

    // Create a debounced filter update function to batch filter changes
    const debouncedFilterUpdate = useCallback(
        debounce(
            (
                updatedFilters: Partial<{
                    search: string
                    startDate: string
                    endDate: string
                    topics: number[]
                    sortOrder: string
                }>
            ) => {
                // Batch update all filters at once
                if (updatedFilters.search !== undefined)
                    setSearch(updatedFilters.search)
                if (updatedFilters.startDate !== undefined)
                    setStartDate(updatedFilters.startDate)
                if (updatedFilters.endDate !== undefined)
                    setEndDate(updatedFilters.endDate)
                if (updatedFilters.topics !== undefined)
                    setSelectedTopics(updatedFilters.topics)
                if (updatedFilters.sortOrder !== undefined)
                    setSortOrder(updatedFilters.sortOrder)

                setIsUpdatingFilters(false)
                setIsSearching(false)
            },
            700
        ),
        []
    )

    // Handle search input change with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setIsSearching(true)
        setSearchInputValue(value)
        debouncedSearch(value)
    }

    // Focus search input on mount and clear button click
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [])

    // Clear search with animation
    const clearSearch = () => {
        setSearchInputValue('')
        setSearch('')
        setIsSearching(false)
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }

    // Fetch topics
    const { data: topics, isLoading: isTopicsLoading } = useQuery({
        queryKey: ['topics'],
        queryFn: () =>
            authenticationService
                .getTopics({ have_blog: true })
                .then((response) => response.data),
    })

    // Update URL with search params (but don't trigger unnecessary renders)
    const previousUrlRef = useRef<string>('')

    // Debounce the URL updates to prevent multiple history entries and reduce renders
    useEffect(() => {
        // Clear any existing timeout
        if (urlUpdateTimeoutRef.current) {
            clearTimeout(urlUpdateTimeoutRef.current)
        }

        // Only update URL if we're not currently updating filters
        if (!isUpdatingFilters) {
            urlUpdateTimeoutRef.current = setTimeout(() => {
                const params = new URLSearchParams()
                if (search) params.set('q', search)
                if (startDate) params.set('start_date', startDate)
                if (endDate) params.set('end_date', endDate)
                if (selectedTopics.length > 0)
                    params.set('topics', selectedTopics.join(','))
                if (sortOrder) params.set('sort', sortOrder)

                const url = `/${locale}/blog${
                    params.toString() ? `?${params.toString()}` : ''
                }`

                // Only update if URL has actually changed
                if (url !== previousUrlRef.current) {
                    previousUrlRef.current = url
                    router.push(url, { scroll: false })
                }
            }, 200)
        }

        return () => {
            if (urlUpdateTimeoutRef.current) {
                clearTimeout(urlUpdateTimeoutRef.current)
            }
        }
    }, [
        search,
        startDate,
        endDate,
        selectedTopics,
        sortOrder,
        router,
        locale,
        isUpdatingFilters,
    ])

    // Cancel debounced operations on component unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel()
            debouncedFilterUpdate.cancel()
            if (urlUpdateTimeoutRef.current) {
                clearTimeout(urlUpdateTimeoutRef.current)
            }
        }
    }, [debouncedSearch, debouncedFilterUpdate])

    // Fetch blogs with Infinite Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        isFetching,
    } = useInfiniteQuery({
        queryKey: [
            'blogs',
            search,
            startDate,
            endDate,
            selectedTopics,
            sortOrder,
        ],
        queryFn: async ({ pageParam = 1 }) => {
            // Create a URLSearchParams object to properly handle multiple topic parameters
            const params = new URLSearchParams()

            // Add basic parameters
            params.append('page', pageParam.toString())
            params.append('limit', '12')
            if (search) params.append('search', search)
            if (startDate) params.append('start_date', startDate)
            if (endDate) params.append('end_date', endDate)
            if (sortOrder)
                params.append(
                    'ordering',
                    sortOrder === 'newest' ? '-ngayXuatBan' : 'ngayXuatBan'
                )

            // Add topics as individual 'topic' parameters
            if (selectedTopics.length > 0) {
                selectedTopics.forEach((topicId) => {
                    params.append('topic', topicId.toString())
                })
            }

            // Add a small delay to make smooth transitions
            await new Promise((resolve) => setTimeout(resolve, 300))

            // Use the custom search method that properly handles multiple topics
            const response = await authenticationService.searchBlogs({
                page: pageParam,
                limit: 12,
                search: search || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                topics: selectedTopics.length > 0 ? selectedTopics : undefined,
                order_by:
                    sortOrder === 'newest' ? '-ngayXuatBan' : 'ngayXuatBan',
            })

            return {
                // Map API response structure
                blogs: response.data.results,
                count: response.data.count,
                page: pageParam,
                // Calculate total pages based on count and limit
                totalPages: Math.ceil(response.data.count / 12),
                // Store next/prev for pagination
                next: response.data.next,
                previous: response.data.previous,
                // Also store total results for display
                totalResults: response.data.count,
            }
        },
        getNextPageParam: (lastPage) => {
            // If there's a next URL or we're not on the last page
            if (lastPage.next || lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1
            }
            return undefined
        },
        initialPageParam: 1,
    })

    // Extract all blogs from all pages
    const allBlogs = data?.pages.flatMap((page) => page.blogs) || []

    // Infinite scroll logic
    const lastBlogElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoading) return
            if (observer.current) observer.current.disconnect()

            observer.current = new IntersectionObserver(
                (entries) => {
                    // If the element is 50% visible and we have more pages to load
                    if (
                        entries[0].isIntersecting &&
                        hasNextPage &&
                        !isFetchingNextPage
                    ) {
                        // Add a small delay to prevent rapid firing when scrolling fast
                        setTimeout(() => {
                            fetchNextPage()
                        }, 100)
                    }
                },
                {
                    // This makes the observer trigger when the element is 200px below the viewport
                    // giving us time to load before the user reaches the end
                    rootMargin: '0px 0px 200px 0px',
                    threshold: 0.1, // Trigger when at least 10% visible
                }
            )

            if (node) observer.current.observe(node)
        },
        [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
    )

    // Handle search input submit - can be kept for immediate search if needed
    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const searchTerm = formData.get('search') as string
        setIsSearching(false)
        setSearch(searchTerm)
        setSearchInputValue(searchTerm)
    }

    // Handle topic selection with optimized batching
    const handleTopicChange = (topicId: number) => {
        setIsUpdatingFilters(true)
        setIsSearching(true)

        // Update selected topics in a batch
        const updatedTopics = selectedTopics.includes(topicId)
            ? selectedTopics.filter((id) => id !== topicId)
            : [...selectedTopics, topicId]

        debouncedFilterUpdate({ topics: updatedTopics })
    }

    // Handle date range selection with optimized batching
    const handleDateRangeChange = (dates: any) => {
        setIsUpdatingFilters(true)
        setIsSearching(true)

        let updatedStartDate = ''
        let updatedEndDate = ''

        if (dates && dates.length === 2) {
            updatedStartDate = dates[0].format('YYYY-MM-DD')
            updatedEndDate = dates[1].format('YYYY-MM-DD')
        }

        debouncedFilterUpdate({
            startDate: updatedStartDate,
            endDate: updatedEndDate,
        })
    }

    // Handle sort order change with optimized immediate update
    const handleSortChange = (order: string) => {
        // Don't use debounce for dropdown to make it feel more responsive
        setIsSearching(true)
        setSortOrder(order)

        // Skip standard filter update debounce mechanism
        setTimeout(() => {
            setIsSearching(false)
            setIsUpdatingFilters(false)

            // Manually invalidate the query to refresh immediately
            queryClient.invalidateQueries({
                queryKey: ['blogs'],
                exact: false,
                refetchType: 'active',
            })
        }, 100)
    }

    // Clear all filters with optimized batching
    const clearAllFilters = () => {
        setIsUpdatingFilters(true)
        setIsSearching(true)
        setSearchInputValue('')

        debouncedFilterUpdate({
            search: '',
            startDate: '',
            endDate: '',
            topics: [],
            sortOrder: 'newest',
        })

        // Focus search input after clearing
        if (searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 100)
        }
    }

    // Get topic name based on language
    const getTopicName = (topic: Topic) => {
        return (
            topic.tenChuDe[locale as keyof typeof topic.tenChuDe] ||
            topic.tenChuDe.en
        )
    }

    // Determine if search is active to show loading state - account for filter updates too
    const isActiveSearch = isSearching || isFetching || isUpdatingFilters

    // Show skeleton loading when we're actively searching or loading initial data
    const showSkeletons = isActiveSearch || isLoading

    return (
        <div className="mx-auto py-8 px-4">
            <ScrollToTop />
            <div className="mb-[100px]">
                <Header />
            </div>
            <h1 className="text-3xl font-bold mb-8">{t('search.title')}</h1>

            {/* Toggle filters on mobile */}
            <div className="md:hidden mb-4">
                <Button
                    variant="outline"
                    onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                    className="w-full flex items-center justify-between"
                >
                    <span>{t('search.filters')}</span>
                    {isFiltersVisible ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </Button>
            </div>

            {/* Main content with filters on left and results on right */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters sidebar - left side */}
                <div
                    className={`${
                        isFiltersVisible ? 'block' : 'hidden'
                    } md:block md:w-2/4 lg:w-1/4 bg-white rounded-lg shadow p-4 h-fit sticky top-20`}
                >
                    {/* Improved Search bar with clean design */}
                    <form onSubmit={handleSearchSubmit} className="mb-6">
                        <div className="relative">
                            <div className="absolute left-3 translate-y-[60%] transform text-gray-400">
                                {isActiveSearch ? (
                                    <Loader2
                                        size={18}
                                        className="animate-spin text-purple-500"
                                    />
                                ) : (
                                    <Search size={18} />
                                )}
                            </div>
                            <Input
                                id="search"
                                name="search"
                                ref={searchInputRef}
                                placeholder={t('search.placeholder')}
                                value={searchInputValue}
                                onChange={handleSearchChange}
                                className="pl-10 pr-10 py-2 border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-100 focus:ring-opacity-50 rounded-md"
                            />
                            {searchInputValue && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-0 translate-y-[80%] transform text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            {/* <Button
                                type="submit"
                                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={isActiveSearch}
                            >
                                {isActiveSearch
                                    ? t('search.searching')
                                    : t('search.button')}
                            </Button> */}
                        </div>
                    </form>

                    <div className="space-y-6">
                        {/* Date range filters using AntD RangePicker */}
                        <div className="space-y-4">
                            <h6 className="font-medium">
                                {t('search.dateRange')}
                            </h6>
                            <RangePicker
                                className="w-full border border-input rounded-md focus:ring-1 focus:ring-purple-200"
                                placeholder={[
                                    t('search.startDate'),
                                    t('search.endDate'),
                                ]}
                                value={[
                                    startDate ? dayjs(startDate) : null,
                                    endDate ? dayjs(endDate) : null,
                                ]}
                                onChange={handleDateRangeChange}
                                format="DD/MM/YYYY"
                                disabled={isActiveSearch}
                                allowClear
                            />
                        </div>

                        {/* Topics filter */}
                        <div className="space-y-4">
                            <h6 className="font-medium">
                                {t('search.topics')}
                            </h6>
                            {isTopicsLoading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 6 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2"
                                            >
                                                <Skeleton className="h-4 w-4" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {topics?.map((topic: any) => (
                                        <div
                                            key={topic.id}
                                            className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded"
                                        >
                                            <Checkbox
                                                id={`topic-${topic.id}`}
                                                checked={selectedTopics.includes(
                                                    topic.id
                                                )}
                                                onCheckedChange={() =>
                                                    handleTopicChange(topic.id)
                                                }
                                                disabled={isActiveSearch}
                                                className="text-purple-600"
                                            />
                                            <Label
                                                htmlFor={`topic-${topic.id}`}
                                                className="text-sm font-normal cursor-pointer w-full"
                                            >
                                                {getTopicName(topic)}{' '}
                                                <span className="text-gray-500 text-xs">
                                                    ({topic.soLuongBaiViet})
                                                </span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clear filters button */}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={clearAllFilters}
                            disabled={
                                isActiveSearch ||
                                !(
                                    search ||
                                    startDate ||
                                    endDate ||
                                    selectedTopics.length > 0
                                )
                            }
                        >
                            {t('search.clearFilters')}
                        </Button>

                        {/* Active filters */}
                        {(search ||
                            startDate ||
                            endDate ||
                            selectedTopics.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="text-sm text-gray-500 mr-2">
                                    {t('search.activeFilters')}:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {search && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 bg-purple-50"
                                        >
                                            "{search}"
                                            <button
                                                onClick={() => {
                                                    setSearch('')
                                                    setSearchInputValue('')
                                                }}
                                                className="ml-1 hover:text-gray-700 disabled:opacity-50"
                                                disabled={isActiveSearch}
                                            >
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}

                                    {startDate && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 bg-purple-50"
                                        >
                                            {t('search.from')}{' '}
                                            {format(
                                                new Date(startDate),
                                                'dd/MM/yyyy'
                                            )}
                                            <button
                                                onClick={() => setStartDate('')}
                                                className="ml-1 hover:text-gray-700"
                                                disabled={isActiveSearch}
                                            >
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}

                                    {endDate && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 bg-purple-50"
                                        >
                                            {t('search.to')}{' '}
                                            {format(
                                                new Date(endDate),
                                                'dd/MM/yyyy'
                                            )}
                                            <button
                                                onClick={() => setEndDate('')}
                                                className="ml-1 hover:text-gray-700"
                                                disabled={isActiveSearch}
                                            >
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    )}

                                    {selectedTopics.map((topicId) => {
                                        const topic = topics?.find(
                                            (t: any) => t.id === topicId
                                        )
                                        return topic ? (
                                            <Badge
                                                key={topicId}
                                                variant="secondary"
                                                className="flex items-center gap-1 bg-purple-50"
                                            >
                                                {getTopicName(topic)}
                                                <button
                                                    onClick={() =>
                                                        handleTopicChange(
                                                            topicId
                                                        )
                                                    }
                                                    className="ml-1 hover:text-gray-700"
                                                    disabled={isActiveSearch}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </Badge>
                                        ) : null
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Blog results - right side */}
                <div className="md:w-3/4 lg:w-4/5">
                    {/* Results count with simple loading state and sort dropdown */}
                    <div className="flex justify-between items-center mb-6 h-6">
                        <div className="flex items-center">
                            {isActiveSearch ? (
                                <div className="flex items-center text-gray-500">
                                    <Loader2
                                        size={16}
                                        className="animate-spin mr-2"
                                    />
                                    <p>{t('search.loading')}</p>
                                </div>
                            ) : data?.pages && data.pages.length > 0 ? (
                                <p className="text-gray-500">
                                    {t('search.resultsCount', {
                                        count: data.pages[0].count,
                                    })}
                                </p>
                            ) : null}
                        </div>

                        {/* Sort dropdown */}
                        {!showSkeletons && allBlogs.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    {t('search.sortBy')}:
                                </span>
                                <Select
                                    value={sortOrder}
                                    onChange={(value) =>
                                        handleSortChange(value)
                                    }
                                    disabled={isActiveSearch}
                                    options={[
                                        {
                                            label: t('search.newest'),
                                            value: 'newest',
                                        },
                                        {
                                            label: t('search.oldest'),
                                            value: 'oldest',
                                        },
                                    ]}
                                    placeholder={t('search.sortBy')}
                                    className="w-[120px]"
                                    size="middle"
                                />
                            </div>
                        )}
                    </div>

                    {/* Blog grid with simpler transitions */}
                    <div className={isActiveSearch ? 'opacity-50' : ''}>
                        {showSkeletons ? (
                            // Loading skeletons in grid
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <Card
                                        key={`skeleton-${index}`}
                                        className="overflow-hidden flex flex-col"
                                    >
                                        <Skeleton className="h-48 w-full" />
                                        <CardContent className="p-4 flex-1">
                                            <Skeleton className="h-4 w-1/3 mb-2" />
                                            <Skeleton className="h-6 w-full mb-2" />
                                            <Skeleton className="h-4 w-full mb-1" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 border-t">
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center">
                                                    <Skeleton className="h-8 w-8 rounded-full mr-2" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="text-center py-12 border border-gray-200 rounded-lg">
                                <p className="text-red-500">
                                    {t('search.error')}
                                </p>
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    {t('search.retry')}
                                </Button>
                            </div>
                        ) : allBlogs.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-medium mb-2">
                                    {t('search.noResults')}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {t('search.tryAdjusting')}
                                </p>
                                <Button
                                    onClick={clearAllFilters}
                                    variant="outline"
                                >
                                    {t('search.clearFilters')}
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {allBlogs.map((blog, index) => {
                                        // Create a ref for the 5th-to-last item to start loading earlier
                                        const isNearLastElement =
                                            allBlogs.length > 5 &&
                                            index === allBlogs.length - 5
                                        const isLastElement =
                                            index === allBlogs.length - 1

                                        // Apply ref to both last and near-last elements for smoother loading
                                        return (
                                            <div
                                                key={blog.id}
                                                ref={
                                                    isLastElement ||
                                                    isNearLastElement
                                                        ? lastBlogElementRef
                                                        : null
                                                }
                                                className="transition-opacity duration-300 ease-in-out"
                                                style={{ opacity: 1 }}
                                            >
                                                <BlogFeatureCard
                                                    blog={blog}
                                                    countTopics={3}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Loading indicator using Antd Spin - only shown when scrolling and fetching next page */}
                                {isFetchingNextPage && (
                                    <div className="flex justify-center py-8 mt-4">
                                        <Spin
                                            size="large"
                                            tip={t('search.loadingMore')}
                                            spinning={true}
                                        />
                                    </div>
                                )}

                                {/* Invisible spacer for layout consistency when not loading */}
                                {hasNextPage && !isFetchingNextPage && (
                                    <div className="h-16"></div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* <div className="mt-24">
                <Footer topics={[]} />
            </div> */}
        </div>
    )
}

export function SearchClient() {
    return (
        <QueryClientProvider client={queryClient}>
            <SearchContent />
        </QueryClientProvider>
    )
}
