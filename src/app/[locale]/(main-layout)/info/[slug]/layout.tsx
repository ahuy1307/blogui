/* -*- coding: utf-8 -*-
 * //
 * // All rights reserved.
 * //
 * // __author__ = "phamanhhuy22@gmail.com"
 * // __date__ = "2025-03-08 19:09:14"
 */

import MainLayout from '@/components/layout/MainLayout'
import type { PropsWithChildren } from 'react'
import robotoFont from '@/core/config/fontConfig'
import AuthGuard from '@/components/layout/auth/AuthGuard'
import Header from '@/components/features/home/Header'

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <>
            <Header />
            {children}
        </>
    )
}
export default Layout
