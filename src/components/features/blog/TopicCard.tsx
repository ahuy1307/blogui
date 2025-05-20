import React from 'react'
import { Link } from '@/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/other-ui/Card'
import { Topic } from '@/types/interface'
import { useLocale, useTranslations } from 'next-intl'

export default function TopicCard({ topic }: { topic: Topic }) {
    const locale = useLocale()
    const t = useTranslations('topic')

    return (
        <Link href={`/blog?topics=${topic.id}&sort=newest`} className="group">
            <Card className="bg-white border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 h-full">
                <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                        <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                            {topic.tenChuDe[locale]}
                        </CardTitle>
                        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                            {topic.soLuongBaiViet} blog
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-gray-600">
                        {topic.noiDung[locale]}
                    </CardDescription>
                </CardContent>
                <CardFooter>
                    <span className="text-purple-600 text-sm group-hover:text-purple-800 transition-colors font-medium">
                        {t('viewBlog')} →
                    </span>
                </CardFooter>
            </Card>
        </Link>
    )
}
