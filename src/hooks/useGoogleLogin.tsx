import React from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import Button from '@/components/ui/Button/Button'
import { GoogleIcon } from '../../icon'
import axios from 'axios'
import { useTranslations } from 'next-intl'

interface GoogleLoginButtonProps {
    callback: (result: {
        success: boolean
        user?: any
        accessToken?: string
        error?: any
    }) => void
    text?: string
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
    callback,
    text,
}) => {
    const t = useTranslations('header')

    const login = useGoogleLogin({
        onSuccess: async (response: any) => {
            const token = response.access_token
            try {
                const res = await axios.get(
                    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`
                )
                const user = res.data
                callback({ success: true, user, accessToken: token })
            } catch (error) {
                console.error('Error verifying Google token:', error)
                callback({ success: false, error })
            }
        },
        onError: (error: any) => {
            console.error('Google Login Failed:', error)
            callback({
                success: false,
                error: new Error('Google Login Failed'),
            })
        },
    })

    return (
        <Button
            icon={<GoogleIcon />}
            type="white_secondary"
            size="very_large"
            onClick={() => login()}
            style={{
                border: '1px solid var(--text-color-hyperlink-auth)',
                width: '100%',
            }}
        >
            {text || t('loginWithGoogle')}
        </Button>
    )
}

export default GoogleLoginButton
