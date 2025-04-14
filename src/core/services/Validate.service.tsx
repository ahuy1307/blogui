// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:51:20"
//

import validator from 'validator'

class ValidateServices {
    validateName(name: string): boolean {
        const options = {
            min: 0,
            max: 255,
        }

        const vietnameseRegex =
            /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯưẠ-ỹ\s]+$/u

        return vietnameseRegex.test(name) && validator.isLength(name, options)
    }
    validateEmail(email: string): boolean {
        const options = {
            min: 0,
            max: 150,
        }
        return validator.isEmail(email) && validator.isLength(email, options)
    }

    validatePassword(password: string): boolean {
        const options = {
            minLength: 8,
            maxLength: 128,
            minLowercase: 0,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 0,
        }

        const hasLetter = /[a-zA-Z]/.test(password)

        return validator.isStrongPassword(password, options) && hasLetter
    }

    validateURL(url: string): boolean {
        // Check if the URL is valid and starts with "https://"
        return validator.isURL(url) && url.startsWith('https://')
    }

    validateLength(value: string, min: number, max: number): boolean {
        return validator.isLength(value, { min, max })
    }

    validateMinLength(value: string, min: number): boolean {
        return validator.isLength(value, { min })
    }

    validateMaxLength(value: string, max: number): boolean {
        return validator.isLength(value, { max })
    }

    // Add more validation methods as needed
}

export const ValidateService = new ValidateServices()
