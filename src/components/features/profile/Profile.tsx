// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-23 20:52:30"
//

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { MdOutlineEdit } from 'react-icons/md'
import { FaRegUser } from 'react-icons/fa'
import { MdDevices } from 'react-icons/md'
import { useSearchParams } from 'next/navigation'

import { getInitials } from '@/helper/utils'
import { useAuth } from '@/contexts/auth/AuthContext'
import Avatar from '@/components/ui/Avatar/Avatar'
import AvatarUploadModal from './AvatarUploadModal'
import PersonalInfomation from './PersonalInfomation'
import { useQuery } from '@tanstack/react-query'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { getFingerprint } from '@/helper/utils'
import ManageDevices from './ManageDevices'
import { useRouter } from '@/navigation'
import { IoShareSocialOutline } from 'react-icons/io5'
import UpdateSocialLinks from './UpdateSocialLinks'
import { IoIosLock } from 'react-icons/io'
import ChangePassword from './ChangePassword'

const Profile = () => {
    const t = useTranslations('profile')
    const tabSelected = useSearchParams().get('tab')
    const [selectedItem, setSelectedItem] = useState<string>(
        tabSelected || 'profile'
    )
    const router = useRouter()
    const { user, dispatch } = useAuth()
    const [showModalUploadAvatar, setShowModalUploadAvatar] = useState(false)
    const [currentDevice, setCurrentDevice] = useState<any>(null)
    const [otherDevices, setOtherDevices] = useState([])

    const fullName = `${user?.ho ?? ''} ${user?.ten ?? ''}`.trim()
    const firstCharName =
        fullName !== ''
            ? getInitials(fullName, user?.email ?? '')
            : getInitials('', user?.email ?? '')

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['devices'],
        queryFn: () => authenticationService.getAllDevices(),
    })

    useEffect(() => {
        const findCurrentDevice = async () => {
            const finger = await getFingerprint()
            const matchedDevice = data.find(
                (device: any) => device.idThietBi === finger
            )

            setCurrentDevice(matchedDevice)
            setOtherDevices(
                data.filter((device: any) => device.idThietBi !== finger)
            )
        }

        if (data) findCurrentDevice()
    }, [data])

    useEffect(() => {
        if (tabSelected) setSelectedItem(tabSelected)
    }, [tabSelected])

    return (
        <div className="flex gap-14">
            <div className="w-[30%]">
                <div className="flex gap-8 items-center border border-[var(--border-color-default)] p-4 rounded-tl-md rounded-tr-md">
                    <AvatarUploadModal
                        isOpen={showModalUploadAvatar}
                        onClose={() => setShowModalUploadAvatar(false)}
                    />
                    <div
                        className="relative cursor-pointer hover:opacity-70"
                        onClick={() => setShowModalUploadAvatar(true)}
                    >
                        <Avatar
                            size={80}
                            className="bg-[var(--text-color-brand)] cursor-pointer"
                            src={
                                user?.avatar && user.avatar !== ''
                                    ? user.avatar
                                    : undefined
                            }
                        >
                            <p className="text-2xl">
                                {user?.avatar && user.avatar !== ''
                                    ? null
                                    : firstCharName}
                            </p>
                        </Avatar>
                        <div className="bg-gray-200 flex justify-center items-center shadow-lg rounded-full w-fit p-2 absolute -bottom-2 -right-2">
                            <MdOutlineEdit size={20} />
                        </div>
                    </div>
                    <div className="text-lg">
                        <p>{t('hello')} 👋</p>
                        <p className="font-bold">
                            {user?.ho} {user?.ten}
                        </p>
                    </div>
                </div>
                <ul className="border border-[var(--border-color-default)] p-4 rounded-bl-md rounded-br-md flex flex-col gap-4 text-base">
                    <li
                        className={`flex items-center p-4 rounded-md cursor-pointer ${
                            selectedItem === 'profile'
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-200'
                        }`}
                        onClick={() => {
                            setSelectedItem('profile')
                            router.push('/profile?tab=profile')
                        }}
                    >
                        <FaRegUser className="inline-block mr-4" size={18} />
                        {t('updatePersonalInformation')}
                    </li>
                    <li
                        className={`flex items-center p-4 rounded-md cursor-pointer ${
                            selectedItem === 'device'
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-200'
                        }`}
                        onClick={() => {
                            setSelectedItem('device')
                            router.push('/profile?tab=device')
                        }}
                    >
                        <MdDevices className="inline-block mr-4" size={20} />
                        {t('manageDevices')}
                    </li>
                    <li
                        className={`flex items-center p-4 rounded-md cursor-pointer ${
                            selectedItem === 'social'
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-200'
                        }`}
                        onClick={() => {
                            setSelectedItem('social')
                            router.push('/profile?tab=social')
                        }}
                    >
                        <IoShareSocialOutline
                            className="inline-block mr-4"
                            size={20}
                        />
                        {t('socialLinks')}
                    </li>
                    <li
                        className={`flex items-center p-4 rounded-md cursor-pointer ${
                            selectedItem === 'change-password'
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-200'
                        }`}
                        onClick={() => {
                            setSelectedItem('change-password')
                            router.push('/profile?tab=change-password')
                        }}
                    >
                        <IoIosLock
                            className="inline-block mr-4 relative top-[-2px]"
                            size={20}
                        />
                        {t('changePassword')}
                    </li>
                </ul>
            </div>
            <div className="flex-1">
                {selectedItem === 'profile' && (
                    <>
                        <p className="font-bold text-2xl pb-2">
                            {t('updatePersonalInfo')}
                        </p>
                        <PersonalInfomation />
                    </>
                )}
                {selectedItem === 'device' && (
                    <>
                        <p className="font-bold text-2xl pb-2">
                            {t('manageDevices')}
                        </p>
                        {currentDevice && (
                            <ManageDevices
                                currentDevice={currentDevice}
                                otherDevices={otherDevices}
                                refetch={refetch}
                            />
                        )}
                    </>
                )}
                {selectedItem === 'social' && (
                    <>
                        <p className="font-bold text-2xl pb-2">
                            {t('socialLinks')}
                        </p>
                        <UpdateSocialLinks />
                    </>
                )}
                {selectedItem === 'change-password' && (
                    <>
                        <p className="font-bold text-2xl pb-2">
                            {t('changePassword')}
                        </p>
                        <ChangePassword />
                    </>
                )}
            </div>
        </div>
    )
}

export default Profile
