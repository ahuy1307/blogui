// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

'use client'
import { useAuth } from '@/contexts/auth/AuthContext'
import { NAVIGATION_PATHS } from '@/constants/constants'
import { useRouter } from '@/navigation'
import { FC, PropsWithChildren } from 'react'

interface RoleBasedGuardProps extends PropsWithChildren {
    accessibleRoles: (string | undefined)[]
    children: React.ReactNode
}
/**
 * Property for the custom Avatar component.
 *
 * @property {string[]} accessibleRoles - The roles that can access the page.
 */
const RoleBasedGuard: FC<RoleBasedGuardProps> = ({
    children,
    accessibleRoles,
}) => {
    const { user } = useAuth()
    const router = useRouter()
    // if (!accessibleRoles.includes(user?.accountType)) {
    //     router.push(NAVIGATION_PATHS.HOME)
    //     return null
    // }
    return <>{children}</>
}
export default RoleBasedGuard
