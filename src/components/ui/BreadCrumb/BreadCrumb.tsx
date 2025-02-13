import {
    Breadcrumb as AntdBreadcrumb,
    BreadcrumbProps,
    ConfigProvider,
} from 'antd'
import React from 'react'
import styles from './BreadCrumb.module.scss'

interface IBreadCrumb extends BreadcrumbProps {
    size?: 'large' | 'small'
}

/**
 * Property for the custom BreadCrumb component.
 *
 * @property {string} size - Font size of text. {'large' | 'small'}
 */

const Breadcrumb: React.FC<IBreadCrumb> = ({ size = 'large', ...rest }) => {
    const classCustom = `${styles[`bread_crumb_${size}`]}`

    return (
        <ConfigProvider
            theme={{
                components: {
                    Breadcrumb: {
                        itemColor: 'var(--text-color-hyperlink)',
                        lastItemColor: 'var(--background-black-default)',
                        linkColor: 'var(-text-color-hyperlink)',
                        separatorColor: 'var(-text-color-hyperlink)',
                    },
                },
            }}
        >
            <AntdBreadcrumb className={classCustom} {...rest} />
        </ConfigProvider>
    )
}

export default Breadcrumb
// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
