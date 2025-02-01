// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
'use client'
import { localStorageService } from '@/core/services/LocalStorage.service'
import React, { useEffect, useState } from 'react'
import styles from './CookieConsent.module.scss'
import Button from '../Button/Button'
import { Link } from '@/navigation'
import { NAVIGATION_PATHS } from '@/constants/constants'
import { useTranslations } from 'next-intl'

const CookieConsent = () => {
    const [isConsentGiven, setIsConsentGiven] = useState(false)
    const t = useTranslations('components_ui.cookieConsent')
    useEffect(() => {
        const consent = localStorageService.getItem('cookieConsent')
        if (consent) {
            setIsConsentGiven(true)
        }
    }, [])

    const handleAcceptCookies = () => {
        localStorageService.setItem('cookieConsent', true)
        setIsConsentGiven(true)
    }

    if (isConsentGiven) {
        return null
    }
    return (
        <div className={styles.cookie_consent}>
            <div className={styles.content}>
                <div className={styles.main_content}>
                    <div className={styles.body}>
                        <p className={styles.title}>{t('title')}</p>
                        <p className={styles.desc}>
                            {t('description')}{' '}
                            <Link
                                target="_blank"
                                className={styles.link}
                                href={NAVIGATION_PATHS.PRIVACY}
                            >
                                {t('privacy')}
                            </Link>{' '}
                            {t('our')}
                        </p>
                    </div>
                    <Button
                        data-testid="cookie-consent-button"
                        onClick={handleAcceptCookies}
                        className={styles.button}
                        type="primary"
                        size="large"
                    >
                        {t('buttonContent')}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CookieConsent
