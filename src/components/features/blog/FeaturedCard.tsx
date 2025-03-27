import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/other-ui/card'
import { Clock, Eye, Heart } from 'lucide-react'
import { Blog } from '@/types/interface'
import { useLocale } from 'next-intl'

export function BlogFeatureCard({
    blog,
    icon,
}: {
    blog: Blog
    icon: ReactNode
}) {
    const locale = useLocale()

    return (
        <Card className="bg-white border-gray-200 overflow-hidden hover:border-purple-500/50 transition-colors shadow-sm h-full flex flex-col">
            <div className="relative h-48">
                <Image
                    src={blog.anhBia}
                    alt={blog.tieuDe}
                    fill
                    className="object-cover"
                />
            </div>
            <CardHeader className="flex-grow">
                {blog.chuDes.length > 0 &&
                    blog.chuDes.map((chuDe) => (
                        <span
                            key={chuDe.id}
                            className="text-xs text-purple-500 w-fit bg-purple-100 px-2 py-1 rounded-full"
                        >
                            {chuDe.tenChuDe[locale]}
                        </span>
                    ))}
                <CardTitle className="text-xl text-gray-900">
                    {blog.tieuDe}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-gray-600 line-clamp-3">
                    {blog.noiDungNgan}
                </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-gray-500 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
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
                            <Heart className="h-4 w-4" />
                            <span>{blog.luotYeuThich}</span>
                        </div>
                    )}
                    <Link
                        href={`/blog/${blog.slug}/`}
                        className="text-purple-500 hover:text-purple-700"
                    >
                        Read more →
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
