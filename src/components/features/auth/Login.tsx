// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-15 22:15:33"
//

'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import Logo from '../home/Logo'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GoogleLoginButton from '@/hooks/useGoogleLogin'
import { Link, useRouter } from '@/navigation'
import { Form, Checkbox, ConfigProvider } from 'antd'
import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import Button from '@/components/ui/Button/Button'
import { FacebookIcon } from '../../../../icon'

const Login = () => {
    const t = useTranslations('auth.Login')
    const clientId = `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`
    const router = useRouter()

    const handleGoogleLogin = () => {}
    const handleFacebookLogin = () => {}

    return (
        <div className="flex justify-between items-center relative">
            <div
                className="absolute top-0 left-0 p-10"
                onClick={() => router.push('/')}
            >
                <Logo />
            </div>
            <div className="flex-1">
                <div className="w-[500px] mx-auto">
                    <div className="flex flex-col items-center gap-4">
                        <p className="font-bold text-3xl">
                            {t('loginYourAccount')}
                        </p>
                        <div className="flex gap-6">
                            <GoogleOAuthProvider clientId={clientId}>
                                <GoogleLoginButton
                                    callback={handleGoogleLogin}
                                    text={t('loginWithGoogle')}
                                />
                            </GoogleOAuthProvider>
                            <Button
                                onClick={handleFacebookLogin}
                                size="very_large"
                                type="white_secondary"
                                icon={<FacebookIcon />}
                                style={{
                                    border: '1px solid var(--text-color-hyperlink-auth)',
                                }}
                            >
                                {t('loginWithFacebook')}
                            </Button>
                        </div>
                        <div className="relative flex justify-center w-full">
                            <span className="w-full h-[2px] bg-[var(--border-color-default)] absolute top-2"></span>
                            <p className="bg-white inline-block px-4 z-10 relative right-2">
                                {t('or')}
                            </p>
                        </div>
                    </div>
                    <Form className="mt-6">
                        <InputFormItem
                            required
                            placeholder={t('emailPlaceholder')}
                            name="email"
                            type="email"
                        />
                        <InputFormItem
                            required
                            placeholder={t('passwordPlaceholder')}
                            name="password"
                            type="password"
                        />
                        <div className="flex justify-between">
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Checkbox: {
                                            colorPrimary:
                                                'var(--text-color-brand)',
                                            colorPrimaryHover:
                                                'var(--text-color-brand)',
                                            colorBorder:
                                                'var(--border-color-gray-two)',
                                        },
                                    },
                                }}
                            >
                                <Form.Item
                                    name="isRemember"
                                    valuePropName="checked"
                                >
                                    <Checkbox className="">
                                        {t('rememberLoginInfo')}
                                    </Checkbox>
                                </Form.Item>
                            </ConfigProvider>
                            <Link
                                href={'/'}
                                className="font-bold text-[var(--text-color-hyperlink-auth)] relative top-[4px]"
                            >
                                {t('forgotPassword')}{' '}
                            </Link>
                        </div>
                        <Form.Item>
                            <Button
                                htmlType="submit"
                                type="primary"
                                shape="square"
                                style={{ width: '100%' }}
                            >
                                {t('login')}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <p className="text-center mt-6">
                    {t('dontHaveAccount')}{' '}
                    <Link
                        href={'/auth/register'}
                        className="font-bold text-[var(--text-color-hyperlink-auth)] ml-1"
                    >
                        {t('register')}
                    </Link>
                </p>
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

export default Login
