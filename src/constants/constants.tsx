// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:14:25"
//

// define common contants
export const NAVIGATION_PATHS = {
    HOME: '/',
    PRIVACY: '#',
    CHECK_EMAIL_SIGNUP: '/auth/check-email-signup',
    VERIFY_EMAIL_FAILED: '/auth/verify-email-failed',
    SET_PASSWORD: '/auth/set-password',
}

export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

export const FORMAT_DATE_TIME = {
    DATE_DEFAULT: 'dd/MM/yyyy',
    DATE_FORMAT_SECOND: 'YYYY-MM-DD',
    DATE_TIME_FULL: 'h:mma - dd/MM/yyyy',
}

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024
