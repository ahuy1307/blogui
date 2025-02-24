// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import { ConfigProvider, Avatar as AntdAvatar, AvatarProps } from 'antd'
import React from 'react'
import styles from './Avatar.module.scss'

interface IAvatar extends AvatarProps {
    size?: 24 | 32 | 36 | 40 | 44 | 48 | 50 | 52 | 60 | 80 | 90 | 120 | 200
    src?: string | React.ReactNode
}

/**
 * Property for the custom Avatar component.
 *
 * @property {number}  size  - The size of the avatar. {24 | 40 | 44 | 48 | 50 | 52 | 60 | 90 | 120 | 200}.
 * @property {string | ReactNode} src - The address of the image for an image avatar or image element
 */

const Avatar: React.FC<IAvatar> = ({ children, size = 44, src, ...rest }) => {
    const classCustomAvatar = `${styles.avatar_custom} ${styles.avatar_custom_size} ${styles[`size_${size}`]}`

    return (
        <AntdAvatar
            className={classCustomAvatar}
            size={size}
            src={src}
            {...rest}
        >
            {children}
        </AntdAvatar>
    )
}

export default Avatar
