'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import httpService from '@/core/config/httpService'
import { Topic } from '@/types/interface'

// interface Category {
//     id: string
//     title: string
// }

interface AppDataContextType {
    topics: Topic[]
    // categories: Category[]
    isLoading: boolean
    error: string | null
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined)

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [topics, setTopics] = useState<Topic[]>([])
    // const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [topicsRes] = await Promise.all([
                    httpService.get('/blogs/topics', {
                        params: {
                            have_blog: true,
                        },
                    }),
                    // httpService.get('/blogs/categories'),
                ])

                setTopics(topicsRes.data)
                // setCategories(categoriesRes.data)
            } catch (err) {
                setError('Failed to fetch data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <AppDataContext.Provider value={{ topics, isLoading, error }}>
            {children}
        </AppDataContext.Provider>
    )
}

export const useAppData = () => {
    const context = useContext(AppDataContext)
    if (!context) {
        throw new Error('useAppData must be used within an AppDataProvider')
    }
    return context
}
