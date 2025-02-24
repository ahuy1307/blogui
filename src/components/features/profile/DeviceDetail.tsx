import React from 'react'
import { FaDesktop, FaTabletAlt, FaMobileAlt } from 'react-icons/fa'
import { Card } from 'antd'
import { useTranslations } from 'next-intl'

interface Device {
    loaiThietBi: 'desktop' | 'tablet' | 'iphone'
    tenThietBi: string
    tenHeDieuHanh: string
    tenTrinhDuyet: string
    diaChi: string
    dangNhapCuoi: string
}

interface DeviceDetailProps {
    device: Device
    is_active?: boolean
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ device, is_active }) => {
    const t = useTranslations('profile.DeviceDetail')
    const renderIcon = () => {
        switch (device.loaiThietBi) {
            case 'desktop':
                return <FaDesktop size={26} />
            case 'tablet':
                return <FaTabletAlt size={26} />
            case 'iphone':
                return <FaMobileAlt size={26} />
            default:
                return null
        }
    }

    return (
        <div className="border border-[var(--border-color-default)] rounded-lg p-4">
            <div className="flex gap-6 items-center">
                {renderIcon()}
                <div className="flex flex-col gap-1">
                    <p className="font-bold text-base">{device.tenThietBi}</p>
                    <p className="text-sm">{device.diaChi}</p>
                    {!is_active && (
                        <p className="text-gray-500">{device.dangNhapCuoi}</p>
                    )}
                    <p>
                        {is_active && (
                            <span className="text-green-500">
                                {t('currentDevice')}
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default DeviceDetail
