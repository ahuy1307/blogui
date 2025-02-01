// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:38:06"
//

'use client'
import { Dropdown, type MenuProps } from 'antd'
import styles from './Header.module.scss'
import LanguageIcon from 'public/icon/language-icon.svg'
import ChevronDown from 'public/icon/chevron-down.svg'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/navigation'
import { AppConfig } from '@/core/config/appConfig'
import { useSearchParams } from 'next/navigation'

const { locales } = AppConfig
const SwitchLanguage: React.FC = () => {
    const locale = useLocale()
    const t = useTranslations()
    const pathName = usePathname()
    const queryParams = useSearchParams()

    const languageItems: MenuProps['items'] = locales.map((it: any) => {
        return {
            label: (
                <Link
                    href={`${pathName}?${queryParams.toString()}`}
                    onClick={() => {
                        localStorage.setItem('language', it)
                    }}
                    locale={it}
                >
                    {t(`header.locales.${it}`)}
                </Link>
            ),
            key: it,
        }
    })
    return (
        <Dropdown
            menu={{
                items: languageItems,
                selectable: true,
                selectedKeys: [locale],
            }}
            placement="bottomRight"
        >
            <div className={styles.language_dropdown}>
                <LanguageIcon />
                {locale.toUpperCase()}
                <ChevronDown />
            </div>
        </Dropdown>
    )
}
export default SwitchLanguage
