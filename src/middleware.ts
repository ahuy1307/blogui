import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl

    if (pathname.startsWith('/vi')) {
        const newUrl = new URL(pathname.replace(/^\/vi/, '/') + search, req.url)
        return NextResponse.redirect(newUrl, 308)
    }

    return intlMiddleware(req)
}

export const config = {
    matcher: ['/', '/(vi|en)/:path*'], // Match all paths
}
