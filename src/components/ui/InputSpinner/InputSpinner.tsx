'use client'
import { Button, Input, type InputProps } from 'antd'
import Compact from 'antd/es/space/Compact'
import React, { useState } from 'react'
import styles from './InputSpinner.module.scss'
import AddIcon from 'public/icon/add-icon.svg'
import AddSmallIcon from 'public/icon/add-small-icon.svg'
import SubIcon from 'public/icon/subtract-icon.svg'

interface IProps extends InputProps {
    step?: number
    min?: number
    max?: number
    onSubClick?: (preValue: number, newValue: number) => void
    onAddClick?: (preValue: number, newValue: number) => void
    subDisabled?: boolean
    addDisabled?: boolean
}
/**
 * `InputSpinner` is a React functional component that provides a numeric input field with increment and decrement buttons.
 *
 * @param {object} props - - All other props that an Ant Design `Input` component would accept (`InputProps`).
 * @param {number} [value=0] - Initial value of the input field.
 * @param {number} [step=1] - Increment/decrement value when the user clicks the "+" or "-" button.
 * @param {number} [min] - Minimum value the input field can have. If provided and the user tries to decrement below this value, the value will be set to `min`.
 * @param {number} [max] - Maximum value the input field can have. If provided and the user tries to increment beyond this value, the value will be set to `max`.
 * @param {function} [onChange] - Function that gets called when the value of the input field changes.
 * @param {function} [onSubClick] - Function that gets called when the "-" button is clicked.
 * @param {function} [onAddClick] - Function that gets called when the "+" button is clicked.
 *
 * @return {JSX.Element} A JSX structure that includes a `Compact` component from Ant Design (which is a layout component that arranges its children in a compact manner), a decrement button ("-"), and the input field. The size of the buttons is determined by the `size` prop passed to the `InputSpinner` component.
 */
const InputSpinner: React.FC<IProps> = ({
    value,
    step = 1,
    min,
    max,
    size,
    subDisabled,
    addDisabled,
    onChange,
    onSubClick,
    onAddClick,
    ...props
}) => {
    const [number, setNumber] = useState(0)
    const iconSize = size === 'small' ? 10 : 14

    const isSubDisabled =
        min !== undefined
            ? value
                ? min >= Number(value)
                : min >= number
            : false
    const isAddDisabled =
        max !== undefined
            ? value
                ? max <= Number(value)
                : max <= number
            : false

    const handleAddClick = () => {
        if (value !== undefined) {
            if (onAddClick) {
                onAddClick(Number(value), Number(value) + step)
            }
        } else {
            setNumber((pre) => Number(pre) + step)
        }
    }
    const handleSubClick = () => {
        if (value !== undefined) {
            if (onSubClick) {
                onSubClick(Number(value), Number(value) - step)
            }
        } else {
            setNumber((pre) => Number(pre) - step)
        }
    }
    return (
        <Compact>
            <Button
                disabled={subDisabled || isSubDisabled}
                className={styles[`btn_${size}`]}
                icon={<SubIcon className={styles.icon} width={iconSize} />}
                size={size}
                type="default"
                onClick={() => handleSubClick()}
            ></Button>
            <Input
                className={styles[`input_${size}`]}
                value={value ? value : number}
                {...props}
                onChange={(e) => {
                    if (onChange) {
                        onChange(e)
                    } else {
                        setNumber(Number(e?.target?.value) || 0)
                    }
                }}
            />
            <Button
                disabled={addDisabled || isAddDisabled}
                className={styles[`btn_${size}`]}
                icon={
                    size !== 'small' ? (
                        <AddIcon
                            className={styles.icon}
                            width={iconSize}
                            height={iconSize}
                        />
                    ) : (
                        <AddSmallIcon className={styles.icon} />
                    )
                }
                size={size}
                type="default"
                onClick={() => handleAddClick()}
            ></Button>
        </Compact>
    )
}
export default InputSpinner
