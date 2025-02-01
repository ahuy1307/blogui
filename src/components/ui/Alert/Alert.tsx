// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:38:41"
//

import React, { ReactNode } from 'react'
import { Alert as AntdAlert, AlertProps, ConfigProvider } from 'antd'

interface IAlert extends AlertProps {
    type: 'success' | 'info' | 'warning' | 'error'
}

const Alert: React.FC<IAlert> = ({ type, ...rest }) => {
    const colorMap = {
        success: 'var(--text-color-green)',
        info: 'var(--text-color-blue-info-icon)',
        warning: 'var(--text-color-red-warning)',
        error: 'var(--text-color-red-error)',
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Alert: {
                        colorSuccess: 'var(--text-color-green)',
                        colorSuccessBg: 'var(--background-green-default)',
                        colorErrorBg: 'var(--background-red-white)',
                        colorWarningBg: 'var(--background-orange-1)',
                        colorInfoBg: 'var(--border-color-light-blue-2)',
                        colorText: `${colorMap[type]}`,
                    },
                },
            }}
        >
            <AntdAlert type={type} style={{ borderRadius: '6px' }} {...rest} />
        </ConfigProvider>
    )
}

export default Alert
