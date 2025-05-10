import { create } from "zustand"
import { persist } from "zustand/middleware"

// Sample blog data
const initialBlogs = [
  {
    id: "1",
    title: "Getting Started with Next.js and AI",
    slug: "getting-started-with-nextjs-and-ai",
    excerpt: "Learn how to build modern web applications with Next.js and integrate AI capabilities.",
    content: "# Getting Started with Next.js and AI\n\nNext.js is a powerful React framework...",
    coverImage: "/placeholder.svg?height=400&width=600",
    topics: ["Web Development", "AI"],
    author: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    publishedAt: "2023-04-12T10:00:00Z",
    likes: 42,
    views: 1024,
    comments: [
      { id: "c1", author: "Jane Smith", content: "Great article!", createdAt: "2023-04-12T14:30:00Z" },
      { id: "c2", author: "Bob Johnson", content: "Very helpful, thanks!", createdAt: "2023-04-13T09:15:00Z" },
    ],
  },
  {
    id: "2",
    title: "Advanced CSS Techniques for Modern Websites",
    slug: "advanced-css-techniques",
    excerpt: "Discover powerful CSS techniques to create stunning visual effects and layouts.",
    content: "# Advanced CSS Techniques\n\nCSS has evolved significantly over the years...",
    coverImage: "/placeholder.svg?height=400&width=600",
    topics: ["CSS", "Web Design"],
    author: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    publishedAt: "2023-03-28T10:00:00Z",
    likes: 38,
    views: 876,
    comments: [
      {
        id: "c3",
        author: "Alice Williams",
        content: "This changed how I approach CSS!",
        createdAt: "2023-03-29T11:20:00Z",
      },
    ],
  },
  {
    id: "3",
    title: "Building a Blog with Next.js and Tailwind",
    slug: "building-blog-nextjs-tailwind",
    excerpt: "Step-by-step guide to creating a beautiful blog using Next.js and Tailwind CSS.",
    content: "# Building a Blog with Next.js and Tailwind\n\nIn this tutorial...",
    coverImage: "/placeholder.svg?height=400&width=600",
    topics: ["Next.js", "Tailwind", "Tutorial"],
    author: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    publishedAt: "2023-02-15T10:00:00Z",
    likes: 65,
    views: 1532,
    comments: [
      {
        id: "c4",
        author: "Mark Thompson",
        content: "Followed along and built my own blog!",
        createdAt: "2023-02-16T15:45:00Z",
      },
      {
        id: "c5",
        author: "Sarah Johnson",
        content: "Clear and concise instructions.",
        createdAt: "2023-02-17T08:30:00Z",
      },
    ],
  },
]

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  topics: string[]
  author: {
    name: string
    avatar: string
  }
  publishedAt: string
  likes?: number
  views?: number
  comments?: Array<{
    id: string
    author: string
    content: string
    createdAt: string
  }>
}

interface BlogStore {
  userBlogs: Blog[]
  addUserBlog: (blog: Blog) => void
  updateUserBlog: (id: string, updatedBlog: Partial<Blog>) => void
  deleteUserBlog: (id: string) => void
  getBlogById: (id: string) => Blog | undefined
}

export const useBlogStore = create<BlogStore>()(
  persist(
    (set, get) => ({
      userBlogs: initialBlogs,

      addUserBlog: (blog) => {
        set((state) => ({
          userBlogs: [...state.userBlogs, blog],
        }))
      },

      updateUserBlog: (id, updatedBlog) => {
        set((state) => ({
          userBlogs: state.userBlogs.map((blog) => (blog.id === id ? { ...blog, ...updatedBlog } : blog)),
        }))
      },

      deleteUserBlog: (id) => {
        set((state) => ({
          userBlogs: state.userBlogs.filter((blog) => blog.id !== id),
        }))
      },

      getBlogById: (id) => {
        return get().userBlogs.find((blog) => blog.id === id)
      },
    }),
    {
      name: "blog-storage",
    },
  ),
)
