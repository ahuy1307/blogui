/* -*- coding: utf-8 -*-
 * //
 * // All rights reserved.
 * //
 * // __author__ = "phamanhhuy22@gmail.com"
 * // __date__ = "2025-03-08 18:57:26"
 */

'use client'

import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState, useRef } from 'react'
import { Image as ImageAntd, message } from 'antd'
import Image from 'next/image'

import { NAVIGATION_PATHS } from '@/constants/constants'
import { Link, useRouter } from '@/navigation'
import Avatar from '@/components/ui/Avatar/Avatar'
import { getInitials, formatNumber } from '@/helper/utils'
import { Spin } from 'antd'
import { useTranslations } from 'next-intl'
import { PiBuildingApartmentFill } from 'react-icons/pi'
import { FaLocationDot } from 'react-icons/fa6'
import { State, Country } from 'country-state-city'
import { SiGithub } from 'react-icons/si'
import { IoLogoLinkedin } from 'react-icons/io5'
import { FaFacebook } from 'react-icons/fa6'
import { MdOutlineEdit } from 'react-icons/md'
import { useAuth } from '@/contexts/auth/AuthContext'
import { signIn } from '@/contexts/auth/reducers'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/other-ui/Card'
import { Clock, Eye, Heart } from 'lucide-react'

