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
import { Link, useRouter } from '@/navigation'
import { useSearchParams } from 'next/navigation'
import Logo from '../home/Logo'
import { NAVIGATION_PATHS } from '@/constants/constants'
import HintText from '@/components/ui/HintText/HintText'

const VerifyEmailFailed = () => {
    const t = useTranslations('auth.VerifyEmailFailed')
    const email = useSearchParams().get('email')
    const errorMessage = useSearchParams().get('message')
    const router = useRouter()

    return (
        <div className="flex flex-col md:flex-row justify-between items-center relative min-h-screen">
            <div
                className="absolute top-0 left-0 p-4 md:p-10 z-10 cursor-pointer"
                onClick={() => router.push('/')}
            >
                <Logo />
            </div>
            <div className="flex items-center h-screen w-full">
                <div className="flex-1 w-full px-4 md:px-0 py-20 md:py-0 z-0">
                    <div className="w-full max-w-[500px] mx-auto mt-10 md:mt-0">
                        <p>
                            <span className="text-base md:text-lg font-bold">
                                {t('verifyEmailFailed')} {email}
                            </span>
                        </p>
                        <div className="py-2">
                            <HintText
                                text={errorMessage}
                                type="error"
                                size="large"
                            />
                        </div>
                        <p className="mt-6 text-sm md:text-base">
                            {t('contactAdmin')}
                            <Link
                                href={'/auth/login'}
                                className="font-bold text-[var(--text-color-hyperlink-auth)] ml-1"
                            >
                                {t('forgotPassword')}
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="flex-1 w-full hidden md:block">
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

export default VerifyEmailFailed
