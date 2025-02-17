// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
'use client'
import styles from './InputFormItem.module.scss'
import Input from '../TextField/TextField'
import { Form, InputProps } from 'antd'
import HintText from '../HintText/HintText'
import { ValidateService } from '@/core/services/Validate.service'
import { useState } from 'react'
import { VscEye, VscEyeClosed } from 'react-icons/vsc'
import { useTranslations } from 'next-intl'

interface IInputProps extends Omit<InputProps, 'size'> {
    size?: 'very_large' | 'large' | 'medium' | 'small' | 'very_small'
    name: string
    classNameFormItem?: string
    classNameInput?: string
    type?:
        | 'default'
        | 'first_name'
        | 'last_name'
        | 'password'
        | 'email'
        | 'website'
        | 'search'
    required?: boolean
    requiredMessage?: string
    newRules?: any
    disabledOldRule?: boolean
    label?: any
    typeInput?: string
}

const InputFormItem = ({
    name,
    classNameFormItem,
    classNameInput,
    type = 'default',
    required = false,
    requiredMessage,
    newRules,
    disabledOldRule = false,
    label,
    typeInput,
    ...rest
}: IInputProps) => {
    const t = useTranslations('components_ui.inputFormItem')
    const [showPassword, setShowPassword] = useState(false)

    const rules = {
        default: {
            messageRequired: t('pleaseEnterInfo'),
            isInvalid: true,
        },
        first_name: {
            messageRequired: t('pleaseEnterFirstName'),
            isInvalid: (value: string) => {
                if (!ValidateService.validateMaxLength(value, 255))
                    return Promise.reject(
                        <HintText
                            size="small"
                            type="error"
                            text={t('nameExceedsLimit')}
                        />
                    )
                return ValidateService.validateName(value)
                    ? Promise.resolve()
                    : Promise.reject(
                          <HintText
                              size="small"
                              type="error"
                              text={t('invalidNameEntered')}
                          />
                      )
            },
        },
        last_name: {
            messageRequired: t('pleaseEnterLastName'),
            isInvalid: (value: string) => {
                if (!ValidateService.validateMaxLength(value, 255))
                    return Promise.reject(
                        <HintText
                            size="small"
                            type="error"
                            text={t('nameExceedsLimit')}
                        />
                    )
                return ValidateService.validateName(value)
                    ? Promise.resolve()
                    : Promise.reject(
                          <HintText
                              size="small"
                              type="error"
                              text={t('invalidNameEntered')}
                          />
                      )
            },
        },
        password: {
            messageRequired: t('pleaseEnterPassword'),
            isInvalid: (value: string) => {
                if (!ValidateService.validateMaxLength(value, 128))
                    return Promise.reject(
                        <HintText
                            size="small"
                            type="error"
                            text={t('passwordExceedsLimit')}
                        />
                    )
                return ValidateService.validatePassword(value)
                    ? Promise.resolve()
                    : Promise.reject(
                          <HintText
                              size="small"
                              type="error"
                              text={t('passwordCharacterNumberRequirement')}
                          />
                      )
            },
        },
        email: {
            messageRequired: t('pleaseEnterEmail'),
            isInvalid: (value: string) => {
                if (!ValidateService.validateLength(value, 0, 150))
                    return Promise.reject(
                        <HintText
                            size="small"
                            type="error"
                            text={t('accountExceedsLimit')}
                        />
                    )
                return ValidateService.validateEmail(value)
                    ? Promise.resolve()
                    : Promise.reject(
                          <HintText
                              size="small"
                              type="error"
                              text={t('invalidEmailFormat')}
                          />
                      )
            },
        },
        website: {
            messageRequired: t('pleaseEnterWebsite'),
            isInvalid: (value: string) => {
                if (!ValidateService.validateLength(value, 0, 2000))
                    return Promise.reject(
                        <HintText
                            size="small"
                            type="error"
                            text={t('websiteExceedsLimit')}
                        />
                    )
                return ValidateService.validateURL(value)
                    ? Promise.resolve()
                    : Promise.reject(
                          <HintText
                              size="small"
                              type="error"
                              text={t('invalidWebsiteFormat')}
                          />
                      )
            },
        },
        search: {
            messageRequired: t('pleaseEnterWebsite'),
            isInvalid: (value: string) => {
                return ValidateService.validateLength(value, 0, 2000)
                    ? Promise.resolve()
                    : Promise.reject(
                          <HintText
                              size="small"
                              type="error"
                              text={t('searchExceedsLimit')}
                          />
                      )
            },
        },
    }

    return (
        <Form.Item
            name={name}
            className={classNameFormItem}
            label={label}
            rules={[
                {
                    required,
                    message: (
                        <HintText
                            size="small"
                            type="error"
                            text={
                                requiredMessage || rules[type]?.messageRequired
                            }
                        />
                    ),
                },
                {
                    validator: async (_, value) => {
                        if (disabledOldRule) return Promise.resolve()
                        if (!value) return Promise.resolve()
                        const isInvalid = rules[type].isInvalid
                        if (typeof isInvalid === 'function') {
                            return isInvalid(value)
                        } else {
                            return isInvalid
                                ? Promise.resolve()
                                : Promise.reject(
                                      <HintText
                                          size="small"
                                          type="error"
                                          text={''}
                                      />
                                  )
                        }
                    },
                },
                ...(newRules || []),
            ]}
        >
            {type === 'password' ? (
                <Input
                    type={showPassword ? 'text' : 'password'}
                    className={classNameInput}
                    suffix={
                        type === 'password' && showPassword ? (
                            <VscEye
                                onClick={() => setShowPassword(false)}
                                className={styles.eye_icon}
                            />
                        ) : (
                            <VscEyeClosed
                                onClick={() => setShowPassword(true)}
                                className={styles.eye_icon}
                            />
                        )
                    }
                    {...rest}
                />
            ) : (
                <Input className={classNameInput} type={typeInput} {...rest} />
            )}
        </Form.Item>
    )
}

export default InputFormItem
