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

            // Special handling for boolean values
            if (
                key === 'canhBaoThietBi' &&
                typeof data[key as keyof IInforUser] === 'boolean'
            ) {
                formData.append(
                    key,
                    data[key as keyof IInforUser] ? 'true' : 'false'
                )
            } else if (key in data && data[key as keyof IInforUser]) {
                formData.append(key, data[key as keyof IInforUser])
            } else {
                formData.append(key, '')
            }
        }

        const headers = {
            'Content-Type': 'multipart/form-data',
        }

        const res = await httpService.patch('/auth/profile', formData, {
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
        topics,
        page,
        limit,
        order_by,
    }: ISearchBlogsRequest): Promise<any> {
        // Create a URLSearchParams object to properly handle multiple topic parameters
        const params = new URLSearchParams()

        // Add basic parameters
        if (page) params.append('page', page.toString())
        if (limit) params.append('limit', limit.toString())
        if (search) params.append('search', search)
        if (type) params.append('type', type)
        if (start_date) params.append('start_date', start_date)
        if (end_date) params.append('end_date', end_date)
        if (order_by) params.append('order_by', order_by)

        // Add topics as individual 'topic' parameters
        if (topics && Array.isArray(topics) && topics.length > 0) {
            topics.forEach((topic) => {
                params.append('topic', topic.toString())
            })
        }

        // Use the toString() method to get the query string
        const queryString = params.toString()

        // Make the request with the query string
        const res = await httpService.get(`/blogs/search?${queryString}`)
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
    async trackingBlog({
        blog_id,
        task_type,
    }: {
        blog_id: string
        task_type: number
    }): Promise<any> {
        const res = await httpService.post(`/blogs/${blog_id}/tracking`, {
            task_type,
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
    async getSavedLikedBlogs({
        type,
        page,
        limit,
    }: {
        type: string
        page?: number
        limit?: number
    }): Promise<any> {
        const res = await httpService.get('/user-blogs', {
            params: {
                type,
                page,
                limit,
            },
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
    async getNotifications(): Promise<any> {
        const res = await httpService.get('/blogs/notifications')
        return res
    }
    async markAsReadAllNotifications(): Promise<any> {
        const res = await httpService.put(
            '/blogs/notifications/mark-all-as-read'
        )
        return res
    }
    async markAsReadNotification({ id }: { id: string }): Promise<any> {
        const res = await httpService.put(`/blogs/notifications/read/${id}`)
        return res
    }
    async clearAllNotifications(): Promise<any> {
        const res = await httpService.delete('/blogs/notifications/clear')
        return res
    }
    async getAllBlogs({
        page,
        limit,
        sort,
        search,
        start_date,
        end_date,
        published,
    }: {
        page?: number
        limit?: number
        sort?: string
        search?: string
        start_date?: string
        end_date?: string
        published?: boolean
    }): Promise<any> {
        const res = await httpService.get('/blogs', {
            params: {
                page,
                limit,
                sort,
                search,
                start_date,
                end_date,
                published,
            },
        })
        return res
    }
    async deleteBlog({ id }: { id: string }): Promise<any> {
        const res = await httpService.delete(`/blogs/${id}`)
        return res
    }
    async updateBlog({
        id,
        blogData,
    }: {
        id: string
        blogData: ISaveBlogRequest
    }): Promise<any> {
        const res = await httpService.put(`/blogs/${id}`, blogData)
        return res
    }
    async getBlogById({ id }: { id: string }): Promise<any> {
        const res = await httpService.get(`/blogs/${id}`)
        return res
    }
    async publishOrDraftBlog({ id }: { id: string }): Promise<any> {
        const res = await httpService.put(`/blogs/${id}/publish`)
        return res
    }
    async getBlogsByUserSlug({
        slug,
        page,
        limit,
    }: {
        slug: string
        page?: number
        limit?: number
    }): Promise<any> {
        const res = await httpService.get(`/auth/profile/${slug}/blogs`, {
            params: {
                page,
                limit,
            },
        })
        return res
    }
    async getCommentsByBlogId({
        blog_id,
        page,
        limit,
    }: {
        blog_id: string
        page?: number
        limit?: number
    }): Promise<any> {
        const res = await httpService.get(`/blogs/${blog_id}/comments`, {
            params: {
                page,
                limit,
            },
        })
        return res
    }
    async addComment({
        blog_id,
        noiDungBinhLuan,
        binhLuan,
    }: {
        blog_id: string
        noiDungBinhLuan: string
        binhLuan?: string
    }): Promise<any> {
        const data: { noiDungBinhLuan: string; binhLuan?: string } = {
            noiDungBinhLuan,
            binhLuan,
        }
        const res = await httpService.post(`/blogs/${blog_id}/comments`, data)
        return res
    }
    async updateComment({
        blog_id,
        comment_id,
        noiDungBinhLuan,
    }: {
        blog_id: string
        comment_id: string
        noiDungBinhLuan: string
    }): Promise<any> {
        const data: { noiDungBinhLuan: string } = { noiDungBinhLuan }
        const res = await httpService.put(
            `/blogs/${blog_id}/comments/${comment_id}`,
            data
        )
        return res
    }
    async deleteComment({
        blog_id,
        comment_id,
    }: {
        blog_id: string
        comment_id: string
    }): Promise<any> {
        const res = await httpService.delete(
            `/blogs/${blog_id}/comments/${comment_id}`
        )
        return res
    }
    async getAllChildComments({
        blog_id,
        comment_id,
        page,
        limit,
    }: {
        blog_id: string
        comment_id: string
        page?: number
        limit?: number
    }): Promise<any> {
        const res = await httpService.get(
            `/blogs/${blog_id}/comments/${comment_id}/child`,
            {
                params: {
                    page,
                    limit,
                },
            }
        )
        return res
    }
    async generateBlogContent({
        title,
        content,
        writing_tone,
        target_audience,
        include_code,
        language,
        include_emojis,
    }: {
        title: string
        content: string
        writing_tone: string
        target_audience: string
        include_code: boolean
        language: string
        include_emojis?: boolean
    }): Promise<any> {
        const data: {
            title: string
            content: string
            writing_tone: string
            target_audience: string
            include_code: boolean
            language: string
            include_emojis?: boolean
        } = {
            title,
            content,
            writing_tone,
            target_audience,
            include_code,
            language,
            include_emojis,
        }
        const res = await httpService.post('/blogs/generate', data)
        return res
    }
    async getUserTasksDaily(): Promise<any> {
        const res = await httpService.get('/auth/tasks/daily')
        return res
    }
    async collectCoinCompletedTask({
        task_id,
    }: {
        task_id: string
    }): Promise<any> {
        const res = await httpService.put(`/auth/tasks/collect-coin/${task_id}`)
        return res
    }
    async getCoinHistory({
        page,
        limit,
    }: {
        page?: number
        limit?: number
    }): Promise<any> {
        const res = await httpService.get('/auth/tasks/history', {
            params: {
                page,
                limit,
            },
        })
        return res
    }
    async generateBllogImage({ prompt }: { prompt: string }): Promise<any> {
        const data: { prompt: string } = {
            prompt,
        }
        const res = await httpService.post('/blogs/generate-image', data)
        return res
    }
    async uploadGeneratedImage({ url }: { url: string }): Promise<any> {
        const data: { url: string } = {
            url,
        }
        const res = await httpService.post('/blogs/upload-gen-image', data)
        return res
    }
    async getSubscriptionPackages(): Promise<any> {
        const res = await httpService.get('/subscription-packages')
        return res
    }
    async getVnPayUrl({
        package_id,
        redirect_endpoint,
    }: {
        package_id: string
        redirect_endpoint: string
    }): Promise<any> {
        const data: { package_id: string; redirect_endpoint: string } = {
            package_id,
            redirect_endpoint,
        }
        const res = await httpService.post('/vnpay/payment-url', data)
        return res
    }
    async getPaymentCallback({ data }: { data: any }): Promise<any> {
        const res = await httpService.post('/vnpay/payment-callback', data)
        return res
    }
    async getPaymentHistory({
        page,
        limit,
        start_date,
        end_date,
        status,
    }: {
        page?: number
        limit?: number
        start_date?: string
        end_date?: string
        status?: string
    }): Promise<any> {
        const res = await httpService.get('/payment/history', {
            params: {
                page,
                limit,
                start_date,
                end_date,
                status,
            },
        })
        return res
    }
    async cancelPayment({ order_id }: { order_id: string }): Promise<any> {
        const res = await httpService.put(`/vnpay/${order_id}/cancel-payment`)
        return res
    }
    async getAllChatAssistants({
        page,
        limit,
        blog_id,
    }: {
        page?: number
        limit?: number
        blog_id: string
    }): Promise<any> {
        const res = await httpService.get(`/blogs/${blog_id}/assistants`, {
            params: {
                page,
                limit,
            },
        })
        return res
    }
    async askChatAssistant({
        blog_id,
        question,
    }: {
        blog_id: string
        question: string
    }): Promise<any> {
        const data: { question: string } = { question }
        const res = await httpService.post(`/blogs/${blog_id}/assistants`, data)
        return res
    }
}

export const authenticationService = new AuthenticationService()
