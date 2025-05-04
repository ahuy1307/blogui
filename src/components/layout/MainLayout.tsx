// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-15 18:55:24"
//

'use client'

import { Layout } from 'antd'
import type { PropsWithChildren } from 'react'
import { Content } from 'antd/es/layout/layout'
import styles from './MainLayout.module.scss'
import FullScreenLayout from './FullScreenLayout'

const MainLayout: React.FC<PropsWithChildren & { fontClass: string }> = ({
    children,
    fontClass,
}) => {
    return (
        <Layout className={styles.main_layout}>
            <FullScreenLayout>
                <Content className={fontClass}>{children}</Content>
            </FullScreenLayout>
        </Layout>
    )
}
export default MainLayout
