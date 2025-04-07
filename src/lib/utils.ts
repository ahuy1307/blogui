import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const generateId = () =>
    `section-${Date.now()}-${Math.floor(Math.random() * 1000)}`

export const bytesToMB = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const readingTimeTranslations = {
    en: {
        minute: 'min',
        read: 'read',
    },
    vi: {
        minute: 'phút',
        read: 'đọc',
    },
} as const

export const formatReadingTime = (
    seconds: number,
    locale: 'en' | 'vi' = 'en'
): string => {
    if (!seconds) return '1 min read'
    const minutes = Math.ceil(seconds / 60)
    const translation = readingTimeTranslations[locale]

    return `${minutes} ${translation.minute} ${translation.read}`
}
