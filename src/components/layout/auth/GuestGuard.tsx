'use client'
import { useAuth } from '@/contexts/auth/AuthContext'
import { NAVIGATION_PATHS } from '@/constants/constants'
import { useRouter } from '@/navigation'
import { FC, PropsWithChildren, useEffect } from 'react'

const GuestGuard: FC<PropsWithChildren> = ({ children }) => {
    const { isInitialized, isAuthenticated } = useAuth()
    const router = useRouter()
    useEffect(() => {
        if (!isInitialized) {
            return
        }

        if (isAuthenticated) {
            router.push(NAVIGATION_PATHS.HOME)
        }
    }, [isInitialized, isAuthenticated, router])

    if (!isInitialized) {
        return <div>Loading...</div>
    }

    return <>{children}</>
}

export default GuestGuard
