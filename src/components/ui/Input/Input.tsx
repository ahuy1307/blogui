// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import React, { FC } from 'react'
import { Input as AntdInput, ConfigProvider, InputProps } from 'antd'
import style from './Input.module.scss'
import { getSizeClassName, getAntdSizeProp, getBorderRadius } from './ultils'

interface IInputProps extends Omit<InputProps, 'size'> {
    size?: 'very_large' | 'large' | 'medium' | 'small' | 'very_small'
}

/**
 * The TextField component displays an input field with various size options and a placeholder.
 *
 * @param {"very_large" | "large" | "medium" | "small" | "very_small"} [size="medium"] - Size of the input.
 */

const Input: FC<IInputProps> = ({ size = 'medium', className, ...rest }) => {
    const sizeClassName = getSizeClassName(size)
    const antdSizeProp = getAntdSizeProp(size)
    const borderRadius = getBorderRadius(size)

    return (
        <ConfigProvider
            theme={{
                cssVar: true,
                components: {
                    Input: {
                        inputFontSize: 14,
                        borderRadius: borderRadius,
                        hoverBg: 'var(--background-white-default)',
                        colorPrimary: 'var(--border-color-active)',
                        activeShadow: '0 0 0',
                        colorPrimaryHover: 'var(--border-color-hover)',
                        colorPrimaryActive: 'var(--border-color-active)',
                        colorError: 'var(--border-color-error)',
                        colorErrorBorderHover: 'var(--border-color-hover)',
                        colorBorder: 'var(--border-color-default)',
                        colorText: 'var(--text-color-primary)',
                        colorBgContainerDisabled: 'var(--border-color-disable)',
                        paddingBlock: 10,
                        paddingInline: 12,
                        paddingBlockLG: 12,
                        paddingInlineLG: 12,
                        paddingBlockSM: 6,
                        paddingInlineSM: 12,
                        colorTextPlaceholder: 'var(--text-color-placeholder)',
                    },
                },
            }}
        >
            <AntdInput
                size={antdSizeProp}
                className={`${sizeClassName} ${style.input} ${className}`}
                {...rest}
            />
        </ConfigProvider>
    )
}

export default Input
