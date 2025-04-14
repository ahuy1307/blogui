// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-01-25 12:04:20"
//

class LocalStorageService {
    // Define a constant for the token key
    private readonly TOKEN_KEY = 'accessToken'
    private readonly REFRESH_TOKEN_KEY = 'refreshToken'

    // Set an item in local storage
    setItem(key: string, value: any): void {
        try {
            const stringValue = JSON.stringify(value)
            localStorage.setItem(key, stringValue)
        } catch (error) {
            console.error('Error saving to local storage', error)
        }
    }

    // Get an item from local storage
    getItem<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        } catch (error) {
            console.error('Error reading from local storage', error)
            return null
        }
    }

    // Remove an item from local storage
    removeItem(key: string): void {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error('Error removing item from local storage', error)
        }
    }

    // Set the authentication token
    setToken(token: string): void {
        this.setItem(this.TOKEN_KEY, token)
    }

    // Get the authentication token
    getToken(): string | null {
        return this.getItem<string>(this.TOKEN_KEY)
    }

    // Remove the authentication token
    removeToken(): void {
        this.removeItem(this.TOKEN_KEY)
    }

    // Set the refresh token
    setRefreshToken(token: string): void {
        this.setItem(this.REFRESH_TOKEN_KEY, token)
    }
    // Get the refresh token
    getRefreshToken(): string | null {
        return this.getItem<string>(this.REFRESH_TOKEN_KEY)
    }
    // Remove the refresh token
    removeRefreshToken(): void {
        this.removeItem(this.REFRESH_TOKEN_KEY)
    }
}
// Export an instance of the service
export const localStorageService = new LocalStorageService()
