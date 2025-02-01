import React, { FC } from 'react'
import {
    ConfigProvider,
    InputNumber as InputNumberAntd,
    InputNumberProps,
} from 'antd'
import {
    getAntdSizeProp,
    getBorderRadius,
    getSizeClassName,
} from '../Input/ultils'
import styles from '../TextField/TextField.module.scss'
interface TextFieldProps extends Omit<InputNumberProps, 'size'> {
    size?: 'very_large' | 'large' | 'medium' | 'small' | 'very_small'
}

const InputNumber: FC<TextFieldProps> = ({
    size = 'medium',
    className,
    ...rest
}) => {
    const sizeClassName = getSizeClassName(size)
    const antdSizeProp = getAntdSizeProp(size)
    const borderRadius = getBorderRadius(size)

    return (
        <ConfigProvider
            theme={{
                cssVar: true,
                components: {
                    InputNumber: {
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
            <InputNumberAntd
                size={antdSizeProp}
                className={`${sizeClassName} ${styles.input} ${className}`}
                {...rest}
            />
        </ConfigProvider>
    )
}

export default InputNumber
