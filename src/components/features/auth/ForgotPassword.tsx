// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-16 12:35:57"
//

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/navigation'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useMutation } from '@tanstack/react-query'
import { Spin, Form } from 'antd'

import Button from '@/components/ui/Button/Button'
import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import Alert from '@/components/ui/Alert/Alert'
import Logo from '../home/Logo'
import { NAVIGATION_PATHS } from '@/constants/constants'

const ForgotPassword = () => {
    const t = useTranslations('auth.ForgotPassword')
    const router = useRouter()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const { mutate: forgotPasswordMutation, isPending } = useMutation({
        mutationFn: authenticationService.forgotPassword,
        onSuccess: (res: any, { email }) => {
            setError('')
            router.push(
                `${NAVIGATION_PATHS.CHECK_EMAIL_SIGNUP}?email=${email.replace('+', '%2B')}&type=reset`
            )
        },
        onError: (error: any) => {
            setError(
                error.response.data.errors.other ||
                    error.response.data.errors.email
            )
        },
    })

    const resendEmailHandler = (email: string) => {
        forgotPasswordMutation({ email: email, type: 'reset' })
    }

    const onFinish = (values: any) => {
        const { email } = values
        resendEmailHandler(email)
    }

    return (
        <div className="flex justify-between items-center relative">
            <div
                className="absolute top-0 left-0 p-10"
                onClick={() => router.push('/')}
            >
                <Logo />
            </div>
            <div className="flex items-center h-screen w-full">
                <div className="flex-1">
                    {isPending ? (
                        <div className="w-[600px] mx-auto flex flex-col gap-6 bg-gray-100 p-4 rounded-2xl">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div className="w-[500px] mx-auto flex flex-col gap-6 bg-gray-100 p-6 rounded-2xl">
                            <div className="flex flex-col items-center gap-4">
                                <p className="font-bold text-3xl">
                                    {t('forgotPassword')}
                                </p>
                                <p className="text-[var(--text-color-secondary)'] text-center">
                                    {t('forgotPasswordDescription')}
                                </p>
                            </div>
                            <Form className="mt-2" onFinish={onFinish}>
                                <Spin
                                    size="large"
                                    spinning={isPending}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        paddingBottom: '16px',
                                    }}
                                />
                                <InputFormItem
                                    required
                                    placeholder={t('emailPlaceholder')}
                                    name="email"
                                    type="email"
                                    onChange={() => setError('')}
                                />
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
                                        style={{
                                            width: '100%',
                                            marginTop: '16px',
                                        }}
                                    >
                                        {t('forgotPassword')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                </div>
                <div className="flex-1 hidden md:block">
                    <Image
                        src="/images/register_slide.webp"
                        alt=""
                        width={500}
                        height={100}
                        className="w-full h-screen object-cover scale-90 rounded-2xl"
                    />
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
