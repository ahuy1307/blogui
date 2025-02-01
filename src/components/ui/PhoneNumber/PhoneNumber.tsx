// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

// import "react-international-phone/style.css";

import React, { useState } from 'react'
import {
    CountryIso2,
    defaultCountries,
    FlagImage,
    parseCountry,
    usePhoneInput,
} from 'react-international-phone'
import { Typography } from 'antd'
import styles from './PhoneNumber.module.scss'
import { useTranslations } from 'next-intl'
import Input from '@/components/ui/Input/Input'
import Select from '../Select/Select'

const { Option } = Select

interface PhoneProps {
    valueNumber?: string
    onChange?: (phone: string) => void
}

export const PhoneNumber: React.FC<PhoneProps> = ({
    valueNumber,
    onChange = () => {},
}) => {
    const { inputValue, handlePhoneValueChange, country, setCountry } =
        usePhoneInput({
            defaultCountry: 'vn',
            value: valueNumber,
            countries: defaultCountries,
            onChange: (data) => {
                onChange(data.phone)
            },
        })

    const t = useTranslations('components_ui.phoneNumber')
    const [isSelectFocused, setIsSelectFocused] = useState(false)

    const filterCountries = (input: string, option: any) => {
        if (!option?.children) {
            return false
        }
        const countryName = option.children[1]?.props.children
        const dialCode = option.children[2]?.props.children
        const searchText = `${countryName} ${dialCode}`
        return searchText.toLowerCase().includes(input.toLowerCase())
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        const currentDialCode = `+${country.dialCode}`

        if (
            !newValue.startsWith(`${currentDialCode}0`) &&
            !newValue.startsWith(`${currentDialCode} 0`) &&
            !newValue.startsWith(`${currentDialCode} (0`) &&
            newValue.startsWith(currentDialCode)
        ) {
            handlePhoneValueChange(e)
        }
    }

    return (
        <div className={styles.phone_number}>
            <Select
                value={country.iso2}
                onChange={(value) => setCountry(value as CountryIso2)}
                className={styles.phone_number_select}
                showSearch
                onFocus={() => setIsSelectFocused(true)}
                onBlur={() => setIsSelectFocused(false)}
                filterOption={filterCountries}
                dropdownStyle={{ width: '300px' }}
                labelRender={(label) => (
                    <div style={{ opacity: isSelectFocused ? 0.2 : 1 }}>
                        <div className={styles.img_circle}>
                            <FlagImage iso2={country.iso2} />
                        </div>
                    </div>
                )}
            >
                {defaultCountries.map((c) => {
                    const country = parseCountry(c)
                    return (
                        <Option
                            className={styles.options_box_item}
                            key={country.iso2}
                            value={country.iso2}
                        >
                            <FlagImage iso2={country.iso2} />

                            <Typography.Text>{country.name}</Typography.Text>
                            <Typography.Text type="secondary">
                                &#40;+{country.dialCode}&#41;
                            </Typography.Text>
                        </Option>
                    )
                })}
            </Select>
            <Input
                className={styles.phone_number_input}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={t('enterPhoneNumber')}
                size="large"
            />
        </div>
    )
}
