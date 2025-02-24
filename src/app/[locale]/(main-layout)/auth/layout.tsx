import type { PropsWithChildren } from 'react'
import GuestGuard from '@/components/layout/auth/GuestGuard'

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    return <GuestGuard>{children}</GuestGuard>
}
export default Layout
