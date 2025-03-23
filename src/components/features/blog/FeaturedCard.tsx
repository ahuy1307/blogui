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

interface FeaturedCardProps {
    title: string
    description: string
    image: string
    date: string
    category: string
    icon: ReactNode
    slug?: string
    views?: number
    favorites?: number
}

export function FeaturedCard({
    title,
    description,
    image,
    date,
    category,
    icon,
    slug = '',
    views,
    favorites,
}: FeaturedCardProps) {
    return (
        <Card className="bg-white border-gray-200 overflow-hidden hover:border-purple-500/50 transition-colors shadow-sm h-full flex flex-col">
            <div className="relative h-48">
                <Image
                    src={image || '/placeholder.svg'}
                    alt={title}
                    fill
                    className="object-cover"
                />
            </div>
            <CardHeader className="flex-grow">
                <div className="flex items-center gap-2 text-sm text-purple-500 mb-2">
                    {icon}
                    <span>{category}</span>
                </div>
                <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-gray-600 line-clamp-3">
                    {description}
                </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-gray-500 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{date}</span>
                </div>
                <div className="flex items-center gap-3">
                    {views !== undefined && (
                        <div className="flex items-center gap-1 text-gray-500">
                            <Eye className="h-4 w-4" />
                            <span>{views}</span>
                        </div>
                    )}
                    {favorites !== undefined && (
                        <div className="flex items-center gap-1 text-gray-500">
                            <Heart className="h-4 w-4" />
                            <span>{favorites}</span>
                        </div>
                    )}
                    <Link
                        href={`/blog/${slug}/`}
                        className="text-purple-500 hover:text-purple-700"
                    >
                        Read more →
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
