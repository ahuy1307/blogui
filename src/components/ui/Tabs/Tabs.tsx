// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import React from 'react'
import { Tabs as AntTabs, ConfigProvider, TabsProps } from 'antd'
import styles from './Tabs.module.scss'

interface ITabs extends Omit<TabsProps, 'size'> {
    size?: 'medium' | 'large'
    items: {
        label: string
        key: string
        children?: React.ReactNode
        disabled?: boolean
        icon?: React.ReactNode
    }[]
    activeColor?: 'default' | 'white' | 'black'
}

/**
 * The `Tabs` component displays a list of tabs.
 *
 * @param {'medium' | 'large'} size - The size of the tabs (default is 'medium').
 * @param {Array} items - An array containing information about the tabs. Each item has the following properties:
 *    - label: The name of the tab.
 *    - key: A unique key to identify the tab.
 *    - children: The child components of the tab.
 *    - disabled: Determines whether the tab is disabled.
 *    - icon: The icon of the tab.
 * @param {"default" | "white" | "black"} props.activeColor - The color of the currently selected tab (default is 'default').
 * @returns {JSX.Element} - The JSX interface of the Tabs component.
 */

const Tabs: React.FC<ITabs> = ({
    size = 'medium',
    items,
    activeColor = 'default',
    ...rest
}) => {
    const isLarge = size === 'large'
    const tabClass = styles[`${size}_tab`]

    return (
        <ConfigProvider
            theme={{
                components: {
                    Tabs: {
                        inkBarColor:
                            activeColor == 'default'
                                ? 'var(--background-blue-default)'
                                : activeColor == 'white'
                                  ? 'var(--background-white-default)'
                                  : 'var(--background-black-default)',
                        itemColor:
                            activeColor == 'default' || activeColor == 'black'
                                ? 'var(--text-color-secondary)'
                                : '#FFFFFFB2',
                        itemHoverColor:
                            activeColor == 'default'
                                ? 'var(--background-blue-default)'
                                : activeColor == 'white'
                                  ? 'var(--background-white-default)'
                                  : 'var(--background-black-default)',
                        itemSelectedColor:
                            activeColor == 'default'
                                ? 'var(--background-blue-default)'
                                : activeColor == 'white'
                                  ? 'var(--background-white-default)'
                                  : 'var(--background-black-default)',
                        cardBg: 'var(--background-white-default)',
                        horizontalItemPadding: '12px',
                        horizontalItemGutter: 0,
                        fontSize: isLarge ? 16 : 14,
                        colorTextDisabled:
                            activeColor == 'default' || activeColor == 'black'
                                ? 'var(--text-color-disable)'
                                : '#FFFFFF80',
                    },
                },
            }}
        >
            <AntTabs
                defaultActiveKey="1"
                items={items.map((item) => ({
                    ...item,
                    icon: item.icon
                        ? React.cloneElement(
                              item.icon as React.ReactElement<any>,
                              {
                                  className: styles.icon,
                              }
                          )
                        : undefined,
                }))}
                className={tabClass}
                {...rest}
            />
        </ConfigProvider>
    )
}

export default Tabs
