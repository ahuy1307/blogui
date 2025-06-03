/* -*- coding: utf-8 -*-
 * //
 * // All rights reserved.
 * //
 * // __author__ = "phamanhhuy22@gmail.com"
 * // __date__ = "2025-03-06 20:11:27"
 */

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { initialize } from '@/contexts/auth/reducers'
import { useAuth } from '@/contexts/auth/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { localStorageService } from '@/core/services/LocalStorage.service'
import { Form, FormProps, Spin, message } from 'antd'
import Button from '@/components/ui/Button/Button'
import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import HintText from '@/components/ui/HintText/HintText'
import { ValidateService } from '@/core/services/Validate.service'

export const ChangePassword = () => {
    const [errorOldPassword, setErrorOldPassword] = useState<string | null>(
        null
    )

    const t = useTranslations('profile.ChangePassword')

    const { user, dispatch } = useAuth()

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            dispatch(
                initialize({ isAuthenticated: true, user: userInformation })
            )
        } catch (error) {}
    }

    const {
        mutate: changePasswordMutation,
        isPending: isPendingChangePassword,
    } = useMutation({
        mutationFn: authenticationService.changePassword,
        onSuccess: async (res) => {
            await localStorageService.setToken(res.data.access)
            // await localStorageService.setRefreshToken(res.data.refresh)
            await handleSignIn()
            message.success(res.data.message)
        },
        onError: (error: any) => {
            console.error(error)
            if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.errors?.other?.[0]
                setErrorOldPassword(errorMessage)
            }
        },
    })

    const handleSubmit: FormProps<any>['onFinish'] = (values) => {
        setErrorOldPassword('')
        if (!user?.daDatMatKhau && values.newpassword) {
            changePasswordMutation({
                old_password: '',
                new_password: values.newpassword,
            })
        }
        if (values.oldpassword && values.newpassword) {
            changePasswordMutation({
                old_password: values.oldpassword,
                new_password: values.newpassword,
            })
        }
    }

    return (
        <div className="mt-4 md:mt-6 px-2 md:px-0">
            <Form onFinish={handleSubmit} layout="vertical">
                <div className="space-y-4">
                    {user?.daDatMatKhau && (
                        <div>
                            <label className="font-bold text-base">
                                {t('currentPasswordLabel')}
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <InputFormItem
                                name="oldpassword"
                                required
                                type="password"
                                placeholder={t('enterCurrentPassword')}
                                data-testid="change-password-old-password-input"
                                classNameFormItem={'mt-2'}
                                style={{ height: '44px', fontSize: '16px' }}
                                size="large"
                                requiredMessage={t('passwordNotEmpty')}
                                onChange={(e) => setErrorOldPassword('')}
                            />
                            {errorOldPassword && (
                                <HintText
                                    className="relative top-[-12px] pb-2"
                                    size="medium"
                                    type="error"
                                    text={errorOldPassword}
                                />
                            )}
                        </div>
                    )}
                    <div>
                        <label className="font-bold text-base">
                            {t('newPasswordLabel')}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <InputFormItem
                            name="newpassword"
                            placeholder={t('enterNewPassword')}
                            data-testid="change-password-new-password-input"
                            type="password"
                            size="large"
                            classNameFormItem={'mt-2'}
                            style={{ height: '44px', fontSize: '16px' }}
                            required
                            requiredMessage={t('pleaseEnterPassword')}
                        />
                    </div>
                    <div>
                        <label className="font-bold text-base">
                            {t('confirmNewPassword')}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <InputFormItem
                            name="renewpassword"
                            placeholder={t('confirmPassword')}
                            type="password"
                            size="large"
                            required
                            classNameFormItem={'mt-2'}
                            style={{ height: '44px', fontSize: '16px' }}
                            requiredMessage={t('reenterNewPassword')}
                            disabledOldRule={true}
                            data-testid="change-password-renew-password-input"
                            newRules={[
                                ({ getFieldValue }: any) => ({
                                    validator(_: any, value: any) {
                                        if (!value) {
                                            return Promise.resolve()
                                        }
                                        if (
                                            !ValidateService.validateMaxLength(
                                                value,
                                                128
                                            )
                                        )
                                            return Promise.reject(
                                                <HintText
                                                    type="error"
                                                    text={t(
                                                        'passwordExceedsLimit'
                                                    )}
                                                />
                                            )
                                        if (
                                            !value ||
                                            getFieldValue('newpassword') ===
                                                value
                                        ) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(
                                            <HintText
                                                size="small"
                                                type="error"
                                                text={t('passwordMismatch')}
                                            />
                                        )
                                    },
                                }),
                            ]}
                        />
                    </div>
                </div>
                <div className="flex justify-center md:justify-end mt-6">
                    <Spin size="large" spinning={isPendingChangePassword} />
                    <Button
                        htmlType="submit"
                        shape="square"
                        size="middle"
                        style={{ width: '120px' }}
                        type="primary"
                        data-testid="change-password-send-button"
                        disabled={isPendingChangePassword}
                    >
                        {t('confirmButton')}
                    </Button>
                </div>
            </Form>
        </div>
    )
}

export default ChangePassword
