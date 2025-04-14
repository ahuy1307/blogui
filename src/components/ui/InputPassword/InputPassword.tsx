// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

import React, { useState } from 'react'
import { InputProps } from 'antd'
import { VscEye, VscEyeClosed } from 'react-icons/vsc'
import styles from './InputPassword.module.scss'
import Input from '@/components/ui/TextField/TextField'

interface InputPasswordProps extends Omit<InputProps, 'size'> {
    placeholder: string
    className?: string
    size?: 'very_large' | 'large' | 'medium' | 'small' | 'very_small'
}

const InputPassword: React.FC<InputPasswordProps> = ({
    placeholder,
    ...rest
}) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholder}
            className={styles.password_field}
            suffix={
                showPassword ? (
                    <VscEye
                        data-testid="input-password-eye-icon"
                        onClick={() => setShowPassword(false)}
                        className={styles.eye_icon}
                    />
                ) : (
                    <VscEyeClosed
                        data-testid="input-password-eye-icon"
                        onClick={() => setShowPassword(true)}
                        className={styles.eye_icon}
                    />
                )
            }
            {...rest}
        />
    )
}

export default InputPassword
