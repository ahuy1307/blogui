import React, { FC, ReactNode } from 'react'
import {
    CheckCircleOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import styles from './HintText.module.scss'

interface HintTextProps extends React.HTMLAttributes<HTMLElement> {
    text: React.ReactNode
    type?: 'default' | 'success' | 'error' | 'info' | 'warning'
    style?: React.CSSProperties
    size?: 'large' | 'medium' | 'small'
}

/**
 * The HintText component displays a piece of text with a corresponding icon, based on the type of message.
 *
 * @param {React.ReactNode} text - The displayed text.
 * @param {"default" | "success" | "error" | "info" | "warning"} [type="default"] - The type of message.
 * @param {React.CSSProperties} [style] - Custom CSS properties.
 * @param {"large" | "medium" | "small"} size - The size of text
 * @returns {JSX.Element} - The JSX interface of HintText.
 */

const HintText: FC<HintTextProps> = ({
    text,
    type = 'default',
    size = 'medium',
    ...rest
}) => {
    const renderIcon = () => {
        const iconClass = `${styles.icon} ${styles[`icon_${type}`]}`

        switch (type) {
            case 'success':
                return <CheckCircleOutlined className={iconClass} />
            case 'error':
                return <ExclamationCircleOutlined className={iconClass} />
            case 'info':
                return <InfoCircleOutlined className={iconClass} />
            case 'warning':
                return <ExclamationCircleOutlined className={iconClass} />
            default:
                return <></>
        }
    }

    const textClass = `${styles.hint_text} ${styles[`hint_text_${type}`]} ${styles[`text_size_${size}`]}`

    return (
        <div className={styles.hint_text_container} {...rest}>
            <span className={textClass}>
                {renderIcon()} {text}
            </span>
        </div>
    )
}

export default HintText
