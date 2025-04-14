// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-17 22:04:33"
//

interface IUser {
    id: string // Added missing field
    ho: string
    ten: string
    fullName: string
    gioiTinh: 'male' | 'female' | 'other'
    soDienThoai?: string
    ngaySinh: string
    avatar: string
    quocGia?: string
    thanhPho?: string
    diaChi?: string
    canhBaoThietBi: boolean
    daDatMatKhau?: boolean
    ngheNghiep?: string
    congTy?: string
    mangXaHoi?: any
    slug: string
    daDatMatKhau: boolean
    email: string
    soLuongBaiViet: number
    soLuongThichBaiViet: number
    soLuongThongBao: number
}
interface IMenuItem {
    key: string
    label: string
    href: string
    children?: { key: string; label: string; href: string }[]
}
interface IHeaderMenu {
    [key: string]: IMenuItem[]
}
interface IDropdownMenu {
    [key: string]: MenuProps['items']
}

declare module '*.html' {
    const content: string
    export default content
}
