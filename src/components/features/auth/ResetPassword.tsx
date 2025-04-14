// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-16 12:35:57"
//

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/navigation'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useMutation } from '@tanstack/react-query'
import { Spin, Form } from 'antd'
import { useSearchParams } from 'next/navigation'

import Button from '@/components/ui/Button/Button'
import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import Alert from '@/components/ui/Alert/Alert'
import Logo from '../home/Logo'
import InputPassword from '@/components/ui/InputPassword/InputPassword'
import HintText from '@/components/ui/HintText/HintText'
import { NAVIGATION_PATHS } from '@/constants/constants'
import { ValidateService } from '@/core/services/Validate.service'
import { message } from 'antd'

const ResetPassword = () => {
    const t = useTranslations('auth.ResetPassword')
    const email = useSearchParams().get('email')
    const token = useSearchParams().get('token')
    const router = useRouter()
    const [error, setError] = useState('')

    const { mutate: resetPasswordMutation, isPending: isPendingResetPassword } =
        useMutation({
            mutationFn: authenticationService.resetPassword,
            onSuccess: async (res: any) => {
                message.success(res.data.message)
                setTimeout(() => {
                    router.push(NAVIGATION_PATHS.HOME)
                }, 1000)
            },
            onError: (error: any) => {
                setError(
                    error.response.data.errors.other ||
                        error.response.data.errors.email
                )
            },
        })

    const {
        mutate: verifyResetPassword,
        isPending: isPendingVerifyResetPassword,
    } = useMutation({
        mutationFn: authenticationService.verifyResetPassword,
        onSuccess: (res: any, { email }) => {},
        onError: (error: any) => {
            router.push(
                NAVIGATION_PATHS.VERIFY_EMAIL_FAILED +
                    `?email=${email}&message=${error.response.data.errors.other}`
            )
        },
    })

    const resendEmailHandler = (password: string) => {
        if (email && token)
            resetPasswordMutation({
                email: email,
                token: token,
                password: password,
            })
    }

    const onFinish = (values: any) => {
        const { password } = values
        resendEmailHandler(password)
    }

    useEffect(() => {
        if (email && token) {
            verifyResetPassword({ email: email, token: token })
        }
    }, [])

    return (
        <div className="flex justify-between items-center relative">
            <div
                className="absolute top-0 left-0 p-10"
                onClick={() => router.push('/')}
            >
                <Logo />
            </div>
            <div className="flex-1">
                {isPendingVerifyResetPassword ? (
                    <div className="w-[600px] mx-auto flex flex-col gap-6 bg-gray-100 p-4 rounded-2xl">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="w-[600px] mx-auto flex flex-col gap-6 bg-gray-100 p-6 rounded-2xl">
                        <div className="flex flex-col items-center gap-4">
                            <p className="font-bold text-3xl">
                                {t('resetPassword')}
                            </p>
                            <p className="text-center">
                                {t('resetPasswordDescription')}{' '}
                            </p>
                        </div>
                        <Form className="mt-4" onFinish={onFinish}>
                            <div className="flex justify-center pb-6"></div>
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
                                                text={t('pleaseEnterPassword')}
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
                                                getFieldValue('password') ===
                                                    value
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
                                // Display error alert
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
                                    loading={isPendingResetPassword}
                                >
                                    {t('resetPassword')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </div>
            <div className="flex-1">
                <Image
                    src="/images/register_slide.webp"
                    alt=""
                    width={500}
                    height={100}
                    className="w-full h-screen object-cover scale-90 rounded-2xl"
                />
            </div>
        </div>
    )
}

export default ResetPassword
