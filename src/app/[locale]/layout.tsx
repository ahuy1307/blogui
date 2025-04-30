import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import QueryClientProviderWrapper from '@/contexts/QueryClientProvider'
import AuthProvider from '@/contexts/auth/AuthContext'
import { Suspense } from 'react'
import Loading from './loading'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleTagManager } from '@next/third-parties/google'

import '../globals.css'

export const metadata = {
    title: 'Suyndy Blog',
    description: 'Create your own blog with ease',
    icons: {
        icon: [
            {
                media: '(prefers-color-scheme: light)',
                url: '/images/logo-icon.png',
                href: '/images/logo-icon.png',
            },
            {
                media: '(prefers-color-scheme: dark)',
                url: '/images/logo-icon.png',
                href: '/images/logo-icon.png',
            },
        ],
    },
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

    const GTM_ID =
        process.env.NEXT_PUBLIC_GOOGLE_TAGS_MANAGEMENT || 'GTM-WXP96QZP'

    const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || 'G-DL3LGNPR30'

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                {/* <link rel="icon" href="/logo.png" sizes="any" /> */}
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                ></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}');
                `,
                    }}
                />
            </head>
            <GoogleTagManager gtmId={GTM_ID} />

            <body>
                <Suspense fallback={<Loading />}>
                    <QueryClientProviderWrapper>
                        <NextIntlClientProvider messages={messages}>
                            <AuthProvider>{children}</AuthProvider>
                        </NextIntlClientProvider>
                    </QueryClientProviderWrapper>
                </Suspense>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
