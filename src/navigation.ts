import { createNavigation } from 'next-intl/navigation' // Assuming createNavigation is the new method
import { AppConfig } from '@/core/config/appConfig'
const { locales } = AppConfig

export const { Link, redirect, usePathname, useRouter } = createNavigation({
    locales /* ... */,
})
