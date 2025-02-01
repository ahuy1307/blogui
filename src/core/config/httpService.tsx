// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import axios from 'axios'
import { localStorageService } from '../services/LocalStorage.service'
import { AppConfig } from './appConfig'

const BLOG_URL: string =
    process.env.NEXT_PUBLIC_BLOG_URL || 'http://localhost:8001'

const httpService = axios.create({
    baseURL: `${BLOG_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // Set timeout to 60 seconds
})

httpService.interceptors.request.use(
    async (config: any) => {
        const token: string | null = await localStorageService.getToken()
        if (token) {
            const currentTime = Math.floor(Date.now() / 1000)
            const decodedToken = token
                ? JSON.parse(atob(token.split('.')[1]))
                : ''

            if (decodedToken.exp > currentTime) {
                config.headers['Authorization'] = `Bearer ${token}`
            } else {
                const refreshToken = await localStorageService.getRefreshToken()
                try {
                    const { data } = await axios.post(
                        `${BLOG_URL}/api/v1/auth-jwt/refresh`,
                        { refresh: refreshToken }
                    )
                    localStorageService.setToken(data.access)
                    config.headers['Authorization'] = `Bearer ${data.access}`
                } catch (refreshError) {
                    localStorageService.removeToken()
                    localStorageService.removeRefreshToken()
                }
            }
        }

        const locale = window.location.pathname.split('/')[1]
        const { locales } = AppConfig
        const currentLocale = locales.includes(locale) ? locale : 'vi'
        config.headers['Accept-Language'] = currentLocale

        return config
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status
            switch (status) {
                case 400:
                    console.error('Bad Request', error.response.data)
                    break
                case 401:
                case 403:
                    // Handle unauthorized access, e.g., redirect to login or refresh token
                    localStorageService.removeToken()
                    localStorageService.removeRefreshToken()
                    console.error('Unauthorized', error.response.data)
                    break
                case 404:
                    console.error('Not Found', error.response.data)
                    break
                case 500:
                    console.error('Internal Server Error', error.response.data)
                    break
                default:
                    console.error(
                        `Unhandled error: ${status}`,
                        error.response.data
                    )
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error(
                'The request was made but no response was received',
                error.request
            )
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error', error.message)
        }

        return Promise.reject(error)
    }
)

export default httpService
