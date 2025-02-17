// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:30:23"
//

import httpService from '@/core/config/httpService'
import { getFingerprint } from '@/helper/utils'
import { localStorageService } from '../../LocalStorage.service'

class AuthenticationService implements IAuthentication {
    //Signup with Email
    async signupEmail({ email, ho, ten }: ISignupEmailRequest): Promise<any> {
        const data: {
            email: string
            ho: string
            ten: string
        } = { email, ho, ten }
        const res = await httpService.post('/auth/signup', data)
        return res
    }
    async resendEmail({ email, type }: IResendEmailRequest): Promise<any> {
        const data: { email: string; type: string } = { email, type }
        const res = await httpService.post('/auth/resend-email', data)
        return res
    }
    async verifySignupEmail({
        email,
        token,
    }: IVerifySignupEmailRequest): Promise<any> {
        const data: { email: string; token: string } = { email, token }
        const res = await httpService.post('/auth/verify-email', data)
        return res
    }
    async setPassword({
        email,
        token,
        password,
    }: ISetPasswordRequest): Promise<any> {
        const deviceID = await getFingerprint()
        const data: { email: string; token: string; password: string } = {
            email,
            token,
            password,
        }
        const headers = {
            'Device-ID': deviceID,
        }
        const res = await httpService.post('/auth/set-password', data, {
            headers,
        })
        return res
    }
    async login({ email, password, isRemember }: ILoginRequest): Promise<any> {
        const deviceID = await getFingerprint()
        const data: { email: string; password: string; isRemember: boolean } = {
            email,
            password,
            isRemember,
        }
        const headers = {
            'Device-ID': deviceID,
        }
        const res = await httpService.post('/auth/sign-in', data, {
            headers,
        })
        return res
    }
    async logoutUser(): Promise<any> {
        const token = localStorageService.getToken()
        if (token) {
            const res = await httpService.delete('/auth/logout')
            return res.data
        }
        return undefined
    }
    async getInformationUser(): Promise<any> {
        const res = await httpService.get('/auth/profile')
        return res.data
    }
}

export const authenticationService = new AuthenticationService()
