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
    async login({ email, password, is_remember }: ILoginRequest): Promise<any> {
        const deviceID = await getFingerprint()
        const data: { email: string; password: string; is_remember: boolean } =
            {
                email,
                password,
                is_remember,
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
    async logoutOptions({ device_ids }: ILogoutOptionsRequest): Promise<any> {
        const data: { device_ids: string[] } = { device_ids }
        const res = await httpService.post('/auth/logout-option', data)
        return res
    }
    async getInformationUser(): Promise<any> {
        const res = await httpService.get('/auth/profile')
        return res.data
    }
    async forgotPassword({
        email,
        type,
    }: IForgotPasswordRequest): Promise<any> {
        const data: { email: string; type: string } = { email, type }
        const res = await httpService.post('/auth/resend-email', data)
        return res
    }
    async verifyResetPassword({
        email,
        token,
    }: IVerifySignupEmailRequest): Promise<any> {
        const data: { email: string; token: string } = { email, token }
        const res = await httpService.post('/auth/verify-reset-password', data)
        return res
    }
    async resetPassword({
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
        const res = await httpService.post('/auth/reset-password', data, {
            headers,
        })
        return res
    }
    async changePassword({
        old_password,
        new_password,
    }: IChangePasswordRequest): Promise<any> {
        const data: { old_password: string; new_password: string } = {
            old_password,
            new_password,
        }
        const res = await httpService.put('/auth/change-password', data)
        return res
    }
    async setInformationUser(data: IInforUser): Promise<any> {
        const formData = new FormData()

        for (const key in data) {
            if (
                (key === 'avatar' || key === 'action') &&
                !data[key as keyof IInforUser]
            ) {
                continue
            }
            if (key === 'ngaySinh' && !data.ngaySinh) {
                continue
            }
            if (key in data && data[key as keyof IInforUser]) {
                formData.append(key, data[key as keyof IInforUser])
            } else {
                formData.append(key, '')
            }
        }

        const headers = {
            'Content-Type': 'multipart/form-data',
        }

        const res = await httpService.put('/auth/profile', formData, {
            headers: headers,
        })
        return res
    }
    async signupSocial({
        type,
        access_token,
    }: ISignupSocialRequest): Promise<any> {
        const data: { type: string; access_token: string } = {
            type,
            access_token,
        }
        const finger = await getFingerprint()
        const headers = {
            'Device-ID': finger,
        }
        const res = await httpService.post('/auth/signup-social', data, {
            headers,
        })
        return res
    }
    async getAllDevices(): Promise<any> {
        const res = await httpService.get('/auth/devices')
        return res.data
    }
    async getUserProfileBySlug({ slug }: { slug: any }): Promise<any> {
        const res = await httpService.get(`/auth/profile/${slug}`)
        return res
    }
    async searchBlogs({
        search,
        type,
        start_date,
        end_date,
        page,
        limit,
    }: ISearchBlogsRequest): Promise<any> {
        const res = await httpService.get('/blogs/search', {
            params: {
                search,
                type,
                start_date,
                end_date,
                page,
                limit,
            },
        })
        return res
    }
    async getAllBlogMedias({ type }: { type: string }): Promise<any> {
        const res = await httpService.get('/blogs/medias', {
            params: {
                type,
            },
        })
        return res
    }
    async deleteBlogMedia({ id }: { id: string }): Promise<any> {
        const res = await httpService.delete(`/blogs/medias/${id}`)
        return res
    }
    async uploadBlogMedia({ formData }: { formData: FormData }): Promise<any> {
        const res = await httpService.post('/blogs/medias', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return res
    }
    async getTopics({ have_blog }: { have_blog?: boolean }): Promise<any> {
        const res = await httpService.get('/blogs/topics', {
            params: {
                have_blog,
            },
        })
        return res
    }
    async saveBlog({ blogData }: { blogData: ISaveBlogRequest }): Promise<any> {
        const res = await httpService.post('/blogs', blogData)
        return res
    }
    async getBlogBySlug({ slug }: { slug: string }): Promise<any> {
        const res = await httpService.get(`/blogs/slug/${slug}`)
        return res
    }
    async getBlogsByTopic({ blog_id }: { blog_id: string }): Promise<any> {
        const res = await httpService.get('/blogs/by-topic', {
            params: {
                blog_id,
            },
        })
        return res
    }
    async saveOrLikeBlog({
        baiViet,
        loaiDanhDau,
    }: {
        baiViet: string
        loaiDanhDau: string
    }): Promise<any> {
        const res = await httpService.post('/user-blogs', {
            baiViet,
            loaiDanhDau,
        })
        return res
    }
    async getBlogReportOptions(): Promise<any> {
        const res = await httpService.get('/blog-reports/options')
        return res
    }
    async reportBlog({
        baiViet,
        loaiBaoCao,
        lyDoBaoCao,
    }: {
        baiViet: string
        loaiBaoCao: number
        lyDoBaoCao: string
    }): Promise<any> {
        const res = await httpService.post('/blog-reports', {
            baiViet,
            loaiBaoCao,
            lyDoBaoCao,
        })
        return res
    }
}

export const authenticationService = new AuthenticationService()
