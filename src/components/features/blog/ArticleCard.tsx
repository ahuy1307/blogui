import Link from 'next/link'
import Image from 'next/image'
import { BrainCircuit, Clock } from 'lucide-react'

interface ArticleCardProps {
    title: string
    description: string
    topic: string
    date: string
    slug?: string
    image: string
}

export function ArticleCard({
    title,
    description,
    topic,
    date,
    slug = '',
    image,
}: ArticleCardProps) {
    return (
        <Link href={`/blog/${slug}/`} className="group">
            <div className="space-y-3 h-full">
                <div className="relative h-48 rounded-lg overflow-hidden border border-gray-200 group-hover:border-purple-500/50 transition-colors">
                    <Image
                        src={image || '/images/default_image.jpg'}
                        alt={`${title} thumbnail`}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <div className="flex items-center gap-2 text-xs text-purple-500 mb-2">
                        <BrainCircuit className="h-4 w-4" />
                        <span>{topic}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {description}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{date}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
