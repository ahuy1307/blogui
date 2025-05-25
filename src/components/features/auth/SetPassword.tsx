// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-16 12:23:05"
//

'use client'

import React, { use } from 'react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/navigation'
import { useMutation } from '@tanstack/react-query'
import { NAVIGATION_PATHS } from '@/constants/constants'
import { Form, Checkbox, ConfigProvider, Spin } from 'antd'

import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { localStorageService } from '@/core/services/LocalStorage.service'
import HintText from '@/components/ui/HintText/HintText'
import Button from '@/components/ui/Button/Button'
import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import Logo from '../home/Logo'
import InputPassword from '@/components/ui/InputPassword/InputPassword'
import { ValidateService } from '@/core/services/Validate.service'
import Alert from '@/components/ui/Alert/Alert'
import { useAuth } from '@/contexts/auth/AuthContext'
import { signIn } from '@/contexts/auth/reducers'

const SetPassword = () => {
    const email = useSearchParams().get('email')
    const token = useSearchParams().get('token')
    const t = useTranslations('auth.SetPassword')
    const [error, setError] = useState('')
    const router = useRouter()
    const { dispatch } = useAuth()

    const { mutate: verifySignupEmail, isPending } = useMutation({
        mutationFn: authenticationService.verifySignupEmail,
        onSuccess: (res: any) => {},
        onError: (error: any) => {
            router.push(
                NAVIGATION_PATHS.VERIFY_EMAIL_FAILED +
                    `?email=${email}&message=${error.response.data.errors.other}`
            )
        },
    })

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            await dispatch(
                signIn({ isAuthenticated: true, user: userInformation })
            )
            setTimeout(() => {
                router.push(`${NAVIGATION_PATHS.HOME}`)
            }, 300)
        } catch (error) {
            console.error('Error fetching user information:', error)
        }
    }

    const { mutate: setPasswordMutation, isPending: isPendingSetPassword } =
        useMutation({
            mutationFn: authenticationService.setPassword,
            onSuccess: async (res: any) => {
                localStorageService.setToken(res.data.access)
                localStorageService.setRefreshToken(res.data.refresh)
                await handleSignIn()
            },
            onError: (error: any) => {
                setError(
                    error.response.data.errors.other ||
                        error.response.data.errors.email
                )
            },
        })

    const onFinish = (values: any) => {
        if (email && token) {
            setPasswordMutation({
                email: email,
                token: token,
                password: values.password,
            })
        }
    }

    useEffect(() => {
        if (email && token) verifySignupEmail({ email: email, token: token })
    }, [])

    return (
        <div className="flex flex-col md:flex-row justify-between items-center relative min-h-screen">
            <div
                className="absolute top-0 left-0 p-4 sm:p-6 md:p-10 z-10"
                onClick={() => router.push('/')}
            >
                <Logo />
            </div>
            <div className="flex items-center h-screen w-full">
                <div className="flex-1 w-full px-4 py-16 md:py-0 md:px-0 z-0">
                    {isPending ? (
                        <div className="w-full max-w-[600px] mx-auto flex flex-col gap-6 p-4 rounded-2xl">
                            <Spin size="large" />
                            <p className="text-center text-xl sm:text-2xl font-bold italic">
                                {t('verifyingEmailLoading')}
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-[600px] mx-auto flex flex-col gap-4 sm:gap-6 p-4 rounded-2xl">
                            <p className="text-center text-xl sm:text-2xl font-bold">
                                {t('setPasswordTitle')}{' '}
                                <span className="text-[var(--text-color-brand)] break-words">
                                    {email}
                                </span>
                            </p>
                            <Form className="mt-4 w-full" onFinish={onFinish}>
                                <div className="flex justify-center pb-4 sm:pb-6"></div>
                                <InputFormItem
                                    required
                                    placeholder={t('passwordPlaceholder')}
                                    name="password"
                                    type="password"
                                    onChange={() => setError('')}
                                />
                                <Form.Item
                                    name="repassword"
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <HintText
                                                    size="small"
                                                    type="error"
                                                    text={t(
                                                        'pleaseEnterPassword'
                                                    )}
                                                />
                                            ),
                                        },
                                        ({ getFieldValue }: any) => ({
                                            validator(_: any, value: any) {
                                                if (!value) {
                                                    return Promise.resolve()
                                                }
                                                if (
                                                    !ValidateService.validateMaxLength(
                                                        value,
                                                        128
                                                    )
                                                )
                                                    return Promise.reject(
                                                        <HintText
                                                            type="error"
                                                            text={t(
                                                                'passwordExceedsLimit'
                                                            )}
                                                        />
                                                    )
                                                if (
                                                    !value ||
                                                    getFieldValue(
                                                        'password'
                                                    ) === value
                                                ) {
                                                    return Promise.resolve()
                                                }
                                                return Promise.reject(
                                                    <HintText
                                                        size="small"
                                                        type="error"
                                                        text={t(
                                                            'passwordMismatchMessage'
                                                        )}
                                                    />
                                                )
                                            },
                                        }),
                                    ]}
                                >
                                    <InputPassword
                                        placeholder={t(
                                            'reenterPasswordPlaceholder'
                                        )}
                                        size="large"
                                    />
                                </Form.Item>
                                {error && (
                                    <Alert
                                        showIcon={true}
                                        className="mb-4"
                                        type="error"
                                        message={error}
                                    />
                                )}
                                <Form.Item>
                                    <Button
                                        htmlType="submit"
                                        type="primary"
                                        shape="square"
                                        style={{ width: '100%' }}
                                        loading={isPendingSetPassword}
                                    >
                                        {t('setPassword')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                </div>
                <div className="hidden md:block flex-1">
                    <Image
                        src="/images/register_slide.webp"
                        alt=""
                        width={500}
                        height={100}
                        className="w-full h-screen object-cover scale-90 rounded-2xl"
                        priority
                    />
                </div>
            </div>
            {/* Mobile image displayed at bottom for smaller screens */}
            <div className="block md:hidden w-full mt-4">
                <Image
                    src="/images/register_slide.webp"
                    alt=""
                    width={400}
                    height={200}
                    className="w-full max-h-48 object-cover rounded-2xl"
                    priority
                />
            </div>
        </div>
    )
}

export default SetPassword
