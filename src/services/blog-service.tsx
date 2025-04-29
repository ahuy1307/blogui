// API endpoint for topics
const TOPICS_API = '/api/topics'
const BLOGS_API = '/api/blogs/search'

// Function to fetch all topics
export async function fetchTopics(): Promise<Topic[]> {
    try {
        const response = await fetch(TOPICS_API)
        if (!response.ok) {
            throw new Error('Failed to fetch topics')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching topics:', error)
        return []
    }
}

// Function to search blogs with filters
export async function searchBlogs(
    params: BlogSearchParams
): Promise<BlogSearchResponse> {
    try {
        // Build query string
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.startDate) queryParams.append('startDate', params.startDate)
        if (params.endDate) queryParams.append('endDate', params.endDate)
        if (params.topicIds && params.topicIds.length > 0) {
            queryParams.append('topicIds', params.topicIds.join(','))
        }

        const url = `${BLOGS_API}?${queryParams.toString()}`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Failed to fetch blogs')
        }

        return await response.json()
    } catch (error) {
        console.error('Error searching blogs:', error)

        // Return empty response on error
        return {
            blogs: [],
            totalPages: 0,
            totalResults: 0,
            page: params.page || 1,
        }
    }
}

// Mock implementation for development (will be replaced by actual API calls)
export async function mockSearchBlogs(
    params: BlogSearchParams
): Promise<BlogSearchResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate mock blogs
    const allBlogs: Blog[] = Array.from({ length: 100 }, (_, i) => ({
        id: `blog-${i + 1}`,
        createdAt: new Date(
            2025,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        updatedAt: new Date(
            2025,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        isDeleted: false,
        tieuDe: `Bài viết ${i + 1} ${params.search ? `về ${params.search}` : ''}`,
        noiDungNgan:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        anhBia: `/placeholder.svg?height=200&width=400&text=Blog+${i + 1}`,
        thoiGianDoc: Math.floor(Math.random() * 10) + 3,
        luotYeuThich: Math.floor(Math.random() * 100),
        luotXem: Math.floor(Math.random() * 1000),
        noiDungTomTat: 'Tóm tắt nội dung bài viết này...',
        slug: `bai-viet-${i + 1}`,
        daXuatBan: Math.random() > 0.2,
        ngayXuatBan: new Date(
            2025,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        tacGia: {
            id: `author-${(i % 5) + 1}`,
            ho: 'Nguyễn',
            ten: `Tác giả ${(i % 5) + 1}`,
            avatar: `/placeholder.svg?height=40&width=40&text=A${(i % 5) + 1}`,
            slug: `tac-gia-${(i % 5) + 1}`,
        },
        chuDes: [
            {
                id: (i % 8) + 1,
                tenChuDe: {
                    vi: `Chủ đề ${(i % 8) + 1}`,
                    en: `Topic ${(i % 8) + 1}`,
                },
                noiDung: {
                    vi: `Nội dung chủ đề ${(i % 8) + 1}`,
                    en: `Topic content ${(i % 8) + 1}`,
                },
                soLuongBaiViet: Math.floor(Math.random() * 50) + 10,
            },
        ],
        thanhPhans: [],
        nguoiDungYeuThich: [],
        daYeuThich: Math.random() > 0.7,
        daLuu: Math.random() > 0.7,
        blogCuaBan: Math.random() > 0.9,
    }))

    // Filter by search term
    let filteredBlogs = allBlogs
    if (params.search) {
        filteredBlogs = filteredBlogs.filter((blog) =>
            blog.tieuDe.toLowerCase().includes(params.search!.toLowerCase())
        )
    }

    // Filter by date range
    if (params.startDate) {
        const start = new Date(params.startDate)
        filteredBlogs = filteredBlogs.filter(
            (blog) => new Date(blog.ngayXuatBan) >= start
        )
    }

    if (params.endDate) {
        const end = new Date(params.endDate)
        end.setHours(23, 59, 59, 999)
        filteredBlogs = filteredBlogs.filter(
            (blog) => new Date(blog.ngayXuatBan) <= end
        )
    }

    // Filter by topics
    if (params.topicIds && params.topicIds.length > 0) {
        filteredBlogs = filteredBlogs.filter((blog) =>
            blog.chuDes.some((topic) => params.topicIds!.includes(topic.id))
        )
    }

    // Paginate results
    const pageSize = params.limit || 12
    const page = params.page || 1
    const totalPages = Math.ceil(filteredBlogs.length / pageSize)
    const paginatedBlogs = filteredBlogs.slice(
        (page - 1) * pageSize,
        page * pageSize
    )

    return {
        blogs: paginatedBlogs,
        totalPages,
        totalResults: filteredBlogs.length,
        page,
    }
}

// Mock implementation for topics
export async function mockFetchTopics(): Promise<Topic[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return [
        {
            id: 1,
            tenChuDe: { vi: 'Trí tuệ nhân tạo', en: 'Artificial Intelligence' },
            noiDung: { vi: 'Nội dung về AI', en: 'Content about AI' },
            soLuongBaiViet: 42,
        },
        {
            id: 2,
            tenChuDe: { vi: 'Học máy', en: 'Machine Learning' },
            noiDung: { vi: 'Nội dung về ML', en: 'Content about ML' },
            soLuongBaiViet: 38,
        },
        {
            id: 3,
            tenChuDe: { vi: 'Thị giác máy tính', en: 'Computer Vision' },
            noiDung: { vi: 'Nội dung về CV', en: 'Content about CV' },
            soLuongBaiViet: 27,
        },
        {
            id: 4,
            tenChuDe: {
                vi: 'Xử lý ngôn ngữ tự nhiên',
                en: 'Natural Language Processing',
            },
            noiDung: { vi: 'Nội dung về NLP', en: 'Content about NLP' },
            soLuongBaiViet: 31,
        },
        {
            id: 5,
            tenChuDe: { vi: 'Học sâu', en: 'Deep Learning' },
            noiDung: { vi: 'Nội dung về DL', en: 'Content about DL' },
            soLuongBaiViet: 45,
        },
        {
            id: 6,
            tenChuDe: { vi: 'Robot học', en: 'Robotics' },
            noiDung: {
                vi: 'Nội dung về Robotics',
                en: 'Content about Robotics',
            },
            soLuongBaiViet: 19,
        },
        {
            id: 7,
            tenChuDe: { vi: 'Khoa học dữ liệu', en: 'Data Science' },
            noiDung: { vi: 'Nội dung về DS', en: 'Content about DS' },
            soLuongBaiViet: 53,
        },
        {
            id: 8,
            tenChuDe: { vi: 'Mạng nơ-ron', en: 'Neural Networks' },
            noiDung: { vi: 'Nội dung về NN', en: 'Content about NN' },
            soLuongBaiViet: 36,
        },
    ]
}
