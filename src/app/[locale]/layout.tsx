import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import QueryClientProviderWrapper from '@/contexts/QueryClientProvider'
import AuthProvider from '@/contexts/auth/AuthContext'
import { Suspense } from 'react'
import Loading from './loading'

import '../globals.css'

export const metadata = {
    title: 'Blog Creator',
    description: 'Create your own blog with ease',
}

type Params = Promise<{ locale: string }>

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Params
}) {
    const { locale } = await params

    // Ensure the incoming `locale` is valid
    if (!routing.locales.includes(locale as 'en' | 'vi')) {
        notFound()
    }

    // Fetch messages for the current locale
    const messages = await getMessages()

    return (
        <html lang={locale} suppressHydrationWarning>
            <body>
                <Suspense fallback={<Loading />}>
                    <QueryClientProviderWrapper>
                        <NextIntlClientProvider messages={messages}>
                            <AuthProvider>{children}</AuthProvider>
                        </NextIntlClientProvider>
                    </QueryClientProviderWrapper>
                </Suspense>
            </body>
        </html>
    )
}
