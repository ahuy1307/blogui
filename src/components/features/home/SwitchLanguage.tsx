// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-17 21:52:06"
//

'use client'
import { Dropdown, type MenuProps } from 'antd'
// import styles from './Header.module.scss'
import { MdOutlineLanguage } from 'react-icons/md'
import { FaAngleDown } from 'react-icons/fa'
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

    const languageItems: MenuProps['items'] = locales.map((it) => {
        return {
            label: (
                <Link
                    href={`${pathName}?${queryParams.toString()}`}
                    className="text-base"
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
            <div className="flex items-center gap-2 font-bold border border-gray-300 rounded-lg p-2">
                <MdOutlineLanguage size={20} />
                <span className="text-base">{locale.toUpperCase()}</span>
                <FaAngleDown size={20} />
            </div>
        </Dropdown>
    )
}
export default SwitchLanguage
