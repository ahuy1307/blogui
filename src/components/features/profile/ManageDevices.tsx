// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-24 22:40:59"
//

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import DeviceDetail from './DeviceDetail'
import DeviceLogoutCheckbox from './DeviceLogoutCheckbox'
import { IoReturnUpBack } from 'react-icons/io5'

const ManageDevices = ({ currentDevice, otherDevices, refetch }: any) => {
    const t = useTranslations('profile.ManageDevices')
    const [isLogoutDevices, setIsLogoutDevices] = useState(false)

    return (
        <div>
            <p className="py-2 font-bold text-lg">{t('currentDevice')}</p>
            <DeviceDetail device={currentDevice} isActive />
            {isLogoutDevices && (
                <div
                    className="inline-flex items-center gap-2 pt-6 cursor-pointer hover:text-[var(--text-color-hyperlink)]"
                    onClick={() => setIsLogoutDevices(false)}
                >
                    <IoReturnUpBack size={26} />
                    <span className="text-base">{t('back')}</span>
                </div>
            )}
            {!isLogoutDevices ? (
                <>
                    <div className="pt-6 pb-4 flex justify-between text-lg items-center">
                        <p className="font-bold">{t('otherDevices')}</p>
                        {otherDevices.length > 0 && (
                            <p
                                onClick={() => setIsLogoutDevices(true)}
                                className="text-red-500 font-bold cursor-pointer text-base"
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
