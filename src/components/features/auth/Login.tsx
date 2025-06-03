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
import Alert from '@/components/ui/Alert/Alert'
import { set } from 'lodash'

const Login = () => {
    const t = useTranslations('auth.Login')
    const { dispatch } = useAuth()
    const clientId = `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`
    const router = useRouter()
    const [form] = Form.useForm()
    const [error, setError] = React.useState<string>('')

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            dispatch(signIn({ isAuthenticated: true, user: userInformation }))
        } catch (error) {}
    }

    const { mutate: loginMutation, isPending: isLoginPending } = useMutation({
        mutationFn: authenticationService.login,
        onSuccess: async (res) => {
            const { access } = res.data
            localStorageService.setToken(access)
            await handleSignIn()
            message.success(t('loginSuccess'))
            setError('')
            router.push('/')
        },
        onError: (error: any) => {
            setError(error.response?.data?.errors.other[0] || t('loginError'))
        },
    })

    const { mutate: googleLoginMutation, isPending: isPendingGoogleLogin } =
        useMutation({
            mutationFn: authenticationService.signupSocial,
            onSuccess: async (res: any) => {
                const { email, access } = res.data
                localStorageService.setToken(access)
                // localStorageService.setRefreshToken(res.data.refresh)
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
                // localStorageService.setRefreshToken(res.data.refresh)
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

    const handleSubmit = (values: any) => {
        const { email, password, is_remember } = values
        loginMutation({
            email,
            password,
            is_remember: is_remember || false,
        })
    }

    return (
        <div className="flex flex-col gap-16 md:flex-row justify-between items-center relative min-h-screen">
            <div
                className="absolute top-0 left-0 p-4 md:p-10 z-10"
                onClick={() => router.push('/')}
            >
                <Logo />
            </div>
            <div className="flex-1 w-full py-8 md:py-0 md:px-0 max-w-full md:max-w-none pt-12">
                <div className="w-full max-w-[450px] mx-auto sm:px-0">
                    <div className="flex flex-col items-center gap-4 mt-16 md:mt-0">
                        <p className="font-bold text-2xl md:text-3xl text-center">
                            {t('loginYourAccount')}
                        </p>
                        <div className="flex flex-col xl:flex-row xl:mr-16 gap-4 sm:gap-4 w-full">
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
                                    width: '100%',
                                }}
                                className="w-full"
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
                    <Form className="mt-6" form={form} onFinish={handleSubmit}>
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
                        <div className="flex justify-between flex-wrap sm:flex-nowrap">
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
                                    <Checkbox className="text-sm md:text-base">
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
                        <div className="mb-4">
                            {error && (
                                <Alert
                                    type="error"
                                    showIcon={true}
                                    message={error}
                                />
                            )}
                        </div>
                        <Form.Item>
                            <Button
                                htmlType="submit"
                                type="primary"
                                shape="square"
                                style={{ width: '100%' }}
                                loading={isLoginPending}
                            >
                                {t('login')}
                            </Button>
                        </Form.Item>
                    </Form>
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
            </div>
            <div className="hidden lg:block flex-1">
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
