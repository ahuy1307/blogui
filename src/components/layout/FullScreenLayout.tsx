// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:37:59"
//

'use client'

import type { PropsWithChildren } from 'react'
import styles from './FullScreenLayout.module.scss'

interface FullScreenLayoutProps extends PropsWithChildren {
    children: React.ReactNode
    isMarginTop?: boolean
}

const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({
    isMarginTop = true,
    children,
}) => {
    return (
        <div
            className={`${styles.layout_container} ${isMarginTop ? styles.layout_margin_top : ''}`}
        >
            {children}
        </div>
    )
}
export default FullScreenLayout
