import { AppConfig } from '@/core/config/appConfig'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import dayjs from 'dayjs'

export const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL
    }

    return 'http://localhost:3000'
}

export function getUrl(pathname: string, locale: string) {
    const host = getBaseUrl()
    const { defaultLocale } = AppConfig

    return `${host}${locale === defaultLocale ? '' : '/' + locale}${pathname === '/' ? '' : pathname}`
}

export function getUrlAuthSocial(pathname: string, locale: string) {
    const { defaultLocale } = AppConfig
    const isLocaleDefault = locale === defaultLocale
    return `${isLocaleDefault ? '' : locale}${pathname === '/' ? '' : isLocaleDefault ? pathname.substring(1) : pathname}`
}

export const getI18nPath = (url: string, locale: string) => {
    if (locale === AppConfig.defaultLocale) {
        return url
    }

    return `/${locale}${url}`
}

export const convertObjectToList = <T extends object>(
    object: T
): Array<T[keyof T]> => Object.keys(object).map((key) => object[key as keyof T])

export const removeNullOrEmpty = (
    obj: Record<string, any>
): Record<string, any> => {
    const cleanedObj: Record<string, any> = {}

    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== '') {
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                cleanedObj[key] = removeNullOrEmpty(obj[key])
            } else {
                cleanedObj[key] = obj[key]
            }
        }
    }

    return cleanedObj
}

export const getFingerprint = async () => {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
}

export const getCookieValue = (name: string): string | undefined => {
    const matches = document.cookie.match(
        new RegExp(
            '(?:^|; )' +
                name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
                '=([^;]*)'
        )
    )
    return matches ? decodeURIComponent(matches[1]) : undefined
}
export const compareStrings = (valueA: string, valueB: string): boolean => {
    const normalizeString = (str: string): string => {
        return str
            .normalize('NFD') // Decompose the combined characters into base and diacritic parts
            .replace(/[\u0300-\u036f]/g, '') // Remove the diacritic marks
            .replace(/đ/g, 'd') // Replace special characters
            .replace(/Đ/g, 'd') // Replace uppercase special characters
            .toLowerCase() // Convert to lowercase
    }
    const normalizedValueA = normalizeString(valueA)
    const normalizedValueB = normalizeString(valueB)
    return normalizedValueA.includes(normalizedValueB)
}

export const getInitials = (name: string, email: string) => {
    if (!name) {
        return email.charAt(0).toUpperCase()
    }

    const parts = name.split(' ')
    const firstLetter = parts[0][0]
    const lastLetter = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return parts.length === 1
        ? firstLetter.toUpperCase()
        : `${firstLetter}${lastLetter}`.toUpperCase()
}

export const deleteParamQuery = (key: string, searchParams: any) => {
    const newParams = new URLSearchParams(searchParams.toString())

    newParams.delete(key)

    return newParams.toString()
}

export const formatFileSize = (size: number) => {
    if (size < 1024) return size + ' B'
    else if (size < 1024 ** 2) return (size / 1024).toFixed(2) + ' KB'
    else if (size < 1024 ** 3) return (size / 1024 ** 2).toFixed(2) + ' MB'
    else return (size / 1024 ** 3).toFixed(2) + ' GB'
}

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(
        value
    )
}

export const formatDuration = (days: number, t: (key: string) => string) => {
    if (days < 30) {
        return `${days} ${t('days')}`
    }

    if (days === 30) return `1 ${t('months')}`
    if (days === 90) return `3 ${t('months')}`
    if (days === 365) return `12 ${t('months')}`

    const months = Math.floor(days / 30)
    const remainingDays = days % 30

    if (remainingDays === 0) {
        return `${months} ${t('months')}`
    }

    return `${months} ${t('months')} ${remainingDays} ${t('days')}`
}

const formats = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD']
export const detectDateFormat = (dateString: any) => {
    for (const format of formats) {
        const parsedDate = dayjs(dateString, format, true)
        if (parsedDate.isValid()) {
            return format
        }
    }
    return null
}

export const DATE_FORMAT_DISPLAY = 'DD/MM/YYYY'

export function base64ToFile(
    base64: string,
    filename: string,
    action = 'update'
): any {
    if (action === 'delete') return null
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || ''
    const binaryStr = atob(arr[1])
    const len = binaryStr.length
    const uint8Array = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
        uint8Array[i] = binaryStr.charCodeAt(i)
    }

    return new File([uint8Array], filename, { type: mime })
}
