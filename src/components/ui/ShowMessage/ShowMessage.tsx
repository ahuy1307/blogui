// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import { Image } from 'antd'

const iconMap = {
    success: '/icon/circle-success-icon.svg',
    info: '/icon/circle-info-icon.svg',
    warning: '/icon/circle-warning-icon.svg',
    error: '/icon/circle-error-icon.svg',
}

export const ShowMessage = (
    messageApi: any,
    content: string | string[],
    type: 'success' | 'info' | 'warning' | 'error'
) => {
    const messageContent = Array.isArray(content) ? (
        <ul
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}
        >
            {content.map((msg, index) => (
                <li key={index}>{msg}</li>
            ))}
        </ul>
    ) : (
        content
    )

    messageApi[type]({
        icon: (
            <div
                style={{
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Image
                    width={16}
                    alt={type}
                    src={iconMap[type]}
                    preview={false}
                />
            </div>
        ),
        content: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {messageContent}
            </div>
        ),
    })
}
