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
    ngayXuatBan: string
    tacGia: IUser
    chuDes: Topic[]
    thanhPhans: BlogContent[]
    nguoiDungYeuThich: {
        hoTen: string
        avatar: string
        slug: string
        nguoiDungHienTai: boolean
    }[]
    daYeuThich: boolean
    daLuu: boolean
    blogCuaBan: boolean
}

export interface BlogMedia {
    id: string // Add optional id field
    loaiMedia: string
    noiDungMedia: {
        url: string
        date: string
        name: string
        size: number
    }
}

export interface BlogSearchParams {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
    topic?: number[]
    type?: string
}
  
export interface BlogSearchResponse {
    count: number
    next: string | null
    previous: string | null
    results: Blog[]
}

export interface Transaction {
    id: string
    createdAt: string
    updatedAt: string
    trangThai: "pending" | "accept" | "cancel" | "reject"
    hinhThucThanhToan: "VNPay" | "Momo"
    tongTien: number
    nguoiDung: string
    goiDangKy: string
    urlThanhToan: string
}
  