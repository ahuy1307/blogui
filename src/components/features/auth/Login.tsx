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
import { Form, Checkbox, ConfigProvider, message } from 'antd'
import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import Button from '@/components/ui/Button/Button'
import { FacebookIcon } from '../../../../icon'
import { useMutation } from '@tanstack/react-query'
import { localStorageService } from '@/core/services/LocalStorage.service'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import useFacebookLogin from '@/hooks/useFacebookLogin'
import { useAuth } from '@/contexts/auth/AuthContext'
import { signIn } from '@/contexts/auth/reducers'

const Login = () => {
    const t = useTranslations('auth.Login')
    const { dispatch } = useAuth()
    const clientId = `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`
    const router = useRouter()

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            dispatch(signIn({ isAuthenticated: true, user: userInformation }))
        } catch (error) {}
    }

    const { mutate: googleLoginMutation, isPending: isPendingGoogleLogin } =
        useMutation({
            mutationFn: authenticationService.signupSocial,
            onSuccess: async (res: any) => {
                const { email, access } = res.data
                localStorageService.setToken(access)
                localStorageService.setRefreshToken(res.data.refresh)
                await handleSignIn()
                message.success(t('loginSuccess'))
            },
            onError: (err: any) => {
                console.error('Google Login Failed:', err)
            },
        })

    const handleGoogleLogin = ({
        success,
        accessToken,
        error,
    }: {
        success: boolean
        accessToken?: string
        error?: any
    }) => {
        if (success && accessToken) {
            googleLoginMutation({
                access_token: accessToken,
                type: 'google',
            })
        } else {
            console.error('Google Login Failed:', error)
        }
    }

    const { mutate: facebookLoginMutation, isPending: isPendingFacebookLogin } =
        useMutation({
            mutationFn: authenticationService.signupSocial,
            onSuccess: async (res: any) => {
                const { email, access } = res.data
                localStorageService.setToken(access)
                localStorageService.setRefreshToken(res.data.refresh)
                await handleSignIn()
                message.success(t('loginSuccess'))
            },
            onError: (error: any) => {},
        })

    const handleFacebookLogin = useFacebookLogin(
        `${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}`,
        (response: any) => {
            if (response.status === 'connected') {
                const { accessToken } = response.authResponse
                facebookLoginMutation({
                    access_token: accessToken,
                    type: 'facebook',
                })
            } else {
                console.log('User cancelled login or did not fully authorize.')
            }
        }
    )
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
                                    name="is_remember"
                                    valuePropName="checked"
                                >
                                    <Checkbox className="">
                                        {t('rememberLoginInfo')}
                                    </Checkbox>
                                </Form.Item>
                            </ConfigProvider>
                            <Link
                                href={'/auth/forgot-password'}
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
