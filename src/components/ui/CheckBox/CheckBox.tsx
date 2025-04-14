// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import React from 'react'
import { Checkbox as AtdCheckBox, CheckboxProps, ConfigProvider } from 'antd'

const Checkbox: React.FC<CheckboxProps> = ({ ...rest }) => {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Checkbox: {
                        colorPrimary: 'var(--text-color-brand)',
                        colorPrimaryHover: 'var(--text-color-brand)',
                        colorBorder: 'var(--border-color-gray-two)',
                    },
                },
            }}
        >
            <AtdCheckBox {...rest} />
        </ConfigProvider>
    )
}

export default Checkbox
