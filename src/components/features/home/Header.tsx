// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-15 15:34:13"
//
'use client'

import React, { useState } from 'react'
import { Link, useRouter } from '@/navigation'
import { IoSearchOutline } from 'react-icons/io5'
import { useTranslations } from 'next-intl'
import { Dropdown, Tooltip } from 'antd'

import TextField from '@/components/ui/TextField/TextField'
import Button from '@/components/ui/Button/Button'
import LoginModal from './LoginModal'
import Logo from './Logo'
import { useAuth } from '@/contexts/auth/AuthContext'
import SwitchLanguage from './SwitchLanguage'
import Avatar from '@/components/ui/Avatar/Avatar'
import { getInitials } from '@/helper/utils'
import ModalConfirm from './ModalConfirm'
import { signOut } from '@/contexts/auth/reducers'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { message } from 'antd'
import { Pencil, Book } from 'lucide-react'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { Button as OtherButton } from '@/components/other-ui/Button'
import { MissionsDropdown } from '@/components/mission/MissionDropdown'

const Header = ({ isWrite = false }: { isWrite?: boolean }) => {
    const { user, dispatch, isAuthenticated } = useAuth()
    const t = useTranslations('header')
    const router = useRouter()
    const fullName = `${user?.ho ?? ''} ${user?.ten ?? ''}`.trim()
    const firstCharName =
        fullName !== ''
            ? getInitials(fullName, user?.email ?? '')
            : getInitials('', user?.email ?? '')

    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
    const [isConfirmLogout, setIsConfirmLogout] = useState(false)

    const showModal = () => {
        setIsLoginModalVisible(true)
    }

    const handleOk = () => {
        setIsLoginModalVisible(false)
    }

    const handleCancel = () => {
        setIsLoginModalVisible(false)
    }

    const handleLogout = async () => {
        await authenticationService.logoutUser()
        dispatch(signOut())
        setIsConfirmLogout(false)
        message.success(t('logoutSuccess'))
        showModal()
    }

    const items: IDropdownMenu['items'] = [
        {
            key: '0',
            label: <p>{t('personalInfomation')}</p>,
            onClick: () => {
                router.push(`/info/${user?.slug}`)
            },
        },
        {
            key: '1',
            label: <p>{t('updatePersonalInformation')}</p>,
            onClick: () => {
                router.push('/profile?tab=profile')
            },
        },
        {
            key: '2',
            label: <p>{t('myBlogs')}</p>,
            onClick: () => {
                router.push('/profile/blogs')
            },
        },
        {
            key: '3',
            label: <p>{t('manageDevices')}</p>,
            onClick: () => {
                router.push('/profile?tab=device')
            },
        },
        {
            key: '4',
            label: <p>{t('logout')}</p>,
            onClick: () => {
                setIsConfirmLogout(true)
            },
        },
    ]

    return (
        <div className="fixed z-[200] left-0 right-0 top-0 border-[var(--border-color-default)] border-b flex justify-between items-center pl-4 pr-5 h-[70px] xl:px-[120px] md:px-[36px] bg-white lg:backdrop-blur-xl lg:bg-white/50 gap-4">
            <ModalConfirm
                open={isConfirmLogout}
                onCancel={setIsConfirmLogout}
                title={t('logout')}
                description={t('confirmLogout')}
                onClickConfirm={handleLogout}
            />

            <div className="flex items-center gap-10">
                <Link href={`/`}>
                    <Logo />
                </Link>
                <Link
                    href={`/`}
                    className="text-base hover:text-purple-500 font-bold"
                >
                    {t('home')}
                </Link>
                <Link
                    href={`/topics`}
                    className="text-base hover:text-purple-500 font-bold"
                >
                    {t('topics')}
                </Link>
                <Link
                    href={`/blog`}
                    className="text-base hover:text-purple-500 font-bold"
                >
                    {t('blog')}
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <SwitchLanguage />
                {!isWrite && (
                    <Button
                        type="default"
                        size="middle"
                        shape="square"
                        onClick={
                            isAuthenticated
                                ? () => router.push('/write')
                                : showModal
                        }
                    >
                        <Pencil className="h-4 w-4" />
                        {t('writeBlog')}
                    </Button>
                )}
                <TextField
                    style={{ width: '400px', fontSize: '16px' }}
                    placeholder="Search"
                    prefix={<IoSearchOutline />}
                    size="large"
                />
                {!isAuthenticated ? (
                    <>
                        <Button
                            type="primary"
                            size="middle"
                            shape="square"
                            onClick={showModal}
                        >
                            {t('login')}
                        </Button>
                        <Link href={'/auth/register'}>
                            <Button type="primary" size="middle" shape="square">
                                {t('register')}
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href={`/library`}>
                            <Tooltip title={t('library')}>
                                <OtherButton
                                    variant="ghost"
                                    size="sm"
                                    className="relative"
                                >
                                    <Book
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                        }}
                                    />
                                </OtherButton>
                            </Tooltip>
                        </Link>
                        <MissionsDropdown />
                        <NotificationDropdown />
                        <Dropdown menu={{ items }} placement="bottomRight">
                            <Avatar
                                size={36}
                                className="bg-[var(--text-color-brand)] cursor-pointer"
                                src={
                                    user?.avatar && user.avatar !== ''
                                        ? user.avatar
                                        : undefined
                                }
                            >
                                {user?.avatar && user.avatar !== ''
                                    ? null
                                    : firstCharName}
                            </Avatar>
                        </Dropdown>
                    </>
                )}
            </div>
            <LoginModal
                visible={isLoginModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            />
        </div>
    )
}

export default Header
