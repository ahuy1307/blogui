import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale
    const messages: { [key: string]: any } = {}

    const sections = ['header', 'not_found', 'components_ui', 'auth']

    for (const section of sections) {
        messages[section] = (
            await import(`../../messages/${section}/${locale}.json`)
        ).default
    }

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as 'en' | 'vi')) {
        locale = routing.defaultLocale
    }

    return {
        locale,
        messages: {
            ...messages,
            ...(await import(`../../messages/${locale}.json`)).default,
        },
    }
})
