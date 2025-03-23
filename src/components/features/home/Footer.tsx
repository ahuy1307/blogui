import Link from 'next/link'
import { Mail, Rss } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { FaLinkedin } from 'react-icons/fa'
import { CiTwitter } from 'react-icons/ci'

export function Footer() {
    return (
        <footer className="border-t border-gray-200 py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="text-xl font-bold tracking-tighter"
                        >
                            Neural<span className="text-purple-500">Pulse</span>
                        </Link>
                        <p className="text-gray-600 text-sm">
                            Exploring the cutting edge of artificial
                            intelligence and machine learning.
                        </p>
                        <div className="flex space-x-4">
                            <Link
                                href="#"
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <CiTwitter className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <FaGithub className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <FaLinkedin className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <Rss className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4 text-gray-900">
                            Topics
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Artificial Intelligence
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Generative AI
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Computer Vision
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Deep Learning
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Machine Learning
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4 text-gray-900">
                            Resources
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Tutorials
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Research Papers
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Code Samples
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Datasets
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Tools
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4 text-gray-900">
                            Contact
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>info@neuralpulse.ai</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 mt-12 pt-6 text-sm text-gray-600">
                    <p>
                        © {new Date().getFullYear()} NeuralPulse. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
