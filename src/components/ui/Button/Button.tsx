// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

import { Button as AntdButton, ButtonProps, ConfigProvider } from 'antd'
import styles from './Button.module.scss'
import { getSizeClass } from './ultils'

interface IButton
    extends Omit<ButtonProps, 'size' | 'type' | 'shape' | 'className'> {
    size?: 'very_large' | 'large' | 'middle' | 'small' | 'very_small'
    type?:
        | 'primary'
        | 'default'
        | 'black_primary'
        | 'black_secondary'
        | 'white_primary'
        | 'white_secondary'
        | 'text'
    shape?: 'circle' | 'square'
    color?:
        | 'danger'
        | 'primary'
        | 'default'
        | 'blue'
        | 'purple'
        | 'cyan'
        | 'green'
        | 'magenta'
        | 'pink'
        | 'red'
        | 'orange'
        | 'yellow'
        | 'volcano'
        | 'geekblue'
        | 'lime'
        | 'gold'
    subcontent?: string
    className?: string
}

/**
 * Property for the custom Button component.
 *
 * @property {string}  size  - The size of the button. {'veryLarge' | 'large' | 'middle' | 'small' | 'verySmall'} .
 * @property {string} type - The type of the button. {'primary' | 'default' | 'blackPrimary' | 'blackSecondary' | 'whitePrimary' | 'whiteSecondary' | 'text'}.
 * @property {string} shape - The shape of the button. {'circle' | 'square'}
 * @property {string} color - The color of the text button. {'white' | 'primary'}
 * @property {string} subcontent - The subcontent of the square button.
 * @property {ReactNode} icon - The icon of the button.
 */

const Button: React.FC<IButton> = ({
    color = 'primary',
    size = 'middle',
    type = 'default',
    shape = 'circle',
    subcontent = '',
    icon,
    loading,
    children,
    className,
    ...rest
}) => {
    const getCustomClassName = () => {
        if (type !== 'text') {
            const sizeClass = getSizeClass(size, icon, shape, children)
            const typeClass = styles[type]
            const subcontentClass = `${styles.square_button} ${icon && styles.square_button_icon}`
            return `${sizeClass} ${typeClass} ${shape === 'square' && subcontentClass}`
        } else {
            return ''
        }
    }

    const ANTD_TYPES = ['primary', 'default', 'text']
    const ANTD_SIZES = ['large', 'middle', 'small']

    const antdSize = ANTD_SIZES.find((it) => it === size) as ButtonProps['size']
    const antdType = ANTD_TYPES?.find(
        (it) => it === type
    ) as ButtonProps['type']

    const isSquareShape = shape === 'square'
    return (
        <ConfigProvider
            theme={{
                components: {
                    Button: {
                        controlHeightLG: isSquareShape ? 56 : 44,
                        controlHeight: isSquareShape ? 48 : 40,
                        controlHeightSM: isSquareShape ? 44 : 32,
                        contentFontSize: 16,
                        contentFontSizeLG: 16,
                        contentFontSizeSM: 14,
                        colorPrimary: 'var(--text-color-brand)',
                        colorPrimaryHover: 'var(--background-blue-hover)',
                        colorPrimaryActive: 'var(--background-blue-pressed)',
                        colorBorder: 'var(--border-color-brand)',
                        colorText:
                            color == 'default'
                                ? 'var(--text-color-default)'
                                : color == 'primary'
                                  ? 'var(--text-color-brand)'
                                  : 'var(--text-color-brand)',
                        borderColorDisabled: 'var(--border-color-disable)',
                        defaultHoverBg: 'var(--background-light-blue-default)',
                        defaultActiveBg: 'var(--background-light-blue-pressed)',
                        textHoverBg: 'none',
                    },
                },
            }}
        >
            <AntdButton
                className={`${styles.custom_button} ${getCustomClassName()} ${className}`}
                size={antdSize}
                type={antdType}
                shape={shape === 'square' ? 'default' : 'round'}
                icon={icon}
                loading={loading}
                {...rest}
            >
                {children}
                {subcontent && (
                    <div className={styles.sub_content}>{subcontent}</div>
                )}
            </AntdButton>
        </ConfigProvider>
    )
}
export default Button
