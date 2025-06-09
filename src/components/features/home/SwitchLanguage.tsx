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
import { Link, usePathname, useRouter } from '@/navigation'
import { AppConfig } from '@/core/config/appConfig'
import { useSearchParams } from 'next/navigation'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { localStorageService } from '@/core/services/LocalStorage.service'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth/AuthContext'

const { locales } = AppConfig
const SwitchLanguage: React.FC = () => {
    const locale = useLocale()
    const router = useRouter()
    const t = useTranslations()
    const pathName = usePathname()
    const queryParams = useSearchParams()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [selectedLanguage, setSelectedLanguage] = useState<string>(locale)
    const { user } = useAuth()

    // Apply user's language preference when component mounts or user changes
    useEffect(() => {
        // Only update if user exists and has a language preference
        if (user?.ngonNgu && locales.includes(user.ngonNgu)) {
            // Set in state for UI
            setSelectedLanguage(user.ngonNgu)

            // Only set in localStorage if different from current to avoid unnecessary changes
            if (localStorage.getItem('language') !== user.ngonNgu) {
                localStorage.setItem('language', user.ngonNgu)
            }

            // Redirect to user's preferred language if different from current locale
            if (user.ngonNgu !== locale) {
                const queryString = queryParams.toString()
                const url = queryString
                    ? `${pathName}?${queryString}`
                    : pathName

                // Use setTimeout to delay the navigation to prevent any potential race conditions
                setTimeout(() => {
                    router.replace(url, { locale: user.ngonNgu })
                }, 0)
            }
        }
    }, [user, locale, pathName, queryParams])

    const handleLanguageChange = async (language: string) => {
        try {
            setIsLoading(true)
            // Update state for immediate UI feedback
            setSelectedLanguage(language)
            localStorage.setItem('language', language)

            // Only call API if user is logged in
            const token = localStorageService.getToken()
            if (token) {
                await authenticationService.setInformationUser({
                    ngonNgu: language,
                } as IInforUser)
            }

            // Get query string
            const queryString = queryParams.toString()

            // Use the replace function for proper locale switching
            // This handles the default locale correctly
            router.replace(
                queryString ? `${pathName}?${queryString}` : pathName,
                { locale: language }
            )
        } catch (error) {
            console.error('Failed to update language preference:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const languageItems: MenuProps['items'] = locales.map((it) => {
        return {
            label: (
                <div
                    className="text-base cursor-pointer"
                    onClick={() => handleLanguageChange(it)}
                >
                    {t(`header.locales.${it}`)}
                </div>
            ),
            key: it,
        }
    })

    return (
        <Dropdown
            menu={{
                items: languageItems,
                selectable: true,
                selectedKeys: [selectedLanguage],
            }}
            placement="bottomRight"
            disabled={isLoading}
        >
            <div className="flex items-center gap-2 font-bold border border-gray-300 rounded-lg p-2 cursor-pointer">
                <MdOutlineLanguage size={20} />
                <span className="text-base">
                    {selectedLanguage.toUpperCase()}
                </span>
                <FaAngleDown size={20} />
            </div>
        </Dropdown>
    )
}
export default SwitchLanguage
