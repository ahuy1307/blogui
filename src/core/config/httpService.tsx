// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//
import axios from 'axios'
import { localStorageService } from '../services/LocalStorage.service'
import { AppConfig } from './appConfig'

const BLOG_URL: string =
    process.env.NEXT_PUBLIC_BLOGSAPI_URL || 'http://localhost:8000'

const httpService = axios.create({
    baseURL: `${BLOG_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // Set timeout to 60 seconds
    withCredentials: true, // Include credentials in requests
})

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token))
    refreshSubscribers = []
}

// Function to subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback)
}

httpService.interceptors.request.use(
    async (config) => {
        const token: string | null = await localStorageService.getToken()

        // Set the locale header no matter what
        const locale =
            typeof window !== 'undefined'
                ? window.location.pathname.split('/')[1]
                : ''
        const { locales } = AppConfig
        const currentLocale = locales.includes(locale) ? locale : 'vi'
        config.headers['Accept-Language'] =
            config.headers['Accept-Language'] || currentLocale

        if (token) {
            const currentTime = Math.floor(Date.now() / 1000)
            const decodedToken = token
                ? JSON.parse(atob(token.split('.')[1]))
                : ''

            if (decodedToken.exp > currentTime) {
                config.headers['Authorization'] = `Bearer ${token}`
                return config
            } else {
                // Token is expired, handle refresh
                if (!isRefreshing) {
                    isRefreshing = true

                    try {
                        const { data } = await axios.get(
                            `${BLOG_URL}/api/v1/auth/refresh-token`,
                            { withCredentials: true }
                        )

                        await localStorageService.setToken(data.access)
                        onRefreshed(data.access)
                        config.headers['Authorization'] =
                            `Bearer ${data.access}`
                        return config
                    } catch (refreshError) {
                        // Clear tokens on refresh error
                        await localStorageService.removeToken()
                        await localStorageService.removeRefreshToken()
                        return Promise.reject(refreshError)
                    } finally {
                        isRefreshing = false
                    }
                } else {
                    // Wait for the token to be refreshed
                    return new Promise((resolve) => {
                        subscribeTokenRefresh((newToken) => {
                            config.headers['Authorization'] =
                                `Bearer ${newToken}`
                            resolve(config)
                        })
                    })
                }
            }
        }

        return config
    },
    (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
    }
)

httpService.interceptors.response.use(
    (response) => response,
    async (error) => {
        const path =
            typeof window !== 'undefined' ? window.location.pathname : ''
        const isEnglish = path === '/en' || path.startsWith('/en/')

        if (!error.response) {
            console.error('Unable to connect to server!')
            return Promise.reject(error)
        }

        const { status, config } = error.response
        const traceId =
            error.response.headers['x-amzn-trace-id'] ||
            error.response.headers['X-Amzn-Trace-Id']
        const fallbackMsg = isEnglish
            ? 'Something went wrong.'
            : 'Đã có lỗi xảy ra.'
        const errorMessage = error.response?.data?.message || fallbackMsg
        const finalMessage = traceId
            ? `${errorMessage} Trace ID: ${traceId}`
            : errorMessage
        // Handle other errors
        switch (status) {
            case 400:
                console.error('Bad Request', error.response.data)
                break
            case 401:
                await localStorageService.removeToken()
                await localStorageService.removeRefreshToken()
                console.error('Unauthorized', error.response.data)
                break
            case 403:
                console.error('Forbidden', error.response.data)
                break
            case 404:
                console.error('Not Found', error.response.data)
                break
            case 500:
                console.error('Error with Trace ID', {
                    status,
                    traceId,
                    data: error.response.data,
                })
                break
            default:
                console.error(`Unhandled error: ${status}`, error.response.data)
        }

        return Promise.reject(error)
    }
)

export default httpService
