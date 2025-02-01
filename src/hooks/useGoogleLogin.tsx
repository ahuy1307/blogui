import React from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import Button from '@/components/ui/Button/Button'
import Google from 'public/icon/google-icon.svg'
import axios from 'axios'

interface GoogleLoginButtonProps {
    callback: (result: {
        success: boolean
        user?: any
        accessToken?: string
        error?: any
    }) => void
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ callback }) => {
    const login = useGoogleLogin({
        onSuccess: async (response) => {
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
        onError: (error) => {
            console.error('Google Login Failed:', error)
            callback({
                success: false,
                error: new Error('Google Login Failed'),
            })
        },
    })

    return (
        <Button
            icon={<Google />}
            type="white_secondary"
            size="very_large"
            onClick={() => login()}
        />
    )
}

export default GoogleLoginButton
