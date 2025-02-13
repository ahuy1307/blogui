// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

import React, { useEffect, useState } from 'react'
import { Form } from 'antd'
import { Country, State, IState } from 'country-state-city'
import styles from './CountryRegion.module.scss'
import { useTranslations } from 'next-intl'
import HintText from '../HintText/HintText'
import Select from '../Select/Select'

const { Option } = Select

interface CountryStateCitySelectorProps {
    initialCountry?: string
    initialState?: string
    type?: 'default' | 'height_48'
    onCountryChange?: (country: string) => void
    onStateChange?: (state: string) => void
    classNameState?: any
    classNameCountry?: any
    classNameContainer?: any
    styleContainer?: any
    classNameFormItemCountry?: any
    classNameFormItemState?: any
}

const CountryStateCitySelector: React.FC<CountryStateCitySelectorProps> = ({
    initialCountry = 'VN',
    initialState,
    type = 'default',
    onCountryChange,
    onStateChange,
    classNameState,
    classNameCountry,
    classNameContainer,
    styleContainer,
    classNameFormItemCountry,
    classNameFormItemState,
}) => {
    const [selectedCountry, setSelectedCountry] =
        useState<string>(initialCountry)
    const [states, setStates] = useState<IState[]>(
        State.getStatesOfCountry(initialCountry)
    )
    const t = useTranslations('account.SetInformation')

    useEffect(() => {
        setStates(State.getStatesOfCountry(selectedCountry))
    }, [selectedCountry])

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value)
        if (onCountryChange) {
            onCountryChange(value)
        }
    }

    const handleStateChange = (value: string) => {
        if (onStateChange) {
            onStateChange(value)
        }
    }

    const removeAccents = (str: string) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
    }

    const handleSearch = (input: any, option: any) => {
        const optionLabel = option?.children as string | undefined
        if (optionLabel) {
            const normalizedInput = removeAccents(input.toLowerCase())
            const normalizedLabel = removeAccents(optionLabel.toLowerCase())
            return normalizedLabel.indexOf(normalizedInput) >= 0
        }
        return false
    }

    return (
        <div
            style={styleContainer}
            className={`${styles.select_country} ${styles[`container_${type}`]} ${classNameContainer}`}
        >
            <div className={styles.select_country_sub}>
                <label htmlFor="country" className={styles.label}>
                    {t('countryOrTerritory')}{' '}
                    {type == 'height_48' && (
                        <span style={{ color: 'red' }}>*</span>
                    )}
                </label>
                <Form.Item name="country" className={classNameFormItemCountry}>
                    <Select
                        id="country"
                        onChange={handleCountryChange}
                        className={`${styles.select} ${styles.selectFixedWidth} ${styles[`select_${type}`]} ${classNameCountry || ''}`}
                        dropdownStyle={{ width: '300px' }}
                        showSearch
                        filterOption={handleSearch}
                    >
                        {Country.getAllCountries().map((country) => (
                            <Option
                                key={country.isoCode}
                                value={country.isoCode}
                            >
                                {country.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </div>
            <div className={styles.select_country_sub}>
                <label htmlFor="state" className={styles.label}>
                    {type != 'height_48' ? t('city') : t('stateOrProvince')}
                    {type == 'height_48' && (
                        <span style={{ color: 'red' }}> *</span>
                    )}
                </label>
                <Form.Item
                    name={'state'}
                    rules={[
                        {
                            required: type == 'height_48' ? true : false,
                            message: (
                                <HintText
                                    type="error"
                                    text={t('pleaseSelectStateOrProvince')}
                                />
                            ),
                        },
                    ]}
                    className={classNameFormItemState}
                >
                    <Select
                        id="state"
                        showSearch
                        placeholder={t('chooseOrEnterCity')}
                        className={`${styles.select} ${styles.selectFixedWidth} ${styles[`select_${type}`]} ${classNameState || ''}`}
                        dropdownStyle={{ width: '250px' }}
                        onChange={handleStateChange}
                        filterOption={handleSearch}
                    >
                        {states.map((state) => (
                            <Option key={state.isoCode} value={state.isoCode}>
                                {state.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </div>
        </div>
    )
}

export default CountryStateCitySelector
