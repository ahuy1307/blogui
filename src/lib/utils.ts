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
