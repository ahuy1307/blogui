// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:30:37"
//

/* -*- coding: utf-8 -*-
 * //
 * // All rights reserved.
 * //
 * // __author__ = "phamanhhuy22@gmail.com"
 * // __date__ = "2025-03-08 19:09:14"
 */

interface IInforUser {
    ngaySinh?: string
    gioiTinh?: string
    ho?: string
    ten?: string
    soDienThoai?: string
    quocGia?: string
    thanhPho?: string
    avatar_file?: any
    avatar_action?: string
    diaChi?: string
    ngheNghiep?: string
    mangXaHoi?: {}
    cover_file?: any
    cover_action?: string
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

interface IForgotPasswordRequest {
    email: string
    type: string
}

interface ILogoutOptionsRequest {
    device_ids: string[]
}

interface IChangePasswordRequest {
    old_password: string
    new_password: string
}

interface ISignupSocialRequest {
    accessToken: string
    type: string
}
interface IAuthentication {
    signupEmail({ email, accountType }: ISignupEmailRequest): Promise<any>
    resendEmail({ email, type }: IResendEmailRequest): Promise<any>
    verifySignupEmail({ email, token }: IVerifySignupEmailRequest): Promise<any>
    setPassword({ email, token, password }: ISetPasswordRequest): Promise<any>
}
