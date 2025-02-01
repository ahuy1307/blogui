// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:37:59"
//

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
            className={`min-h-[calc(100vh-64px)] bg-transparent ${isMarginTop ? 'mt-[64px]' : ''} md:min-h-[calc(100vh-60px)] ${isMarginTop ? 'md:mt-[60px]' : ''}`}
        >
            {children}
        </div>
    )
}
export default FullScreenLayout
