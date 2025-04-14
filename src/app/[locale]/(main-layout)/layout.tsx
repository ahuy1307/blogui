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
import { AppDataProvider } from '@/contexts/AppDataProvider'

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <MainLayout fontClass={robotoFont.className}>
            <AppDataProvider>{children}</AppDataProvider>
        </MainLayout>
    )
}
export default Layout
