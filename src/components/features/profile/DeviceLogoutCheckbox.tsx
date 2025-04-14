// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-25 23:05:08"
//

import { useState } from 'react'
import { message } from 'antd'
import { useTranslations } from 'next-intl'
import DeviceDetail from './DeviceDetail'
import Button from '@/components/ui/Button/Button'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useMutation } from '@tanstack/react-query'

const DeviceLogoutCheckbox = ({ otherDevices, refetch }: any) => {
    const t = useTranslations('profile.DeviceLogoutCheckbox')
    const [selectedDevices, setSelectedDevices] = useState<string[]>([])

    const handleCheckboxChange = (deviceId: string) => {
        setSelectedDevices((prev) =>
            prev.includes(deviceId)
                ? prev.filter((id) => id !== deviceId)
                : [...prev, deviceId]
        )
    }

    const { mutate: logoutDevices, isPending } = useMutation({
        mutationFn: authenticationService.logoutOptions,
        onSuccess: (res) => {
            message.success(res.data.message)
            refetch()
            setSelectedDevices([])
        },
        onError: () => {
            message.error(t('logoutFailed'))
        },
    })

    const handleSelectAllDevices = () => {
        if (selectedDevices.length === otherDevices.length) {
            // Deselect all devices
            setSelectedDevices([])
        } else {
            // Select all devices
            setSelectedDevices(
                otherDevices.map((device: any) => device.idThietBi)
            )
        }
    }

    const handleLogoutDevices = () => {
        logoutDevices({ device_ids: selectedDevices })
    }

    return (
        <div>
            <p className="pt-2 pb-1 font-bold text-lg">{t('logoutDevices')}</p>
            <p className="text-base">{t('logoutDeviceDescription')}</p>
            <div className="flex items-center justify-between py-3 text-base">
                <p>
                    {selectedDevices.length} {t('devicesSelected')}
                </p>
                <p
                    className="font-bold text-[var(--text-color-hyperlink)] cursor-pointer"
                    onClick={handleSelectAllDevices}
                >
                    {t('selectAllDevices')}
                </p>
            </div>
            <div className="flex flex-col gap-4">
                {otherDevices.map((device: any) => (
                    <DeviceDetail
                        key={device.idThietBi}
                        device={device}
                        haveCheckbox
                        onCheckboxChange={handleCheckboxChange}
                        isChecked={selectedDevices.includes(device.idThietBi)}
                    />
                ))}
            </div>
            <div className="text-right pt-4">
                <Button
                    shape="square"
                    type="primary"
                    disabled={isPending}
                    onClick={handleLogoutDevices}
                >
                    {t('logout')}
                </Button>
            </div>
        </div>
    )
}

export default DeviceLogoutCheckbox
