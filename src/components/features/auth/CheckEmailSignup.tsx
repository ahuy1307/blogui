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
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/navigation'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useMutation } from '@tanstack/react-query'
import HintText from '@/components/ui/HintText/HintText'
import { Spin } from 'antd'

import Logo from '../home/Logo'

const CheckEmailSignup = () => {
    const email = useSearchParams().get('email')
    const type = useSearchParams().get('type')
    const t = useTranslations('auth.CheckEmailSignup')
    const router = useRouter()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const { mutate: resendEmailMutation, isPending } = useMutation({
        mutationFn: authenticationService.resendEmail,
        onSuccess: (res: any) => {
            setSuccess(res.data.message)
            setError('')
        },
        onError: (error: any) => {
            setSuccess('')
            setError(
                error.response.data.errors.other ||
                    error.response.data.errors.email
            )
        },
    })

    const resendEmailHandler = () => {
        if (email && type) resendEmailMutation({ email: email, type: type })
        else setError(t('failedToCheckEmail'))
    }

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
                        <div className="w-full max-w-[600px] mx-auto flex flex-col gap-6 bg-gray-100 p-4 rounded-2xl">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div className="w-full max-w-[600px] mx-auto flex flex-col gap-4 sm:gap-6 bg-gray-100 p-4 sm:p-6 rounded-2xl">
                            <span className="font-bold text-xl sm:text-2xl">
                                {t('checkYourEmail')}
                            </span>
                            <p className="text-sm sm:text-base">
                                {t('weSentEmail')}{' '}
                                <span className="font-bold">{email}</span>
                                {'.'}
                            </p>
                            <p className="text-sm sm:text-base">
                                {type === 'signup'
                                    ? t('pleaseCheckVerifyEmail')
                                    : t('pleaseCheckForgotPassword')}
                            </p>
                            <p className="text-sm sm:text-base">
                                {t('checkSpamFolder')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm sm:text-base">
                                <p
                                    className="font-bold text-[var(--text-color-hyperlink-auth)] cursor-pointer"
                                    onClick={resendEmailHandler}
                                >
                                    {type === 'signup'
                                        ? t('resendVerifyEmail')
                                        : t('resendForgotPasswordEmail')}
                                </p>
                                <p className="hidden sm:block">{t('or')}</p>
                                <Link
                                    href={
                                        type === 'signup'
                                            ? '/auth/register'
                                            : '/auth/forgot-password'
                                    }
                                    className="font-bold text-[var(--text-color-hyperlink-auth)]"
                                >
                                    {t('enterDifferentEmail')}
                                </Link>
                            </div>
                            {error != '' && (
                                <HintText
                                    size="large"
                                    type="error"
                                    text={error}
                                />
                            )}
                            {success != '' && (
                                <HintText
                                    size="large"
                                    type="success"
                                    text={success}
                                />
                            )}
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
        </div>
    )
}

export default CheckEmailSignup
