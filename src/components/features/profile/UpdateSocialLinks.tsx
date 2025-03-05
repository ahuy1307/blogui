/* -*- coding: utf-8 -*-
 * //
 * // All rights reserved.
 * //
 * // __author__ = "phamanhhuy22@gmail.com"
 * // __date__ = "2025-03-05 22:30:20"
 */

import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import Button from '@/components/ui/Button/Button'
import { Form } from 'antd'
import HintText from '@/components/ui/HintText/HintText'
import { ValidateService } from '@/core/services/Validate.service'
import Input from '@/components/ui/TextField/TextField'
import { useAuth } from '@/contexts/auth/AuthContext'

const nameLink = {
    facebook: 'facebookLink',
    github: 'githubLink',
    linkedIn: 'linkedinLink',
}

const UpdateSocialLinks = () => {
    const t = useTranslations('profile.UpdateSocialLinks')
    const { user } = useAuth()

    const formItems = [
        {
            name: nameLink.facebook,
            title: 'Facebook',
            validate: /^(https?:\/\/)?(www\.)?facebook.com\/[a-zA-Z0-9(\.\?)?]/,
            errorMessage: t('invalidFacebookLink'),
        },
        {
            name: nameLink.github,
            title: 'Github',
            validate: /^(https?:\/\/)?(www\.)?github.com\/[a-zA-Z0-9(\.\?)?]/,
            errorMessage: t('invalidGithubLink'),
        },
        {
            name: nameLink.linkedIn,
            title: 'LinkedIn',
            validate: /^(https?:\/\/)?(www\.)?linkedin.com\/[a-zA-Z0-9(\.\?)?]/,
            errorMessage: t('invalidLinkedInLink'),
        },
    ]

    const { mutate } = useMutation({
        mutationFn: authenticationService.setInformationUser,
        onSuccess: () => {},
        onError: (err) => {},
    })

    const handleFinish = (values: any) => {
        const data = {
            mangXaHoi: JSON.stringify({
                [nameLink.facebook]: values[nameLink.facebook],
                [nameLink.github]: values[nameLink.github],
                [nameLink.linkedIn]: values[nameLink.linkedIn],
            }),
        }
        mutate(data)
    }

    return (
        <div className="pt-4">
            <Form
                onFinish={handleFinish}
                initialValues={{
                    [nameLink.facebook]:
                        user?.mangXaHoi?.[nameLink.facebook] || undefined,
                    [nameLink.github]:
                        user?.mangXaHoi?.[nameLink.github] || undefined,
                    [nameLink.linkedIn]:
                        user?.mangXaHoi?.[nameLink.linkedIn] || undefined,
                }}
            >
                {formItems.map((item, index) => (
                    <div key={index}>
                        <p className="font-bold pb-2 text-base">{item.title}</p>
                        <Form.Item
                            name={[item.name]}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value) {
                                            return Promise.resolve()
                                        }
                                        if (
                                            (value &&
                                                !ValidateService.validateURL(
                                                    value
                                                )) ||
                                            !item?.validate.test(value)
                                        ) {
                                            return Promise.reject(
                                                <HintText
                                                    type="error"
                                                    text={item?.errorMessage}
                                                />
                                            )
                                        }
                                        return Promise.resolve()
                                    },
                                },
                            ]}
                        >
                            <Input
                                style={{ height: '44px', fontSize: '16px' }}
                                placeholder={t('enterLink')}
                            />
                        </Form.Item>
                    </div>
                ))}

                <div className="float-right">
                    <Button
                        htmlType="submit"
                        type="primary"
                        shape="square"
                        size="middle"
                        style={{ width: '120px' }}
                    >
                        {t('save')}
                    </Button>
                </div>
            </Form>
        </div>
    )
}

export default UpdateSocialLinks
