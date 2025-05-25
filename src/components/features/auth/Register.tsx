// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-15 22:15:33"
//

'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Link, useRouter } from '@/navigation'
import { IoCloseCircleSharp } from 'react-icons/io5'
import { Form, Checkbox, ConfigProvider, Spin, message } from 'antd'

import Logo from '../home/Logo'
import GoogleLoginButton from '@/hooks/useGoogleLogin'
import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import Button from '@/components/ui/Button/Button'
import { FacebookIcon } from '../../../../icon'
import { NAVIGATION_PATHS } from '@/constants/constants'
import Alert from '@/components/ui/Alert/Alert'
import { useMutation } from '@tanstack/react-query'
import { localStorageService } from '@/core/services/LocalStorage.service'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import useFacebookLogin from '@/hooks/useFacebookLogin'
import { useAuth } from '@/contexts/auth/AuthContext'
import { signIn } from '@/contexts/auth/reducers'

const Register = () => {
    const t = useTranslations('auth.Register')
    const { dispatch } = useAuth()
    const clientId = `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`
    const [error, setError] = useState('')
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

    const { mutate: signUpEmailMutation, isPending: isPendingSignUpEmail } =
        useMutation({
            mutationFn: authenticationService.signupEmail,
            onSuccess: async (res, { email }) => {
                router.push(
                    `${NAVIGATION_PATHS.CHECK_EMAIL_SIGNUP}?email=${email.replace('+', '%2B')}&type=signup`
                )
            },
            onError: (error: any) => {
                setError(
                    error.response.data.errors.other ||
                        error.response.data.errors.email
                )
            },
        })

    const onFinish = (values: any) => {
        const { email, ho, ten } = values
        signUpEmailMutation({ email, ho, ten })
    }

    return (
        <div className="flex flex-col gap-16 md:flex-row justify-between items-center relative min-h-screen">
            <div
                className="absolute top-0 left-0 p-4 md:p-10 z-10"
                onClick={() => router.push('/')}
            >
                <Logo />
            </div>
            <div className="flex-1 w-full px-4 py-8 md:py-0 md:px-0 max-w-full md:max-w-none">
                <div className="w-full max-w-[450px] mx-auto px-4 sm:px-0">
                    <div className="flex flex-col items-center gap-4 mt-16 md:mt-0">
                        <p className="font-bold text-2xl md:text-3xl text-center">
                            {t('createYourAccount')}
                        </p>
                        <p className="text-[var(--text-color-secondary)] text-center">
                            {t('letGetStarted')}
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
                    <Form className="mt-6" onFinish={onFinish}>
                        <div className="flex justify-center pb-6">
                            <Spin
                                size="large"
                                spinning={isPendingSignUpEmail}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-6">
                            <InputFormItem
                                required
                                placeholder={t('firstNamePlaceholder')}
                                name="ho"
                                type="first_name"
                                onChange={() => setError('')}
                                disabled={isPendingSignUpEmail}
                                className="w-full"
                            />
                            <InputFormItem
                                required
                                placeholder={t('lastNamePlaceholder')}
                                name="ten"
                                type="last_name"
                                onChange={() => setError('')}
                                disabled={isPendingSignUpEmail}
                                className="w-full"
                            />
                        </div>
                        <InputFormItem
                            required
                            placeholder={t('emailPlaceholder')}
                            name="email"
                            type="email"
                            onChange={() => setError('')}
                            disabled={isPendingSignUpEmail}
                        />
                        <ConfigProvider
                            theme={{
                                components: {
                                    Checkbox: {
                                        colorPrimary: 'var(--text-color-brand)',
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
                                    {t('agreePrivacyPolicy')}{' '}
                                    <strong>{t('termsOfService')}</strong>{' '}
                                    {t('and')}{' '}
                                    <strong>{t('privacyPolicy')}</strong>
                                </Checkbox>
                            </Form.Item>
                        </ConfigProvider>
                        {error && (
                            <Alert
                                showIcon={true}
                                className="mb-4"
                                icon={
                                    <IoCloseCircleSharp
                                        size={20}
                                        color="var(--text-color-red)"
                                    />
                                }
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
                                disabled={isPendingSignUpEmail}
                            >
                                {t('register')}
                            </Button>
                        </Form.Item>
                    </Form>
                    <p className="text-center mt-6">
                        {t('alreadyHaveAccount')}{' '}
                        <Link
                            href={'/auth/login'}
                            className="font-bold text-[var(--text-color-hyperlink-auth)] ml-1"
                        >
                            {t('login')}
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

export default Register
