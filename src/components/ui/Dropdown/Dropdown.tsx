import React, { FC } from 'react'
import { Select as AntdSelect, ConfigProvider, SelectProps } from 'antd'
import styles from './Dropdown.module.scss'
import { SizeType } from 'antd/es/config-provider/SizeContext'
import { ANT_SIZE, borderRadiusSizes } from './constants'

interface DropdownProps extends Omit<SelectProps<any>, 'size'> {
    placeholderText: string
    size?: 'very_large' | 'large' | 'middle' | 'small' | 'very_small'
    options: { label: string; value: string | number }[]
}

/**
 * @fileoverview
 * Dropdown component that allows the user to select an item from a list of items.
 *
 * @typedef {('very_large' | 'large' | 'middle' | 'small' | 'very_small')} SizeType - Defines the size type of the dropdown.
 * @typedef {{label: string, value: string | number}} OptionType - Defines the type of options in the dropdown.
 *
 * @interface DropdownProps - Interface for the properties of the Dropdown component.
 * @property {string} placeholderText - Text displayed when the dropdown has no selected value.
 * @property {SizeType} [size="medium"] - Size of the dropdown. Can be "veryLarge", "large", "middle", "small" or "verySmall".
 * @property {OptionType[]} options - List of items for the dropdown, each item has a label and a value.
 *
 * @returns {JSX.Element} - JSX interface of Dropdown.
 */

const Dropdown: FC<DropdownProps> = ({
    placeholderText,
    size = 'middle',
    options,
    ...rest
}) => {
    const antdSize = ANT_SIZE.includes(size) ? (size as SizeType) : undefined

    const borderRadius: number | undefined = borderRadiusSizes[size]

    return (
        <ConfigProvider
            theme={{
                cssVar: true,
                components: {
                    Select: {
                        borderRadius: borderRadius,
                        colorPrimary: 'var(--border-color-hover)',
                        colorPrimaryHover: 'var(--border-color-hover)',
                        colorPrimaryActive: 'var(--border-color-active)',
                        colorError: 'var(--border-color-error)',
                        colorBorder: 'var(--border-color-default)',
                        colorText: 'var(--text-color-primary)',
                        colorBgContainerDisabled: 'var(--border-color-disable)',
                        colorBgContainer: 'var(--background-white-default)',
                    },
                },
            }}
        >
            <AntdSelect
                placeholder={placeholderText}
                {...rest}
                size={antdSize}
                className={`${styles[`dropdown_${size}`]} ${styles.dropdown}`}
                allowClear={true}
                options={options}
            />
        </ConfigProvider>
    )
}

export default Dropdown
