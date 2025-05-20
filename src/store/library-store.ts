import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Blog {
  id: string
  title: string
  description: string
  topic: string
  date: string
  slug: string
  image: string
  readTime?: string
}

interface LibraryState {
  savedBlogs: Blog[]
  likedBlogs: Blog[]
  saveBlog: (blog: Blog) => void
  removeSavedBlog: (id: string) => void
  likeBlog: (blog: Blog) => void
  unlikeBlog: (id: string) => void
  isSaved: (id: string) => boolean
  isLiked: (id: string) => boolean
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      savedBlogs: [],
      likedBlogs: [],

      saveBlog: (blog) => {
        const { savedBlogs } = get()
        if (!savedBlogs.some((savedBlog) => savedBlog.id === blog.id)) {
          set({ savedBlogs: [...savedBlogs, blog] })
        }
      },

      removeSavedBlog: (id) => {
        const { savedBlogs } = get()
        set({ savedBlogs: savedBlogs.filter((blog) => blog.id !== id) })
      },

      likeBlog: (blog) => {
        const { likedBlogs } = get()
        if (!likedBlogs.some((likedBlog) => likedBlog.id === blog.id)) {
          set({ likedBlogs: [...likedBlogs, blog] })
        }
      },

      unlikeBlog: (id) => {
        const { likedBlogs } = get()
        set({ likedBlogs: likedBlogs.filter((blog) => blog.id !== id) })
      },

      isSaved: (id) => {
        const { savedBlogs } = get()
        return savedBlogs.some((blog) => blog.id === id)
      },

      isLiked: (id) => {
        const { likedBlogs } = get()
        return likedBlogs.some((blog) => blog.id === id)
      },
    }),
    {
      name: "library-storage",
    },
  ),
)