export default function Page({ params }: any) {
    const t = useTranslations('profile')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { user, dispatch } = useAuth()
    const { slug, locale } = params
    const [profileData, setProfileData] = useState<any>(null)
    const router = useRouter()
    const fullName = `${profileData?.ho ?? ''} ${profileData?.ten ?? ''}`.trim()
    const firstCharName =
        fullName !== ''
            ? getInitials(fullName, profileData?.email ?? '')
            : getInitials('', profileData?.email ?? '')

    const { mutate, isPending } = useMutation({
        mutationFn: authenticationService.getUserProfileBySlug,
        onSuccess: (res) => {
            setProfileData(res.data)
        },
        onError: () => {
            router.push(NAVIGATION_PATHS.HOME)
        },
    })

    const { mutate: blogMutate, isPending: isBlogsPending } = useMutation({
        mutationFn: authenticationService.getBlogsByUserSlug,
        onSuccess: (res) => {
            setProfileData((prev: any) => ({
                ...prev,
                baiViets: res.data.results,
            }))
        },
        onError: () => {
            message.error(t('getBlogsFailed'))
        },
    })

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            await dispatch(
                signIn({ isAuthenticated: true, user: userInformation })
            )
        } catch (error) {}
    }

    const { mutate: updateProfile, isPending: isUpdateProfilePending } =
        useMutation({
            mutationFn: authenticationService.setInformationUser,
            onSuccess: () => {},
            onError: (err) => {
                message.error(t('uploadFailed'))
            },
        })

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/webp']
            if (!validImageTypes.includes(file.type)) {
                message.error('Chỉ hỗ trợ định dạng JPEG, PNG, WEBP!')
                return
            }

            const formData = {
                cover_action: 'update',
                cover_file: file,
            }
            updateProfile(formData)
            updateProfile(formData, {
                onSuccess: async () => {
                    const imageUrl = URL.createObjectURL(file)
                    handleSignIn()
                    setProfileData((prev: any) => ({
                        ...prev,
                        cover: imageUrl,
                    }))
                    message.success(t('uploadSuccess'))
                },
            })
        }
    }

    const pushToSocialLink = (link: string) => {
        if (!link) {
            message.info(t('socialLinkNotFound'))
            return
        }
        window.open(link, '_blank')
    }

    useEffect(() => {
        mutate({ slug })
        blogMutate({ slug })
    }, [])

    return (
        <div className="bg-gray-200 py-4 rounded-xl mt-[100px]">
            {isPending || !profileData ? (
                <div className="flex items-center justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                <div className="px-44">
                    <div className="w-full relative">
                        <ImageAntd
                            width="100%"
                            height={450}
                            className={`object-cover rounded-xl z-10 ${isUpdateProfilePending ? 'opacity-50' : ''}`}
                            src={
                                profileData?.cover ||
                                '/images/default_cover_photo.jpg'
                            }
                            alt=""
                        />
                        <div className="flex items-center justify-center absolute z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Spin
                                size="large"
                                spinning={isUpdateProfilePending}
                            />
                        </div>
                        {user && user.slug === profileData.slug && (
                            <>
                                <div
                                    className={`bg-gray-200 flex justify-center items-center shadow-lg rounded-full w-fit p-3 border border-gray-400 hover:opacity-70 absolute top-4 right-10 cursor-pointer z-30 ${
                                        isUpdateProfilePending
                                            ? 'opacity-50'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <MdOutlineEdit size={22} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={handleFileChange}
                                />
                            </>
                        )}
                        <div className="absolute -bottom-12 left-6 z-20 avatar-user">
                            <ImageAntd
                                alt=""
                                width={200}
                                height={200}
                                // size={200}
                                className="bg-[var(--text-color-brand)] cursor-pointer rounded-full object-cover"
                                src={
                                    profileData?.avatar &&
                                    profileData.avatar !== ''
                                        ? profileData.avatar
                                        : '/images/default_avatar.jpg'
                                }
                            ></ImageAntd>
                        </div>
                        {user && user.slug === profileData.slug && (
                            <div
                                className="bg-gray-200 flex justify-center items-center shadow-lg rounded-full w-fit p-3 border border-gray-400 hover:opacity-70 absolute -bottom-12 right-10 cursor-pointer z-30"
                                onClick={() => router.push(`/profile`)}
                            >
                                <MdOutlineEdit size={22} />
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded-bl-xl rounded-br-xl relative -top-2 py-20 px-10 flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <p className="text-3xl font-bold">
                                {profileData.ho} {profileData.ten}
                            </p>
                            <div className="flex items-center gap-2">
                                <PiBuildingApartmentFill />
                                {profileData.ngheNghiep &&
                                profileData.congTy ? (
                                    <p className="text-lg">
                                        {profileData.ngheNghiep} {t('at')}{' '}
                                        {profileData.congTy}
                                    </p>
                                ) : (
                                    <p>{t('undefined')}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-base pt-1">
                                <FaLocationDot />
                                {profileData.diaChi &&
                                profileData.thanhPho &&
                                profileData.quocGia ? (
                                    <p>
                                        {profileData.diaChi}
                                        {', '}
                                        {
                                            State.getStateByCodeAndCountry(
                                                profileData.thanhPho,
                                                profileData.quocGia
                                            )?.name
                                        }
                                        {', '}
                                        {
                                            Country.getCountryByCode(
                                                profileData.quocGia
                                            )?.name
                                        }
                                    </p>
                                ) : (
                                    <p>{t('undefined')}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 items-center">
                            <div className="flex gap-6 items-center">
                                <FaFacebook
                                    size={40}
                                    color="#1773EA"
                                    className="cursor-pointer"
                                    onClick={() =>
                                        pushToSocialLink(
                                            profileData.mangXaHoi?.facebookLink
                                        )
                                    }
                                />
                                <SiGithub
                                    size={40}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        pushToSocialLink(
                                            profileData.mangXaHoi?.githubLink
                                        )
                                    }
                                />
                                <IoLogoLinkedin
                                    size={40}
                                    color="#007AB5"
                                    className="cursor-pointer"
                                    onClick={() =>
                                        pushToSocialLink(
                                            profileData.mangXaHoi?.linkedinLink
                                        )
                                    }
                                />
                            </div>
                            <div className="flex gap-10 text-base">
                                <div className="flex flex-col items-center">
                                    <p>{t('blogs')}</p>
                                    {/* # FIXME: Replace with actual blogs */}
                                    <p className="font-bold text-xl">
                                        {formatNumber(
                                            profileData.soLuongBaiViet
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p>{t('likes')}</p>
                                    {/* # FIXME: Replace with actual likes */}
                                    <p className="font-bold text-xl">
                                        {formatNumber(
                                            profileData.soLuongThichBaiViet
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white mt-8 rounded-xl pt-4 pb-8 px-10">
                        <h3 className="mb-6 font-bold">{t('recentBlogs')}</h3>
                        {profileData.baiViets &&
                            profileData.baiViets.length > 0 && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {profileData.baiViets.map((blog: any) => (
                                        <Link
                                            href={`/blog/${blog.slug}`}
                                            key={blog.id}
                                        >
                                            <Card className="bg-white rounded-xl border-gray-200 overflow-hidden hover:border-purple-500/50 transition-all shadow-sm h-full flex flex-col duration-300">
                                                <div className="relative h-60">
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
                                                            blog.chuDes
                                                                .slice(0, 4)
                                                                .map(
                                                                    (
                                                                        chuDe: any
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                chuDe.id
                                                                            }
                                                                            className="text-xs text-purple-500 w-fit bg-purple-100 px-2 py-1 rounded-full"
                                                                        >
                                                                            {
                                                                                chuDe
                                                                                    .tenChuDe[
                                                                                    locale
                                                                                ]
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                        {blog.chuDes &&
                                                            blog.chuDes.length >
                                                                4 && (
                                                                <span className="text-xs text-purple-500 w-fit bg-purple-100 px-2 py-1 rounded-full">
                                                                    +
                                                                    {blog.chuDes
                                                                        .length -
                                                                        4}{' '}
                                                                    {locale ===
                                                                    'en'
                                                                        ? 'more'
                                                                        : 'khác'}
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
                                                            {new Date(
                                                                blog.ngayXuatBan
                                                            ).toLocaleDateString(
                                                                locale,
                                                                {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Eye className="h-4 w-4" />
                                                            <span>
                                                                {blog.luotXem}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Heart className="h-4 w-4 " />
                                                            <span>
                                                                {
                                                                    blog.luotYeuThich
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/blog/${blog.slug}`}
                                                        className="text-purple-500 hover:text-purple-700"
                                                    >
                                                        {t('readMore')} →
                                                    </Link>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    )
}
