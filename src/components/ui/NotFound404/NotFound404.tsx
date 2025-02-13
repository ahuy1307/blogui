// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
'use client'
import React from 'react'
import Button from '../Button/Button'
import styles from './NotFound404.module.scss'
import { useRouter } from '@/navigation'
import { NAVIGATION_PATHS } from '@/constants/constants'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const NotFound404 = () => {
    const t = useTranslations('not_found.notFound404')
    const router = useRouter()
    const handleClickButton = () => {
        router.push(NAVIGATION_PATHS.HOME)
    }
    return (
        <>
            <div className={styles.container}>
                <div className={styles.content_wrapper}>
                    <div className={styles.image_wrapper}>
                        <Image
                            width={400}
                            height={240}
                            src="/notfound404.webp"
                            alt=""
                            className={styles.image}
                        />
                    </div>
                    <div className={styles.text_wrapper}>
                        <p
                            data-testid="not-found-404-main-text"
                            className={styles.text_main}
                        >
                            {t('mainText')}
                        </p>
                        <p
                            data-testid="not-found-404-sub-text"
                            className={styles.text_sub}
                        >
                            {t('subText')}
                        </p>
                    </div>
                    <div className={styles.button_wrapper}>
                        <Button
                            data-testid="not-found-404-return-home-button"
                            onClick={handleClickButton}
                            type="primary"
                            shape="square"
                            className={styles.return_btn}
                        >
                            {t('returnHomeBtn')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NotFound404
