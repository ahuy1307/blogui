import { Mail, Rss } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { FaLinkedin } from 'react-icons/fa'
import { CiTwitter } from 'react-icons/ci'
import { brandName } from '@/core/config/appConfig'
import { Topic } from '@/types/interface'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/navigation'

export function Footer({ topics }: { topics: Topic[] }) {
    const t = useTranslations('landing.Footer')
    const locale = useLocale()

    return (
        <footer className="border-t border-gray-200 py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="text-xl font-bold tracking-tighter"
                        >
                            <span className="text-purple-500">{brandName}</span>
                        </Link>
                        <p className="text-gray-600 text-sm">
                            {t('description')}
                        </p>
                        <div className="flex space-x-4">
                            <Link
                                href="#"
                                className="text-gray-500 hover:text-gray-900"
                                onClick={(e) => e.preventDefault()}
                            >
                                <CiTwitter className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-500 hover:text-gray-900"
                                onClick={(e) => e.preventDefault()}
                            >
                                <FaGithub className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-500 hover:text-gray-900"
                                onClick={(e) => e.preventDefault()}
                            >
                                <FaLinkedin className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-500 hover:text-gray-900"
                                onClick={(e) => e.preventDefault()}
                            >
                                <Rss className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4 text-gray-900">
                            {t('topics')}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {topics.map((topic, index) => (
                                <li key={index}>
                                    <Link
                                        href={`/blog?topics=${topic.id}&sort=newest`}
                                        className="hover:text-gray-900"
                                    >
                                        {topic.tenChuDe[locale]}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4 text-gray-900">
                            {t('others')}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="hover:text-gray-900 cursor-pointer">
                                {t('tutorials')}
                            </li>
                            <li className="hover:text-gray-900 cursor-pointer">
                                {t('researchPapers')}
                            </li>
                            <li className="hover:text-gray-900 cursor-pointer">
                                {t('aboutUs')}
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4 text-gray-900">
                            {t('contact')}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <a
                                    href="mailto:phamanhhuy22@gmail.com"
                                    className="hover:text-gray-900 transition-colors"
                                >
                                    phamanhhuy22@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 mt-12 pt-6 text-sm text-gray-600 text-center">
                    <p>
                        © {new Date().getFullYear()} {brandName}. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
