// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-24 22:40:59"
//

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DeviceDetail from './DeviceDetail'
import DeviceLogoutCheckbox from './DeviceLogoutCheckbox'
import { IoReturnUpBack } from 'react-icons/io5'
import { useAuth } from '@/contexts/auth/AuthContext'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { message, Switch } from 'antd'

const ManageDevices = ({ currentDevice, otherDevices, refetch }: any) => {
    const t = useTranslations('profile.ManageDevices')
    const { user } = useAuth()
    const [isLogoutDevices, setIsLogoutDevices] = useState(false)
    const [alertNewDevices, setAlertNewDevices] = useState(
        user?.canhBaoThietBi || false
    )
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setAlertNewDevices(user.canhBaoThietBi || false)
        }
    }, [user])

    const handleToggleDeviceAlert = async (checked: boolean) => {
        try {
            setIsLoading(true)
            await authenticationService.setInformationUser({
                canhBaoThietBi: checked,
            })
            setAlertNewDevices(checked)
            message.success(t('deviceAlertUpdated'))
        } catch (error) {
            message.error(t('errorUpdatingDeviceAlert'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="px-2 md:px-0">
            <div className="flex items-center justify-between mb-4 p-4 bg-[var(--bg-secondary)] rounded-lg shadow-sm">
                <div className="flex flex-col">
                    <span className="text-sm md:text-base font-semibold">
                        {t('deviceAlertTitle')}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500 mt-1">
                        {t('deviceAlertDescription')}
                    </span>
                </div>
                <Switch
                    checked={alertNewDevices}
                    onChange={handleToggleDeviceAlert}
                    loading={isLoading}
                    style={{
                        backgroundColor: alertNewDevices
                            ? 'var(--text-color-hyperlink)'
                            : 'gray',
                    }}
                />
            </div>

            <p className="py-2 font-bold text-lg">{t('currentDevice')}</p>
            <DeviceDetail device={currentDevice} isActive />
            {isLogoutDevices && (
                <div
                    className="inline-flex items-center gap-2 pt-6 cursor-pointer hover:text-[var(--text-color-hyperlink)]"
                    onClick={() => setIsLogoutDevices(false)}
                >
                    <IoReturnUpBack size={22} className="md:size-[26px]" />
                    <span className="text-sm md:text-base">{t('back')}</span>
                </div>
            )}
            {!isLogoutDevices ? (
                <>
                    <div className="pt-6 pb-4 flex flex-col sm:flex-row justify-between text-base md:text-lg items-start sm:items-center">
                        <p className="font-bold">{t('otherDevices')}</p>
                        {otherDevices.length > 0 && (
                            <p
                                onClick={() => setIsLogoutDevices(true)}
                                className="text-red-500 font-bold cursor-pointer text-sm md:text-base mt-2 sm:mt-0"
                            >
                                {t('selectDevicesLogout')}
                            </p>
                        )}
                    </div>
                    {otherDevices.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {otherDevices.map((device: any) => (
                                <DeviceDetail
                                    key={device.idThietBi}
                                    device={device}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-base text-center italic pt-4">
                            {t('noOtherDevices')}
                        </p>
                    )}
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    <DeviceLogoutCheckbox
                        otherDevices={otherDevices}
                        refetch={refetch}
                    />
                </div>
            )}
        </div>
    )
}

export default ManageDevices
