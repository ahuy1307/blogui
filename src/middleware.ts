import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware({
    // Use the same locale configuration from routing
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    localePrefix: 'as-needed'
})

export const config = {
    // Match all pathnames except for
    // - files with extensions (e.g. /logo.png)
    // - api routes
    // - _next/static and _next/image paths
    matcher: ['/((?!api|_next|.*\\..*).*)']
}
