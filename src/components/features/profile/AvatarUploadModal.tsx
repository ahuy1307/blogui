import { useState, useEffect } from 'react'
import { Modal, Upload, message, Image, Spin } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useAuth } from '@/contexts/auth/AuthContext'
import Button from '@/components/ui/Button/Button'
import { signIn } from '@/contexts/auth/reducers'
import { base64ToFile } from '@/helper/utils'

interface AvatarUploadModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AvatarUploadModal({
    isOpen,
    onClose,
}: AvatarUploadModalProps) {
    const t = useTranslations('profile.AvatarUploadModal')
    const { user, dispatch } = useAuth()
    const [preview, setPreview] = useState<string | undefined>(user?.avatar)
    const [file, setFile] = useState<File | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (user) setPreview(user.avatar)
    }, [user?.avatar])

    const handleFileChange: UploadProps['onChange'] = ({ fileList }) => {
        const latestFile = fileList[fileList.length - 1] // Get the latest uploaded file
        if (latestFile && latestFile.originFileObj) {
            if (
                ['image/png', 'image/jpeg'].includes(
                    latestFile.originFileObj.type
                )
            ) {
                setPreview(URL.createObjectURL(latestFile.originFileObj))
                setFile(latestFile.originFileObj)
            } else {
                message.error(t('invalidImageFileType'))
            }
        }
    }

    const handleRemoveAvatar = () => {
        if (user) {
            const userData = {
                avatar_action: 'delete',
            }
            SetInformationMutation(userData)
            setTimeout(() => {
                setPreview('')
                setFile(null)
                if (user.avatar) message.success(t('removeAvatarSuccess'))
            }, 1000)
        }
    }

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            await dispatch(
                signIn({ isAuthenticated: true, user: userInformation })
            )
        } catch (error) {}
    }

    const { mutate: SetInformationMutation, isPending } = useMutation({
        mutationFn: authenticationService.setInformationUser,
        onSuccess: async (res) => {
            setSuccess(true)
            handleSignIn()
        },
        onError: () => {
            message.error(t('uploadFailed'))
        },
    })

    const handleUpload = () => {
        if (user) {
            const userData = {
                avatar_file: file,
                avatar_action: 'update',
            }
            SetInformationMutation(userData)
            if (success)
                setTimeout(() => {
                    message.success(t('uploadSuccess'))
                    onClose()
                }, 2000)
        }
    }

    return (
        <Modal
            title="Upload Avatar"
            open={isOpen}
            onCancel={onClose}
            footer={null}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-gray-300">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Avatar preview"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            {t('noAvatar')}
                        </div>
                    )}
                </div>
                <Upload
                    beforeUpload={() => false}
                    showUploadList={false}
                    onChange={handleFileChange}
                >
                    <Button
                        size="small"
                        icon={<UploadOutlined />}
                        disabled={isPending}
                    >
                        {t('chooseImage')}
                    </Button>
                </Upload>
                {preview && (
                    <Button
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        disabled={isPending}
                        onClick={handleRemoveAvatar}
                    >
                        {t('removeAvatar')}
                    </Button>
                )}
                <Spin spinning={isPending} />
                <Button
                    size="small"
                    onClick={handleUpload}
                    disabled={isPending || !file}
                >
                    {t('uploadAvatar')}
                </Button>
            </div>
        </Modal>
    )
}
