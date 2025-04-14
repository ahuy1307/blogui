// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

import { ConfigProvider, RadioProps, Radio as AntdRadio } from 'antd'
import React from 'react'

const Radio = ({ ...rest }: RadioProps) => {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Radio: {
                        colorPrimary: 'var(--text-color-brand)',
                    },
                },
            }}
        >
            <AntdRadio {...rest} />
        </ConfigProvider>
    )
}

Radio.Group = AntdRadio.Group

export default Radio
