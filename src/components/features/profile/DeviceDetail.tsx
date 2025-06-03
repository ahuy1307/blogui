import React from 'react'
import { FaDesktop, FaTabletAlt, FaMobileAlt } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import Checkbox from '@/components/ui/CheckBox/CheckBox'

interface Device {
    idThietBi: string
    loaiThietBi: 'desktop' | 'tablet' | 'mobile'
    tenThietBi: string
    tenHeDieuHanh: string
    tenTrinhDuyet: string
    diaChi: string
    dangNhapCuoi: string
}

interface DeviceDetailProps {
    device: Device
    isActive?: boolean
    haveCheckbox?: boolean
    isChecked?: boolean
    onCheckboxChange?: (deviceId: string) => void
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({
    device,
    isActive,
    haveCheckbox,
    isChecked,
    onCheckboxChange,
}) => {
    const t = useTranslations('profile.DeviceDetail')
    const renderIcon = () => {
        switch (device.loaiThietBi) {
            case 'desktop':
                return <FaDesktop size={30} />
            case 'tablet':
                return <FaTabletAlt size={30} />
            case 'mobile':
                return <FaMobileAlt size={30} />
            default:
                return null
        }
    }

    return (
        <div className="border border-[var(--border-color-default)] rounded-lg px-10 py-2">
            <div className="flex gap-10 items-center">
                {renderIcon()}
                <div className="flex flex-col gap-1 flex-1">
                    <p className="font-bold text-base">{device.tenThietBi}</p>
                    <p className="text-sm">{device.diaChi}</p>
                    {!isActive && (
                        <p className="text-gray-500">{device.dangNhapCuoi}</p>
                    )}
                    <p>
                        {isActive && (
                            <span className="text-green-500">
                                {t('currentDevice')}
                            </span>
                        )}
                    </p>
                </div>
                <div className="float-right">
                    {haveCheckbox && (
                        <Checkbox
                            onChange={() =>
                                onCheckboxChange &&
                                onCheckboxChange(device.idThietBi)
                            }
                            checked={isChecked}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default DeviceDetail
