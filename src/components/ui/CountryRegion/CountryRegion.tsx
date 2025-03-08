/* -*- coding: utf-8 -*-
 * //
 * // All rights reserved.
 * //
 * // __author__ = "phamanhhuy22@gmail.com"
 * // __date__ = "2025-03-08 19:09:14"
 */

import React, { useEffect, useState } from 'react'
import { Empty, Form } from 'antd'
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
    form?: any
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
    form,
}) => {
    const [selectedCountry, setSelectedCountry] =
        useState<string>(initialCountry)
    const [states, setStates] = useState<IState[]>(
        State.getStatesOfCountry(initialCountry)
    )
    const t = useTranslations('profile.PersonalInfomation')

    useEffect(() => {
        setStates(State.getStatesOfCountry(selectedCountry))
        if (
            form &&
            State.getStateByCodeAndCountry(
                form.getFieldValue('state'),
                selectedCountry
            ) == undefined
        ) {
            form.setFieldsValue({ state: undefined })
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry])

    useEffect(() => {
        setSelectedCountry(initialCountry)
    }, [initialCountry])

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
                <label
                    htmlFor="country"
                    className={styles.label}
                    style={{ fontWeight: 'bold', fontSize: '16px' }}
                >
                    {t('countryOrTerritory')}{' '}
                    {type == 'height_48' && (
                        <span style={{ color: 'red' }}>*</span>
                    )}
                </label>
                <Form.Item name="quocGia" className={classNameFormItemCountry}>
                    <Select
                        id="country"
                        onChange={handleCountryChange}
                        className={`${styles.select} ${styles.selectFixedWidth} ${styles[`select_${type}`]} ${classNameCountry || ''}`}
                        showSearch
                        // filterOption={handleSearch}
                        popupClassName={styles.popup}
                        virtual
                    >
                        {Country.getAllCountries().map((country) => (
                            <Option
                                key={country.isoCode}
                                value={country.isoCode}
                            >
                                <span className="text-base">
                                    {country.name}
                                </span>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </div>
            <div className={styles.select_country_sub}>
                <label
                    htmlFor="state"
                    className={styles.label}
                    style={{ fontWeight: 'bold', fontSize: '16px' }}
                >
                    {type != 'height_48' ? t('city') : t('stateOrProvince')}
                    {type == 'height_48' && (
                        <span style={{ color: 'red' }}> *</span>
                    )}
                </label>
                <Form.Item
                    name={'thanhPho'}
                    rules={[
                        {
                            required: type == 'height_48' ? true : false,
                            message: (
                                <HintText
                                    size="small"
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
                        onChange={handleStateChange}
                        // filterOption={handleSearch}
                        popupClassName={styles.popup}
                        notFoundContent={
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={t('noData')}
                            />
                        }
                    >
                        {states.map((state) => (
                            <Option key={state.isoCode} value={state.isoCode}>
                                <span className="text-base">{state.name}</span>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </div>
        </div>
    )
}

export default CountryStateCitySelector
