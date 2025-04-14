// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-15 15:40:12"
//

import HomePage from '@/components/features/home/HomePage'
import { AppDataProvider } from '@/contexts/AppDataProvider'
import MainLayout from '@/components/layout/MainLayout'
import robotoFont from '@/core/config/fontConfig'

export default function Page() {
    return (
        <MainLayout fontClass={robotoFont.className}>
            <AppDataProvider>
                <HomePage />
            </AppDataProvider>
        </MainLayout>
    )
}
