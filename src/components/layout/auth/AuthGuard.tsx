// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

'use client'
import { useAuth } from '@/contexts/auth/AuthContext'
import { NAVIGATION_PATHS } from '@/constants/constants'
import { useRouter } from '@/navigation'
import { Layout, Spin } from 'antd'
import { Content } from 'antd/es/layout/layout'
import { FC, PropsWithChildren, useEffect } from 'react'
import styles from './AuthGuard.module.scss'

const AuthGuard: FC<PropsWithChildren> = ({ children }) => {
    const { isInitialized, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isInitialized) {
            return
        }

        if (!isAuthenticated) {
            router.push(NAVIGATION_PATHS.HOME)
        }
    }, [isInitialized, isAuthenticated, router])

    if (!isInitialized) {
        return <Spin fullscreen />
    }

    return (
        <Layout>
            <Content className="bg-[var(--background-white-default)]">
                {children}
            </Content>
        </Layout>
    )
}

export default AuthGuard
