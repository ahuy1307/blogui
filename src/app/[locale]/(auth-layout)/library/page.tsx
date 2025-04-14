/* -*- coding: utf-8 -*-
 * //
 * // All rights reserved.
 * //
 * // __author__ = "phamanhhuy22@gmail.com"
 * // __date__ = "2025-04-08 21:41:33"
 */

import { BlogLibrary } from '@/components/features/blog/BlogLibrary'
import { Toaster } from '@/components/other-ui/Toaster'

export default function Page() {
    return (
        <div className="mt-10">
            <Toaster />
            <BlogLibrary />
        </div>
    )
}
