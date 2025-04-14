'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/other-ui/Dialog'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/other-ui/Tabs'
import { Button } from '@/components/other-ui/Button'
import { Input } from '@/components/other-ui/Input'
import { useToast } from '@/components/other-ui/useToast'
import {
    ImageIcon,
    Upload,
    Video,
    Trash2,
    Search,
    X,
    Grid2X2,
    List,
} from 'lucide-react'
import { Progress } from '@/components/other-ui/Progress'
import { Separator } from '@/components/other-ui/Separator'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { BlogMedia } from '@/types/interface'
import { bytesToMB } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '@/constants/constants'

interface MediaLibraryProps {
    isOpen: boolean
    onClose: () => void
    onMediaSelected: (media: BlogMedia) => void
    mediaType?: 'image' | 'video' | 'all'
}

export function MediaLibrary({
    isOpen,
    onClose,
    onMediaSelected,
    mediaType = 'all',
}: MediaLibraryProps) {
    const t = useTranslations('write.MediaLibrary') // Use translation hook
    const [activeTab, setActiveTab] = useState('library')
    const [mediaItems, setMediaItems] = useState<BlogMedia[]>([])
    const [filteredMedia, setFilteredMedia] = useState<BlogMedia[]>([])
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const fetchMediaMutation = useMutation({
        mutationFn: async () => {
            const res = await authenticationService.getAllBlogMedias({
                type: mediaType,
            })
            return Array.isArray(res.data) ? res.data : [] // Ensure results is an array
        },
        onSuccess: (data) => {
            setMediaItems(data)
        },
        onError: () => {
            toast({
                title: t('errorFetchingMedia'),
                description: t('errorFetchingMediaDescription'),
                variant: 'destructive',
            })
            setMediaItems([]) // Fallback to an empty array
        },
    })

    const deleteMediaMutation = useMutation({
        mutationFn: async (id: string) => {
            await authenticationService.deleteBlogMedia({ id })
        },
        onSuccess: (_, mediaId) => {
            setMediaItems((prev) => prev.filter((item) => item.id !== mediaId)) // Remove deleted media from state
            toast({
                title: t('mediaDeleted'),
                description: t('mediaDeletedDescription'),
            })
        },
        onError: () => {
            toast({
                title: t('errorDeletingMedia'),
                description: t('errorDeletingMediaDescription'),
                variant: 'destructive',
            })
        },
    })

    const uploadMediaMutation = useMutation({
        mutationFn: async ({
            loaiMedia,
            mediaFile,
        }: {
            loaiMedia: string
            mediaFile: File
        }) => {
            const formData = new FormData()
            formData.append('loaiMedia', loaiMedia)
            formData.append('mediaFile', mediaFile)

            const res = await authenticationService.uploadBlogMedia({
                formData,
            })
            return res.data
        },
        onSuccess: (newMedia) => {
            setMediaItems((prev) => [newMedia, ...prev]) // Add the new media to the state
            simulateProgressTo100(newMedia, () => {
                fetchMediaMutation.mutate() // Refetch media list after upload
                toast({
                    title: t('mediaUploaded'),
                    description: t('mediaUploadedDescription'),
                })
            })
        },
        onError: () => {
            setUploadProgress(0) // Reset progress on error
            setIsUploading(false)
            toast({
                title: t('errorUploadingMedia'),
                description: t('errorUploadingMediaDescription'),
                variant: 'destructive',
            })
        },
    })

    const simulateProgressTo100 = (
        newMedia: BlogMedia,
        onComplete: () => void
    ) => {
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 10
            })
        }, 100)

        // Simulate upload completion
        setTimeout(() => {
            clearInterval(interval)
            setUploadProgress(100)

            setTimeout(() => {
                setSelectedMedia(newMedia.id)
                setIsUploading(false)
                onMediaSelected(newMedia)
                onComplete()
            }, 500)
        }, 2000)
    }

    const handleDeleteMedia = (mediaId: string) => {
        deleteMediaMutation.mutate(mediaId) // Trigger the mutation to delete media
    }

    useEffect(() => {
        if (isOpen) {
            fetchMediaMutation.mutate() // Trigger the mutation to fetch media
            setActiveTab('library')
            setSelectedMedia(null)
            setSearchTerm('')
        }
    }, [isOpen])

    // Apply search and media type filters
    useEffect(() => {
        if (!isOpen) return

        let results = [...mediaItems]

        // Filter by media type
        if (mediaType !== 'all') {
            results = results.filter((item) =>
                mediaType === 'image'
                    ? item.loaiMedia === 'image'
                    : item.loaiMedia === 'video'
            )
        }

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            results = results.filter((item) =>
                item.noiDungMedia.name.toLowerCase().includes(term)
            )
        }

        setFilteredMedia(results)
    }, [searchTerm, mediaItems, mediaType, isOpen])

    const handleSelectMedia = () => {
        if (!selectedMedia) {
            toast({
                title: t('noMediaSelected'),
                description: t('noMediaSelectedDescription'),
                variant: 'destructive',
            })
            return
        }

        const media = mediaItems.find((item) => item.id === selectedMedia)
        if (media) {
            onMediaSelected(media)
            onClose()
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check if file is an image or video based on mediaType
        if (mediaType === 'image' && !file.type.startsWith('image/')) {
            toast({
                title: t('invalidFileType'),
                description: t('invalidFileTypeDescriptionImage'),
                variant: 'destructive',
            })
            return
        }

        if (mediaType === 'video' && !file.type.startsWith('video/')) {
            toast({
                title: t('invalidFileType'),
                description: t('invalidFileTypeDescriptionVideo'),
                variant: 'destructive',
            })
            return
        }

        // Check file size (max 10MB)
        if (mediaType === 'image' && file.size > MAX_IMAGE_SIZE) {
            toast({
                title: t('fileTooLarge'),
                description: t('imageFileTooLargeDescription'),
                variant: 'destructive',
            })
            return
        } else if (mediaType === 'video' && file.size > MAX_VIDEO_SIZE) {
            toast({
                title: t('fileTooLarge'),
                description: t('videoFileTooLargeDescription'),
                variant: 'destructive',
            })
            return
        }

        // Simulate upload progress and upload the file
        setIsUploading(true)
        setUploadProgress(10) // Start progress at 10%
        uploadMediaMutation.mutate({
            loaiMedia: file.type.startsWith('image/') ? 'image' : 'video',
            mediaFile: file,
        })
    }

    // Prevent rendering if not open to avoid unnecessary state updates
    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('mediaLibrary')}</DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col min-h-0"
                >
                    <div className="flex justify-between items-center">
                        <TabsList className="grid grid-cols-2 w-[300px]">
                            <TabsTrigger
                                value="library"
                                className="flex items-center gap-2"
                            >
                                <ImageIcon className="h-4 w-4" />
                                {t('library')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                {t('upload')}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <div className="flex border rounded-md overflow-hidden">
                                <Button
                                    variant={
                                        viewMode === 'grid'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-none h-8 px-2"
                                >
                                    <Grid2X2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={
                                        viewMode === 'list'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-none h-8 px-2"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <TabsContent
                        value="library"
                        className="flex-1 mt-4 data-[state=active]:flex data-[state=active]:flex-col min-h-0"
                    >
                        <div className="flex gap-4 mb-4">
                            <div className="relative flex-grow">
                                <Input
                                    placeholder={t('searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                {searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredMedia.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        {filteredMedia.map((media, index) => (
                                            <div
                                                key={index}
                                                className={`
                          relative rounded-md overflow-hidden border-2 cursor-pointer
                          ${selectedMedia === media.id ? 'border-purple-500' : 'border-transparent hover:border-gray-300'}
                        `}
                                                onClick={() =>
                                                    setSelectedMedia(media.id)
                                                }
                                            >
                                                {media.loaiMedia === 'image' ? (
                                                    <div className="aspect-video bg-gray-100">
                                                        <Image
                                                            width={200}
                                                            height={100}
                                                            src={
                                                                media
                                                                    .noiDungMedia
                                                                    .url ||
                                                                '/images/default_image.jpg'
                                                            }
                                                            alt={
                                                                media
                                                                    .noiDungMedia
                                                                    .name
                                                            }
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                                                        <video
                                                            src={
                                                                media
                                                                    .noiDungMedia
                                                                    .url
                                                            }
                                                            className="w-full h-full object-cover"
                                                            controls
                                                            poster="/images/default_video_thumbnail.png"
                                                        >
                                                            <p>
                                                                {t(
                                                                    'videoNotSupported'
                                                                )}
                                                            </p>
                                                        </video>
                                                    </div>
                                                )}

                                                <div className="p-2 text-xs truncate bg-white border-t">
                                                    {media.noiDungMedia.name}
                                                </div>
                                                {selectedMedia === media.id && (
                                                    <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 rounded-full"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation()
                                                                    handleDeleteMedia(
                                                                        media.id
                                                                    )
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredMedia.map((media, index) => (
                                            <div
                                                key={index}
                                                className={`
                          flex items-center gap-3 p-4 rounded-md cursor-pointer
                          ${selectedMedia === media.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}
                        `}
                                                onClick={() =>
                                                    setSelectedMedia(media.id)
                                                }
                                            >
                                                {media.loaiMedia === 'image' ? (
                                                    <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                        <Image
                                                            width={200}
                                                            height={100}
                                                            src={
                                                                media
                                                                    .noiDungMedia
                                                                    .url ||
                                                                '/images/default_image.jpg'
                                                            }
                                                            alt={
                                                                media
                                                                    .noiDungMedia
                                                                    .name
                                                            }
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-12 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                                                        <video
                                                            src={
                                                                media
                                                                    .noiDungMedia
                                                                    .url
                                                            }
                                                            className="w-full h-full object-cover"
                                                            controls
                                                            poster="/images/default_video_thumbnail.png"
                                                        >
                                                            <p>
                                                                {t(
                                                                    'videoNotSupported'
                                                                )}
                                                            </p>
                                                        </video>
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">
                                                        {
                                                            media.noiDungMedia
                                                                .name
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex gap-3">
                                                        <span>
                                                            {media.loaiMedia ===
                                                            'image'
                                                                ? 'Dimensions Unknown'
                                                                : 'Duration Unknown'}
                                                        </span>
                                                        <span>
                                                            {bytesToMB(
                                                                media
                                                                    .noiDungMedia
                                                                    .size
                                                            )}
                                                        </span>
                                                        <span>
                                                            {
                                                                media
                                                                    .noiDungMedia
                                                                    .date
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Delete Button */}
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-full flex-shrink-0 float-right"
                                                    onClick={(e) => {
                                                        e.stopPropagation() // Prevent triggering the selection
                                                        handleDeleteMedia(
                                                            media.id
                                                        ) // Call delete handler
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                                        {mediaType === 'video' ? (
                                            <Video className="h-10 w-10 text-gray-400" />
                                        ) : (
                                            <ImageIcon className="h-10 w-10 text-gray-400" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-medium mb-1">
                                        {t('noMediaFound')}
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm
                                            ? t('noMediaFoundSearch')
                                            : t('noMediaFoundDefault')}
                                    </p>
                                    {searchTerm && (
                                        <Button
                                            onClick={() => setSearchTerm('')}
                                        >
                                            {t('clearSearch')}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent
                        value="upload"
                        className="mt-4 flex-1 overflow-auto"
                    >
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept={
                                    mediaType === 'image'
                                        ? 'image/*'
                                        : mediaType === 'video'
                                          ? 'video/*'
                                          : 'image/*,video/*'
                                }
                                className="hidden"
                            />

                            {mediaType === 'video' ? (
                                <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            ) : (
                                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            )}

                            <p className="text-gray-600 mb-4">
                                {t('uploadFile', {
                                    type:
                                        mediaType === 'all'
                                            ? t('files')
                                            : mediaType === 'image'
                                              ? t('images')
                                              : t('videos'),
                                })}
                            </p>

                            <p className="text-xs text-gray-500 mb-4">
                                {mediaType === 'image'
                                    ? t('supportedFormatsImage')
                                    : mediaType === 'video'
                                      ? t('supportedFormatsVideo')
                                      : t('supportedFormatsAll')}
                                <br />
                                {mediaType === 'image' && t('maxFileSizeImage')}
                                {mediaType === 'video' && t('maxFileSizeVideo')}
                            </p>

                            {isUploading ? (
                                <div className="w-full max-w-md mx-auto space-y-4">
                                    <Progress
                                        value={uploadProgress}
                                        className="h-2"
                                    />
                                    <p className="text-sm text-gray-600">
                                        {t('uploading', {
                                            progress: uploadProgress,
                                        })}
                                    </p>
                                </div>
                            ) : (
                                <Button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {t('selectFile')}
                                </Button>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <Separator className="my-4" />

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSelectMedia}
                        disabled={!selectedMedia}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {t('insertSelectedMedia')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
