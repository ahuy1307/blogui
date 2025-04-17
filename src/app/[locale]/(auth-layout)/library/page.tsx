/* -*- coding: utf-8 -*-
 * //
 * // All rights reserved.
 * //
 * // __author__ = "phamanhhuy22@gmail.com"
 * // __date__ = "2025-04-08 21:41:33"
 */

'use client'

import { BlogLibrary } from '@/components/features/blog/BlogLibrary'
import { Footer } from '@/components/features/home/Footer'
import { Toaster } from '@/components/other-ui/Toaster'
import { useAppData } from '@/contexts/AppDataProvider'

export default function Page() {
    const { topics, isLoading, error } = useAppData()

    return (
        <div className="mt-10">
            <Toaster />
            <BlogLibrary />
            <Footer topics={topics.slice(0, 5)} />
        </div>
    )
}
