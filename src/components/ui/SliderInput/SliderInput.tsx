// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import React from 'react'
import { ConfigProvider, InputNumber, InputNumberProps, Slider } from 'antd'
import styles from './SliderInput.module.scss'

const SliderInput = ({ min, max, inputValue, setInputValue }: any) => {
    const onChange: InputNumberProps['onChange'] = (newValue) => {
        setInputValue(newValue as number)
    }
    return (
        <div className={styles.container}>
            <ConfigProvider
                theme={{
                    components: {
                        Slider: {
                            trackBg: 'var(--border-color-brand)',
                            trackHoverBg: 'var(--border-color-brand)',
                            handleColor: 'var(--border-color-brand)',
                        },
                    },
                }}
            >
                <Slider
                    min={min}
                    max={max}
                    onChange={onChange}
                    value={typeof inputValue === 'number' ? inputValue : 0}
                />
                <InputNumber
                    min={min}
                    max={max}
                    style={{ margin: '0 16px' }}
                    value={inputValue}
                    onChange={onChange}
                    className={styles.input_number}
                />
            </ConfigProvider>
        </div>
    )
}

export default SliderInput
