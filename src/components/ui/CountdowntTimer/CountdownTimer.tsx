import React, { useState, useEffect } from 'react'
import styles from './CountdownTimer.module.scss'
import { calculateTimeLeft, formatTimeLeft } from './ultils' // Đảm bảo đường dẫn đến file timeUtils.ts là chính xác

interface CountdownTimerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value: number
    onFinish?: () => void
    onChange?: (milliseconds: number) => void
    format?: string
    valuePrefix?: React.ReactNode
    valueSuffix?: React.ReactNode
    valueTitle?: React.ReactNode
    valueStyle?: React.CSSProperties
    type?: 'white' | 'black'
    size?: 'default' | 'small'
}

/**
 * Props Countdown Timer Component
 * @property {number} value - Set target countdown time
 * @property {string} format - The format of the countdown timer {YYYY,DD,HH,mm,ss,SSS}. Default is 'HH:mm:ss'.
 * @property {ReactNode} valuePrefix - The prefix node of value
 * @property {ReactNode} valueSuffix - The suffix node of value
 * @property {ReactNode} valueTitle  - Display title
 * @property {CSSProperties} valueStyle - Set value section style
 * @property {() => void} onFinish - Trigger when time's up
 * @property {(value: number) => void} onChange - Trigger when time's changing
 * @property {'default' | 'black'} type - Set type of countdown timer
 * @property {'default' | 'small'} size - Set size of countdown timer
 * @returns JSX.Element
 */
const CountdownTimer: React.FC<CountdownTimerProps> = ({
    type = 'black',
    size = 'default',
    valuePrefix,
    valueSuffix,
    valueStyle,
    value,
    valueTitle,
    onFinish,
    onChange,
    format = 'HH:mm:ss',
    ...props
}) => {
    const [timeLeft, setTimeLeft] = useState(
        calculateTimeLeft(value, format).timeLeft
    )
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        const timer = setInterval(() => {
            const { timeLeft: newTimeLeft, onChangeValue } = calculateTimeLeft(
                value,
                format
            )
            setTimeLeft(newTimeLeft)

            if (onChange) {
                onChange(onChangeValue)
            }

            if (onChangeValue <= 0) {
                clearInterval(timer)
                if (onFinish) {
                    onFinish()
                }
            }
        }, 33)

        return () => clearInterval(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, format])

    if (!isMounted) {
        return null
    }

    const formattedTime = formatTimeLeft(timeLeft, format)
    const parts = formattedTime.split(/[:\s]+/)

    return (
        <div {...props}>
            {valueTitle && (
                <div className={styles.countdown_title}>{valueTitle}</div>
            )}
            <div className={styles.box_countdown_value}>
                {valuePrefix && <span>{valuePrefix}</span>}
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        <span
                            style={valueStyle}
                            className={`${styles.countdown_time} ${styles[`size_${size}`]} ${styles[`type_${type}`]}`}
                        >
                            {part}
                        </span>
                        {index < parts.length - 1 && (
                            <span
                                className={`${styles[`countdown_separator_${type}`]}`}
                            >
                                :
                            </span>
                        )}
                    </React.Fragment>
                ))}
                {valueSuffix && <span>{valueSuffix}</span>}
            </div>
        </div>
    )
}

export default CountdownTimer
