// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

import React from 'react'
import {
    Pagination as AntdPagination,
    ConfigProvider,
    PaginationProps,
} from 'antd'
import styles from './Pagination.module.scss'

interface IPagination extends PaginationProps {
    hoverColor?: 'default' | 'gray'
}

/**
 * Property for the custom Pagination component.
 *
 * @property {'default' | 'gray'} hoverColor - The color when hover item.
 *
 */
const Pagination: React.FC<IPagination> = ({
    hoverColor = 'default',
    disabled,
    ...rest
}) => {
    const custom_class =
        hoverColor === 'default' ? styles.item_border : styles.item_border_gray

    return (
        <ConfigProvider
            theme={{
                components: {
                    Pagination: {
                        itemSize: 40,
                        itemSizeSM: 32,
                        colorPrimary: 'var(--text-color-primary)',
                        colorPrimaryHover: 'var(--text-color-primary)',
                        colorText: 'var(--text-color-primary)',
                        colorTextDisabled: disabled
                            ? 'var(--text-color-disable)'
                            : 'var(--text-color-primary)',
                        fontWeightStrong: 400,
                        colorBgTextHover: 'none',
                        colorBgTextActive: 'none',
                    },
                },
            }}
        >
            <AntdPagination
                className={!disabled ? custom_class : undefined}
                disabled={disabled}
                {...rest}
            />
        </ConfigProvider>
    )
}

export default Pagination
