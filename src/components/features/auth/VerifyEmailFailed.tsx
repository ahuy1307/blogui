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
        <div className="flex justify-between items-center relative">
            <div
                className="absolute top-0 left-0 p-10"
                onClick={() => router.push('/')}
            >
                <Logo />
            </div>
            <div className="flex-1">
                <div className="w-[450px] mx-auto">
                    <p>
                        <span className="text-lg font-bold">
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
                    <p className="mt-6">
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

export default VerifyEmailFailed
