export interface LanguageTranslations {
    en: string
    vi: string
    [key: string]: string // Add index signature
}

export interface Topic {
    id: number
    tenChuDe: LanguageTranslations
    noiDung: LanguageTranslations
    soLuongBaiViet: number
}

export interface BlogContent {
    id: string
    createdAt: string
    updatedAt: string
    loaiThanhPhan: string
    noiDung: string
    dinhDang: object
    hang: number
    cot: number
}

export interface Blog {
    id: string
    createdAt: string
    updatedAt: string
    isDeleted: boolean
    deletedAt?: string
    tieuDe: string
    noiDungNgan: string
    anhBia: string
    thoiGianDoc: number
    luotYeuThich: number
    luotXem: number
    noiDungTomTat: string
    slug: string
    daXuatBan: boolean
    tacGia: IUser
    chuDes: Topic[]
    nguoiDungYeuThich: {
        hoTen: string
        avatar: string
        slug: string
    }[]
}
