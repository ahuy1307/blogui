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
import { Dropdown, Tooltip, Drawer } from 'antd'
import {
    Menu,
    X,
    Pencil,
    Book,
    Coins,
    User,
    Settings,
    FileText,
    Smartphone,
    CreditCard,
    LogOut,
    Home,
    Grid,
    FileTextIcon,
    Tag,
    ChevronRight,
    Bookmark,
    Target,
    Bell,
    Library,
} from 'lucide-react'

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
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { Button as OtherButton } from '@/components/other-ui/Button'
import { MissionsDropdown } from '@/components/mission/MissionDropdown'
import { useNotificationStore } from '@/store/notification-store'
import { useMissions } from '@/hooks/useMissions'

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

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

    const handleMobileNavigation = (path: string) => {
        router.push(path)
        setIsMobileMenuOpen(false)
    }

    const navLinks = [
        { href: '/', label: t('home'), icon: <Home size={18} /> },
        { href: '/topics', label: t('topics'), icon: <Tag size={18} /> },
        { href: '/blog', label: t('blog'), icon: <FileTextIcon size={18} /> },
        {
            href: '/pricing',
            label: t('pricing'),
            icon: <CreditCard size={18} />,
        },
    ]

    const profileMenuItems = [
        {
            key: '0',
            label: t('personalInfomation'),
            icon: <User size={18} />,
            onClick: () => router.push(`/info/${user?.slug}`),
        },
        {
            key: '1',
            label: t('updatePersonalInformation'),
            icon: <Settings size={18} />,
            onClick: () => router.push('/profile?tab=profile'),
        },
        {
            key: '2',
            label: t('myBlogs'),
            icon: <FileText size={18} />,
            onClick: () => router.push('/profile/blogs'),
        },
        {
            key: '3',
            label: t('manageDevices'),
            icon: <Smartphone size={18} />,
            onClick: () => router.push('/profile?tab=device'),
        },
        {
            key: '4',
            label: t('manageTransactions'),
            icon: <CreditCard size={18} />,
            onClick: () => router.push('/transaction-history'),
        },
        {
            key: '5',
            label: t('logout'),
            icon: <LogOut size={18} />,
            onClick: () => setIsConfirmLogout(true),
        },
    ]

    // Update the items for the dropdown menu
    const items: IDropdownMenu['items'] = profileMenuItems
    const { unreadCount } = useNotificationStore()
    const {
        missions,
        fetchUserTasks,
        collectTaskReward,
        fetchTransactionHistory,
    } = useMissions()
    const unclaimedMissions = missions.filter(
        (mission) => mission.completed && !mission.claimed
    )
    const hasUnclaimedRewards = unclaimedMissions.length > 0

    return (
        <>
            <div className="fixed z-[200] left-0 right-0 top-0 border-[var(--border-color-default)] border-b flex justify-between items-center px-4 h-[70px] sm:px-6 md:px-[36px] lg:px-8 xl:px-[120px] bg-white lg:backdrop-blur-xl lg:bg-white/50">
                <ModalConfirm
                    open={isConfirmLogout}
                    onCancel={setIsConfirmLogout}
                    title={t('logout')}
                    description={t('confirmLogout')}
                    onClickConfirm={handleLogout}
                />

                <div className="flex items-center flex-1">
                    {/* Mobile menu button - visible only on small screens */}
                    <button
                        className="sm:hidden flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label="Open mobile menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Sidebar toggle - visible only on md screens */}
                    <button
                        className="hidden md:flex lg:hidden items-center p-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <Link href={`/`} className="flex-shrink-0 mx-auto sm:mx-0">
                        <Logo />
                    </Link>

                    {/* Desktop Navigation - visible on lg screens and up */}
                    <nav className="hidden lg:flex items-center ml-10 space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-base hover:text-purple-500 font-bold transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Desktop Actions - hide most on mobile */}
                <div className="flex items-center gap-2 lg:gap-4">
                    <div className="hidden sm:block">
                        <SwitchLanguage />
                    </div>

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
                            className="whitespace-nowrap hidden sm:flex"
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            {t('writeBlog')}
                        </Button>
                    )}

                    {!isAuthenticated ? (
                        <>
                            <Button
                                type="primary"
                                size="middle"
                                shape="square"
                                onClick={showModal}
                                className="hidden sm:block"
                            >
                                {t('login')}
                            </Button>
                            <Link
                                href={'/auth/register'}
                                className="hidden sm:block"
                            >
                                <Button
                                    type="primary"
                                    size="middle"
                                    shape="square"
                                >
                                    {t('register')}
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="hidden sm:flex items-center space-x-1">
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
                                <Link
                                    href="/profile/coin-history"
                                    className="relative"
                                >
                                    <Tooltip title={'Coins'}>
                                        <OtherButton
                                            variant="ghost"
                                            className="flex items-center gap-1.5 px-2 lg:px-3"
                                            aria-label="Coins"
                                        >
                                            <Coins
                                                className="h-5 w-5 text-amber-500"
                                                style={{
                                                    width: '21px',
                                                    height: '21px',
                                                }}
                                            />
                                            <span className="text-sm font-bold hidden lg:inline">
                                                {user?.soLuongCoin || 0}
                                            </span>
                                        </OtherButton>
                                    </Tooltip>
                                </Link>
                            </div>
                            <div className="hidden sm:block relative">
                                <MissionsDropdown />
                            </div>
                            <div className="hidden sm:block relative">
                                <NotificationDropdown />
                            </div>
                            <Dropdown menu={{ items }} placement="bottomRight">
                                <Avatar
                                    size={36}
                                    className="bg-[var(--text-color-brand)] cursor-pointer hover:opacity-90 transition-opacity"
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

            {/* Sidebar for md screens */}
            <div
                className={`fixed top-[70px] bottom-0 left-0 w-[280px] bg-white border-r border-[var(--border-color-default)] z-[199] transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} hidden md:block lg:hidden`}
            >
                <div className="flex flex-col h-full overflow-y-auto">
                    <nav className="flex-grow py-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center px-6 py-3 text-base font-medium hover:bg-gray-50 hover:text-purple-500"
                            >
                                <div className="w-8 mr-3 text-gray-500">
                                    {link.icon}
                                </div>
                                {link.label}
                                <ChevronRight
                                    size={16}
                                    className="ml-auto text-gray-400"
                                />
                            </Link>
                        ))}
                    </nav>

                    {isAuthenticated && (
                        <div className="border-t border-gray-100 pt-2 pb-4">
                            <div className="px-6 py-3">
                                <div className="flex items-center mb-4">
                                    <Avatar
                                        size={48}
                                        className="bg-[var(--text-color-brand)]"
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
                                    <div className="ml-3">
                                        <p className="font-medium">
                                            {fullName ||
                                                user?.email?.split('@')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <Coins className="w-5 h-5 text-amber-500 mr-2" />
                                        <span className="text-sm font-medium">
                                            {user?.soLuongCoin || 0} coins
                                        </span>
                                    </div>
                                    <Link
                                        href="/profile/coin-history"
                                        className="text-xs text-purple-500 hover:underline"
                                    >
                                        View History
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-2">
                                {profileMenuItems.slice(0, -1).map((item) => (
                                    <button
                                        key={item.key}
                                        className="flex w-full items-center px-6 py-2.5 text-sm hover:bg-gray-50 hover:text-purple-500"
                                        onClick={item.onClick}
                                    >
                                        <div className="w-6 mr-3 text-gray-500">
                                            {item.icon}
                                        </div>
                                        {item.label}
                                    </button>
                                ))}

                                <button
                                    className="flex w-full items-center px-6 py-2.5 text-sm hover:bg-gray-50 text-red-500 mt-2"
                                    onClick={() => setIsConfirmLogout(true)}
                                >
                                    <div className="w-6 mr-3">
                                        {profileMenuItems[5].icon}
                                    </div>
                                    {profileMenuItems[5].label}
                                </button>
                            </div>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="border-t border-gray-100 p-6 mt-auto">
                            <Button
                                type="primary"
                                size="middle"
                                block
                                onClick={showModal}
                                className="mb-3"
                            >
                                {t('login')}
                            </Button>
                            <Button
                                type="default"
                                size="middle"
                                block
                                onClick={() => router.push('/auth/register')}
                            >
                                {t('register')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[198] hidden md:block lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Menu Drawer - more comprehensive for mobile */}
            <Drawer
                placement="left"
                onClose={() => setIsMobileMenuOpen(false)}
                open={isMobileMenuOpen}
                width="85%"
                closeIcon={<X className="h-5 w-5" />}
            >
                <div className="flex flex-col h-full">
                    <div className="flex-grow overflow-y-auto">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <Logo />
                            <SwitchLanguage />
                        </div>

                        <nav className="flex flex-col py-4">
                            {navLinks.map((link, index) => (
                                <button
                                    key={link.href}
                                    className="flex items-center text-lg font-medium py-3.5 px-6 hover:text-purple-500 hover:bg-gray-50 text-left transition-colors"
                                    onClick={() =>
                                        handleMobileNavigation(link.href)
                                    }
                                >
                                    <div className="w-6 mr-3 text-gray-500">
                                        {link.icon}
                                    </div>
                                    <p className="text-sm sm:text-base">
                                        {link.label}
                                    </p>
                                    <ChevronRight
                                        size={16}
                                        className="ml-auto text-gray-400"
                                    />
                                </button>
                            ))}

                            {!isWrite && (
                                <button
                                    className="flex items-center text-lg font-medium py-3.5 px-6 hover:text-purple-500 hover:bg-gray-50 text-left transition-colors text-purple-500"
                                    onClick={() => {
                                        if (isAuthenticated) {
                                            router.push('/write')
                                        } else {
                                            showModal()
                                        }
                                        setIsMobileMenuOpen(false)
                                    }}
                                >
                                    <div className="w-6 mr-3">
                                        <Pencil className="h-4 w-4" />
                                    </div>
                                    <p className="text-sm sm:text-base">
                                        {t('writeBlog')}
                                    </p>
                                </button>
                            )}
                        </nav>

                        {isAuthenticated && (
                            <div className="mt-2 mb-6 space-y-5">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            size={50}
                                            className="bg-[var(--text-color-brand)]"
                                            src={
                                                user?.avatar &&
                                                user.avatar !== ''
                                                    ? user.avatar
                                                    : undefined
                                            }
                                        >
                                            {user?.avatar && user.avatar !== ''
                                                ? null
                                                : firstCharName}
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-lg">
                                                {fullName ||
                                                    user?.email?.split('@')[0]}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-3 border-t border-gray-200 pt-3">
                                        <Link
                                            href="/profile/coin-history"
                                            className="flex items-center gap-1.5"
                                        >
                                            <Coins className="h-5 w-5 text-amber-500" />
                                            <span className="font-medium">
                                                {user?.soLuongCoin || 0} coins
                                            </span>
                                        </Link>
                                        {/* <Link
                                            href={`/library`}
                                            className="flex items-center gap-1.5"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <Book className="h-5 w-5 text-blue-500" />
                                            <span className="font-medium">
                                                {t('library')}
                                            </span>
                                        </Link> */}
                                    </div>
                                </div>

                                {/* Notifications and Missions in mobile menu */}
                                <div className="flex justify-between p-4 bg-white rounded-lg border border-gray-100">
                                    <Link
                                        href="/notifications"
                                        className="flex flex-col items-center relative"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        <div className="p-2 rounded-full bg-gray-50">
                                            <Bell className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs mt-1">
                                            {t('notifications')}
                                        </span>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-sm flex items-center justify-center rounded-full">
                                                {unreadCount > 99
                                                    ? '99+'
                                                    : unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/missions"
                                        className="flex flex-col items-center relative"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        <div className="p-2 rounded-full bg-gray-50">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs mt-1">
                                            {t('missions')}
                                        </span>
                                        {hasUnclaimedRewards && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-sm flex items-center justify-center rounded-full">
                                                {unclaimedMissions.length}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/library"
                                        className="flex flex-col items-center"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        <div className="p-2 rounded-full bg-gray-50">
                                            <Book className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs mt-1">
                                            {t('library')}
                                        </span>
                                    </Link>
                                </div>

                                <div className="space-y-0 bg-white rounded-lg border border-gray-100">
                                    {profileMenuItems
                                        .slice(0, -1)
                                        .map((item, index) => (
                                            <button
                                                key={item.key}
                                                className={`flex w-full items-center text-left py-3.5 px-4 hover:text-purple-500 hover:bg-gray-50 transition-colors ${
                                                    index !== 0
                                                        ? 'border-t border-gray-100'
                                                        : ''
                                                }`}
                                                onClick={() => {
                                                    item.onClick?.()
                                                    setIsMobileMenuOpen(false)
                                                }}
                                            >
                                                <div className="w-6 mr-3 text-gray-500">
                                                    {item.icon}
                                                </div>
                                                <span>{item.label}</span>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 p-6">
                        {isAuthenticated ? (
                            <Button
                                type="default"
                                size="large"
                                block
                                onClick={() => {
                                    setIsConfirmLogout(true)
                                    setIsMobileMenuOpen(false)
                                }}
                                className="font-medium flex items-center justify-center"
                                danger
                            >
                                <LogOut size={16} className="mr-2" />
                                {t('logout')}
                            </Button>
                        ) : (
                            <div className="flex flex-col space-y-3">
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={() => {
                                        showModal()
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className="font-medium"
                                >
                                    {t('login')}
                                </Button>
                                <Button
                                    type="default"
                                    size="large"
                                    block
                                    onClick={() => {
                                        router.push('/auth/register')
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className="font-medium"
                                >
                                    {t('register')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default Header
