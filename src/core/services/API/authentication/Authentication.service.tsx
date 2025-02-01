// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:30:23"
//

import httpService from '@/core/config/httpService'

class AuthenticationService implements IAuthentication {
    //Signup with Email
    async signupEmail({
        email,
        accountType,
        invitationToken,
    }: ISignupEmailRequest): Promise<any> {
        const data: {
            email: string
            accountType: string
            invitationToken?: string
        } = { email, accountType }
        if (invitationToken) {
            data.invitationToken = invitationToken
        }
        const res = await httpService.post('/auth-jwt/signup-email', data)
        return res
    }
    // Active Email
    async activeEmail({
        email,
        token,
    }: {
        email: string
        token: string
    }): Promise<any> {
        const data = { email, token }
        const res = await httpService.put(
            '/auth-jwt/activate-signup-email',
            data
        )
        return res
    }
    // Set Password
    async setPassword({
        email,
        token,
        password,
        invitationToken,
    }: {
        email: string
        token: string
        password: string
        invitationToken?: string | null
    }): Promise<any> {
        const data = { email, token, password }
        if (invitationToken) {
            // data.invitationToken = invitationToken
        }
        // const finger = await getFingerprint()
        const headers = {
            // 'Device-ID': finger,
        }
        const res = await httpService.put('/auth-jwt/set-password', data, {
            headers,
        })
        return res
    }
}

export const authenticationService = new AuthenticationService()
