// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

'use client'
import { useEffect } from 'react'
import { usePathname } from '@/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const ProgressBar = () => {
    const pathname = usePathname()

    // Disable the spinner
    NProgress.configure({ showSpinner: false })

    useEffect(() => {
        NProgress.start()

        const timer = setTimeout(() => {
            NProgress.done()
        }, 500)

        return () => {
            clearTimeout(timer)
            NProgress.done()
        }
    }, [pathname])
    return null
}

export default ProgressBar
