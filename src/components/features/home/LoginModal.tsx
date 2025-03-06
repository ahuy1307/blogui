import React, { useState } from 'react'
import { Modal, Form, Checkbox, ConfigProvider } from 'antd'
import { MdClose } from 'react-icons/md'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useMutation } from '@tanstack/react-query'

import { FacebookIcon } from '../../../../icon'
import Button from '@/components/ui/Button/Button'
import GoogleLoginButton from '@/hooks/useGoogleLogin'
import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import Alert from '@/components/ui/Alert/Alert'
import { localStorageService } from '@/core/services/LocalStorage.service'
import { useAuth } from '@/contexts/auth/AuthContext'
import { signIn } from '@/contexts/auth/reducers'
import { message } from 'antd'
import useFacebookLogin from '@/hooks/useFacebookLogin'

interface LoginModalProps {
    visible: boolean
    onOk: () => void
    onCancel: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onOk, onCancel }) => {
    const t = useTranslations('header')
    const { dispatch } = useAuth()
    const clientId = `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`
    const [error, setError] = useState('')
    const { mutate: googleLoginMutation, isPending: isPendingGoogleLogin } =
        useMutation({
            mutationFn: authenticationService.signupSocial,
            onSuccess: async (res: any) => {
                const { email, access } = res.data
                localStorageService.setToken(access)
                localStorageService.setRefreshToken(res.data.refresh)
                await handleSignIn()
                onCancel()
                message.success(t('loginSuccess'))
            },
            onError: (err: any) => {
                console.error('Google Login Failed:', err)
            },
        })

    const handleGoogleLogin = ({
        success,
        accessToken,
        error,
    }: {
        success: boolean
        accessToken?: string
        error?: any
    }) => {
        if (success && accessToken) {
            googleLoginMutation({
                accessToken: accessToken,
                type: 'google',
            })
        } else {
            console.error('Google Login Failed:', error)
        }
    }

    const { mutate: facebookLoginMutation, isPending: isPendingFacebookLogin } =
        useMutation({
            mutationFn: authenticationService.signupSocial,
            onSuccess: async (res: any) => {
                const { email, access } = res.data
                localStorageService.setToken(access)
                localStorageService.setRefreshToken(res.data.refresh)
                await handleSignIn()
                message.success(t('loginSuccess'))
                onCancel()
            },
            onError: (error: any) => {
                setError(
                    error.response.data.errors.other ||
                        error.response.data.errors.email
                )
            },
        })

    const handleFacebookLogin = useFacebookLogin(
        `${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}`,
        (response: any) => {
            if (response.status === 'connected') {
                const { accessToken } = response.authResponse
                facebookLoginMutation({
                    accessToken: accessToken,
                    type: 'facebook',
                })
            } else {
                console.log('User cancelled login or did not fully authorize.')
            }
        }
    )

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            dispatch(signIn({ isAuthenticated: true, user: userInformation }))
        } catch (error) {}
    }

    const { mutate: loginMutation, isPending } = useMutation({
        mutationFn: authenticationService.login,
        onSuccess: async (res: any) => {
            localStorageService.setToken(res.data.access)
            localStorageService.setRefreshToken(res.data.refresh)
            await handleSignIn()
            message.success(t('loginSuccess'))
            onCancel()
        },
        onError: (error: any) => {
            setError(error.response.data.errors.other)
        },
    })

    const onFinish = (values: any) => {
        const { email, password, isRemember } = values
        loginMutation({ email, password, isRemember })
    }

    return (
        <Modal
            title={t('login')}
            footer={null}
            destroyOnClose={true}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            closeIcon={
                <>
                    <MdClose size={24} />
                </>
            }
        >
            <Form className="mt-6" onFinish={onFinish}>
                <InputFormItem
                    required
                    placeholder={t('emailPlaceholder')}
                    name="email"
                    type="email"
                />
                <InputFormItem
                    name="password"
                    style={{ height: '44px', padding: '0 11px' }}
                    placeholder={t('passwordPlaceholder')}
                    type="password"
                    required
                />
                <div className="flex justify-between h-fit">
                    <ConfigProvider
                        theme={{
                            components: {
                                Checkbox: {
                                    colorPrimary: 'var(--text-color-brand)',
                                    colorPrimaryHover:
                                        'var(--text-color-brand)',
                                    colorBorder: 'var(--border-color-gray-two)',
                                },
                            },
                        }}
                    >
                        <Form.Item name="isRemember" valuePropName="checked">
                            <Checkbox className="">
                                {t('rememberLoginInfo')}
                            </Checkbox>
                        </Form.Item>
                    </ConfigProvider>
                    <Link
                        href={'/auth/forgot-password'}
                        className="font-bold h-fit text-[var(--text-color-hyperlink-auth)] relative top-[4px]"
                    >
                        {t('forgotPassword')}{' '}
                    </Link>
                </div>
                <div className="mb-4">
                    {error && (
                        <Alert type="error" showIcon={true} message={error} />
                    )}
                </div>
                <Form.Item>
                    <Button
                        htmlType="submit"
                        type="primary"
                        shape="square"
                        style={{ width: '100%' }}
                    >
                        {t('login')}
                    </Button>
                </Form.Item>
            </Form>
            <div className="relative flex items-center">
                <span className="w-full h-[2px] bg-[var(--border-color-default)] absolute top-2"></span>
                <p className="mx-auto bg-white inline-block px-4 z-10 text-[var(--text-color-secondary)]">
                    {t('orLoginWith')}
                </p>
            </div>
            <div className="flex justify-center gap-4 mt-6">
                <GoogleOAuthProvider clientId={clientId}>
                    <GoogleLoginButton callback={handleGoogleLogin} />
                </GoogleOAuthProvider>
                <Button
                    onClick={handleFacebookLogin}
                    size="very_large"
                    type="white_secondary"
                    icon={<FacebookIcon />}
                    style={{
                        border: '1px solid var(--text-color-hyperlink-auth)',
                    }}
                >
                    {t('loginWithFacebook')}
                </Button>
            </div>
            <p className="text-center mt-6">
                {t('dontHaveAccount')}{' '}
                <Link
                    href={'/auth/register'}
                    className="font-bold text-[var(--text-color-hyperlink-auth)] ml-1"
                >
                    {t('register')}
                </Link>
            </p>
        </Modal>
    )
}

export default LoginModal
