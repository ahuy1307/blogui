// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

import React from 'react'
import { Select as AntdSelect, SelectProps, ConfigProvider, Empty } from 'antd'
import { IoIosArrowDown } from 'react-icons/io'
import { useTranslations } from 'next-intl'

const { Option } = AntdSelect

const Select: React.FC<SelectProps> & { Option: typeof Option } = ({
    notFoundContent,
    ...rest
}) => {
    const t = useTranslations('components_ui.select')
    return (
        <ConfigProvider
            theme={{
                components: {
                    Select: {
                        optionSelectedFontWeight: 'var(--font-weight-regular)',
                        optionSelectedBg:
                            'var(--background-light-blue-primary)',
                        colorPrimary: 'var(--border-color-primary)',
                        colorPrimaryHover: 'var(--border-color-primary)',
                        colorText: 'var(--text-color-primary)',
                        colorTextPlaceholder: 'var(--text-color-placeholder)',
                        colorBgContainerDisabled: 'var(--border-color-disable)',
                    },
                },
            }}
        >
            <AntdSelect
                suffixIcon={
                    <IoIosArrowDown
                        size={20}
                        color={'var(--text-color-secondary)'}
                    />
                }
                notFoundContent={
                    notFoundContent || (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={t('noData')}
                        />
                    )
                }
                {...rest}
            />
        </ConfigProvider>
    )
}

Select.Option = Option

export default Select
