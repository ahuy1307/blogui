import { Blog } from './interface'

export type NotificationType = 'liked' | 'comment'

export interface Notification {
    id: string
    daDoc: boolean
    loaiThongBao: NotificationType
    baiViet: Blog
    noiDung: string
    thongTinNguoiCuoiCungThucHien: {
        hoTen: string
        avatar: string
    }
    createdAt: string
    danhSachNguoiCungThucHien: string[]
}
