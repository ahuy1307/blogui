// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-24 20:22:02"
//

import { Form } from 'antd'
import dayjs from 'dayjs'
import { message, Input } from 'antd'
import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'

import InputFormItem from '@/components/ui/InputFormItem/InputFormItem'
import Button from '@/components/ui/Button/Button'
import { useAuth } from '@/contexts/auth/AuthContext'
import Select from '@/components/ui/Select/Select'
import DatePicker from '@/components/ui/DatePicker/DatePicker'
import { PhoneNumber } from '@/components/ui/PhoneNumber/PhoneNumber'
import CountryStateCitySelector from '@/components/ui/CountryRegion/CountryRegion'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { signIn } from '@/contexts/auth/reducers'

const PersonalInfomation = () => {
    const t = useTranslations('profile.PersonalInfomation')
    const { user, dispatch } = useAuth()
    const [form] = Form.useForm()

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
            handleSignIn()
            message.success(t('updateSuccessful'))
        },
        onError: () => {
            message.error(t('uploadFailed'))
        },
    })

    const onFinish = (values: any) => {
        const data = {
            ho: values.ho,
            ten: values.ten,
            ngaySinh: values.ngaySinh
                ? dayjs(values.ngaySinh).format('YYYY-MM-DD')
                : undefined,
            gioiTinh: values.gioiTinh,
            soDienThoai: values.soDienThoai,
            quocGia: values.quocGia,
            thanhPho: values.thanhPho,
            diaChi: values.diaChi,
            ngheNghiep: values.ngheNghiep,
            congTy: values.congTy,
        }
        SetInformationMutation(data)
    }

    return (
        <div className="border border-[var(--border-color-default)] rounded-lg px-3 lg:px-4 pt-4">
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={{
                    ho: user?.ho,
                    ten: user?.ten,
                    ngaySinh: user?.ngaySinh
                        ? dayjs(user?.ngaySinh, 'YYYY-MM-DD')
                        : null,
                    gioiTinh: user?.gioiTinh || 'male',
                    soDienThoai: user?.soDienThoai,
                    quocGia: user?.quocGia || 'VN',
                    thanhPho: user?.thanhPho || 'DN',
                    diaChi: user?.diaChi,
                    ngheNghiep: user?.ngheNghiep,
                    congTy: user?.congTy,
                }}
            >
                <Form.Item>
                    <div className="flex flex-col md:flex-row gap-4 mb-1">
                        <div className="w-full md:w-[25%]">
                            <span className="font-bold text-base pb-2 block">
                                {t('ho')}
                                <span className="ml-1 text-red-500">*</span>
                            </span>
                            <InputFormItem
                                name="ho"
                                placeholder={t('ho')}
                                type="first_name"
                                style={{ fontSize: '16px', height: '44px' }}
                            />
                        </div>
                        <div className="w-full md:w-[25%]">
                            <span className="font-bold text-base pb-2 block">
                                {t('ten')}
                                <span className="ml-1 text-red-500">*</span>
                            </span>
                            <InputFormItem
                                name="ten"
                                placeholder={t('ten')}
                                type="last_name"
                                style={{ fontSize: '16px', height: '44px' }}
                            />
                        </div>
                        <div className="w-full md:w-[50%]">
                            <p className="flex items-center font-bold text-base pb-2">
                                Email{''}
                                <span className="text-red-500 ml-1">*:</span>
                            </p>
                            <Input
                                size="large"
                                className="h-[44px]"
                                disabled
                                placeholder={user?.email}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                        <div className="w-full md:w-[50%]">
                            <span className="font-bold text-base pb-1 block">
                                {t('role')}
                            </span>
                            <InputFormItem
                                name="ngheNghiep"
                                placeholder={t('role')}
                                style={{ height: '44px', fontSize: '16px' }}
                                maxLength={255}
                                value={user?.ngheNghiep}
                            />
                        </div>
                        <div className="w-full md:w-[50%]">
                            <span className="font-bold text-base pb-1 block">
                                {t('company')}
                            </span>
                            <InputFormItem
                                name="congTy"
                                placeholder={t('company')}
                                style={{ height: '44px', fontSize: '16px' }}
                                maxLength={255}
                                value={user?.congTy}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-1">
                        <div className="w-full md:w-[25%]">
                            <p className="font-bold text-base pb-2">
                                {t('gioiTinh')}
                            </p>
                            <Form.Item name="gioiTinh">
                                <Select
                                    style={{ height: '44px' }}
                                    size="large"
                                    options={[
                                        {
                                            value: 'male',
                                            label: (
                                                <span className="text-base">
                                                    {t('genderOptions.male')}
                                                </span>
                                            ),
                                        },
                                        {
                                            value: 'female',
                                            label: (
                                                <span className="text-base">
                                                    {t('genderOptions.female')}
                                                </span>
                                            ),
                                        },
                                        {
                                            value: 'other',
                                            label: (
                                                <span className="text-base">
                                                    {t('genderOptions.other')}
                                                </span>
                                            ),
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </div>
                        <div className="w-full md:w-[25%]">
                            <p className="font-bold text-base pb-2">
                                {t('ngaySinh')}
                            </p>
                            <Form.Item
                                style={{ fontSize: '16px' }}
                                name="ngaySinh"
                            >
                                <DatePicker
                                    placeholder="dd/mm/yyyy"
                                    format={'DD/MM/YYYY'}
                                    allowClear={false}
                                    size="large"
                                    style={{ width: '100%', height: '44px' }}
                                />
                            </Form.Item>
                        </div>
                        <div className="w-full md:w-[50%]">
                            <p className="font-bold text-base pb-2">
                                {t('soDienThoai')}
                            </p>
                            <Form.Item name="soDienThoai">
                                <PhoneNumber valueNumber={user?.soDienThoai} />
                            </Form.Item>
                        </div>
                    </div>
                    <CountryStateCitySelector
                        initialCountry={user?.quocGia || 'VN'}
                        initialState={user?.thanhPho || 'DN'}
                        form={form}
                    />
                </Form.Item>
                <div>
                    <span className="font-bold text-base pb-1 block">
                        {t('address')}
                    </span>
                    <InputFormItem
                        name="diaChi"
                        placeholder={t('address')}
                        style={{ height: '44px', fontSize: '16px' }}
                        maxLength={255}
                        value={user?.diaChi}
                    />
                </div>
                <Form.Item className="text-right">
                    <Button type="primary" shape="square" htmlType="submit">
                        {t('saveInfo')}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default PersonalInfomation
