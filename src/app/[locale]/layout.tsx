import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Roboto, Roboto_Mono } from 'next/font/google'
import QueryClientContext from '@/contexts/QueryClientProvider'

export const metadata = {
    title: 'Blog Creator',
    description: 'Create your own blog with ease',
}

// Define fonts
const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400', '700'], // Include weights you need
    variable: '--font-roboto', // Optional CSS variable name
    display: 'swap',
})

const robotoMono = Roboto_Mono({
    subsets: ['latin'],
    weight: ['400', '500'], // Include weights you need
    variable: '--font-roboto-mono', // Optional CSS variable name
})

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
            <body className={`${roboto.variable} ${robotoMono.variable}`}>
                <NextIntlClientProvider messages={messages}>
                    <QueryClientContext>{children}</QueryClientContext>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
