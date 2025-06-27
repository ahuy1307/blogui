import Image from 'next/image'
import type { ReactNode } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/other-ui/Card'
import { Clock, Eye, Heart } from 'lucide-react'
import { Blog } from '@/types/interface'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { FaHeart } from 'react-icons/fa'
import { useMutation } from '@tanstack/react-query'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { toast } from '@/components/other-ui/useToast'

export function SavedLikeBlog({
    blog,
    refetch,
    type,
    countTopics = 4,
}: {
    blog: Blog
    type: string
    refetch: () => void
    countTopics?: number
}) {
    const t = useTranslations('blog')
    const locale = useLocale()

    const { mutate } = useMutation({
        mutationFn: authenticationService.saveOrLikeBlog,
        onSuccess: (res) => {
            toast({
                title: t('successTitle'),
                description: res.data.message,
            })
            refetch()
        },
        onError: (res: any) => {
            toast({
                title: t('errorTitle'),
                description: res.response.data.errors.other[0],
                variant: 'destructive',
            })
        },
    })

    const handleAction = (actionType: 'saved' | 'liked') => {
        mutate({
            baiViet: blog.id,
            loaiDanhDau: actionType,
        })
    }

    return (
        <Card className="bg-white border-gray-200 overflow-hidden hover:border-purple-500/50 transition-all shadow-sm h-full flex flex-col duration-300 rounded-xl">
            <div className="relative h-52">
                <Image
                    src={blog.anhBia}
                    alt={blog.tieuDe}
                    fill
                    className="object-cover"
                />
            </div>
            <CardHeader className="flex-grow">
                <div className="flex gap-2">
                    {blog.chuDes &&
                        blog.chuDes.slice(0, countTopics).map((chuDe) => (
                            <span
                                key={chuDe.id}
                                className="text-xs text-purple-500 w-fit bg-purple-100 px-2 py-1 rounded-full"
                            >
                                {chuDe.tenChuDe[locale]}
                            </span>
                        ))}
                    {blog.chuDes && blog.chuDes.length > countTopics && (
                        <span className="text-xs text-purple-500 w-fit bg-purple-100 px-2 py-1 rounded-full">
                            +{blog.chuDes.length - countTopics}{' '}
                            {locale === 'en' ? 'more' : 'khác'}
                        </span>
                    )}
                </div>
                <CardTitle className="pt-2 text-xl text-gray-900">
                    {blog.tieuDe}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-gray-600 line-clamp-3">
                    {blog.noiDungTomTat}
                </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-gray-500 border-t border-gray-100 mt-auto pt-4">
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                        {new Date(blog.ngayXuatBan).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {blog.luotXem !== 0 && (
                        <div className="flex items-center gap-1 text-gray-500">
                            <Eye className="h-4 w-4" />
                            <span>{blog.luotXem}</span>
                        </div>
                    )}
                    {blog.luotYeuThich !== 0 && (
                        <div className="flex items-center gap-1 text-gray-500">
                            <Heart className="h-4 w-4 " />
                            <span>{blog.luotYeuThich}</span>
                        </div>
                    )}
                    {type === 'saved' && (
                        <button
                            onClick={() => handleAction('saved')}
                            className="text-red-500 hover:text-red-700"
                        >
                            {t('unSave')}
                        </button>
                    )}
                    {type === 'liked' && (
                        <button
                            onClick={() => handleAction('liked')}
                            className="text-red-500 hover:text-red-700"
                        >
                            {t('unLike')}
                        </button>
                    )}
                    {/*  */}
                    <Link
                        href={`/blog/${blog.slug}`}
                        className="text-purple-500 hover:text-purple-700"
                    >
                        {t('readMore')} →
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
