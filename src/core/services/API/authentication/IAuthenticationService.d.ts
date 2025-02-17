// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:30:37"
//

/*
 * # -*- coding: utf-8 -*-
 * # Copyright (C) 2024 HRForce
 * #
 * # All rights reserved.
 * # @link hrforce.ai
 * #
 */

interface IInforUser {
    dateOfBirth?: string
    gender?: string
    name?: string
    phone?: string
    country?: string
    city?: string
    avatar?: any
    action?: string
    prefer_language?: string
}

interface ISignupEmailRequest {
    email: string
    ho: string
    ten: string
}

interface IResendEmailRequest {
    email: string
    type: string
}

interface IVerifySignupEmailRequest {
    email: string
    token: string
}

interface ISetPasswordRequest {
    email: string
    token: string
    password: string
}

interface ILoginRequest {
    email: string
    password: string
    isRemember: boolean
}

interface IAuthentication {
    signupEmail({ email, accountType }: ISignupEmailRequest): Promise<any>
    resendEmail({ email, type }: IResendEmailRequest): Promise<any>
    verifySignupEmail({ email, token }: IVerifySignupEmailRequest): Promise<any>
    setPassword({ email, token, password }: ISetPasswordRequest): Promise<any>
}
