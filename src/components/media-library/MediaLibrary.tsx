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
import { Textarea } from '@/components/other-ui/Textarea'
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
    Sparkles,
    OctagonAlert,
    TriangleAlert,
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
import { useAuth } from '@/contexts/auth/AuthContext'
import { signIn } from '@/contexts/auth/reducers'

interface MediaLibraryProps {
    isOpen: boolean
    onClose: () => void
    onMediaSelected: (media: BlogMedia) => void
    mediaType?: 'image' | 'video' | 'all'
}

const IMAGE_GENERATOR_COST_COINS = 15

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
    const { dispatch, user } = useAuth()
    // AI image generation states
    const [imagePrompt, setImagePrompt] = useState('')
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
        null
    )
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const [generationProgress, setGenerationProgress] = useState(0)

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            await dispatch(
                signIn({ isAuthenticated: true, user: userInformation })
            )
        } catch (error) {}
    }

    const fetchMediaMutation = useMutation({
        mutationFn: async () => {
            const res = await authenticationService.getAllBlogMedias({
                type: mediaType,
            })
            return Array.isArray(res.data) ? res.data : [] // Ensure results is an array
        },
        onSuccess: (data) => {
            setMediaItems(data)
            setActiveTab('library') // Switch to library tab after fetching
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

    const generateImageMutation = useMutation({
        mutationFn: async (prompt: string) => {
            // Start with initial progress
            setGenerationProgress(10)

            // Simulate steps in generation process
            const simulateSteps = () => {
                const steps = [
                    { progress: 25, delay: 5000, message: 'analyzePrompt' },
                    { progress: 40, delay: 5000, message: 'creatingDesign' },
                    { progress: 60, delay: 6000, message: 'renderingImage' },
                    { progress: 85, delay: 6000, message: 'finalizingImage' },
                ]

                let currentStep = 0

                const interval = setInterval(() => {
                    if (currentStep < steps.length) {
                        const step = steps[currentStep]
                        setGenerationProgress(step.progress)

                        // // Update toast message for each step
                        // toast({
                        //     title: t(step.message),
                        //     description: t(`${step.message}Description`),
                        //     duration: 2000,
                        // })

                        currentStep++
                    } else {
                        clearInterval(interval)
                    }
                }, 1500)

                return interval
            }

            const stepsInterval = simulateSteps()

            try {
                const res = await authenticationService.generateBllogImage({
                    prompt,
                })
                clearInterval(stepsInterval)
                return res.data
            } catch (error) {
                clearInterval(stepsInterval)
                throw error
            }
        },
        onSuccess: (data) => {
            setGenerationProgress(100)
            // Short delay before showing the generated image
            setTimeout(() => {
                setGeneratedImageUrl(data.imageUrl)
                setIsGeneratingImage(false)
                toast({
                    title: t('imageGenerated'),
                    description: t('imageGeneratedDescription'),
                })
            }, 500)
            handleSignIn()
        },
        onError: () => {
            setGenerationProgress(0)
            setIsGeneratingImage(false)
            toast({
                title: t('errorGeneratingImage'),
                description: t('errorGeneratingImageDescription'),
                variant: 'destructive',
            })
        },
    })

    const uploadGeneratedImageMutation = useMutation({
        mutationFn: async (url: string) => {
            // Reset and start upload progress
            setUploadProgress(0)

            // Simulate upload steps
            const simulateUploadSteps = () => {
                const steps = [
                    { progress: 15, delay: 4000, message: 'preparingUpload' },
                    { progress: 30, delay: 4000, message: 'downloadingImage' },
                    { progress: 50, delay: 4500, message: 'optimizingImage' },
                    { progress: 70, delay: 4000, message: 'uploadingToServer' },
                    { progress: 90, delay: 4500, message: 'processingUpload' },
                ]

                let currentStep = 0

                const interval = setInterval(() => {
                    if (currentStep < steps.length) {
                        const step = steps[currentStep]
                        setUploadProgress(step.progress)
                        currentStep++
                    } else {
                        clearInterval(interval)
                    }
                }, 800)

                return interval
            }

            const uploadInterval = simulateUploadSteps()

            try {
                const res = await authenticationService.uploadGeneratedImage({
                    url,
                })
                clearInterval(uploadInterval)
                setUploadProgress(100)
                return res.data
            } catch (error) {
                clearInterval(uploadInterval)
                throw error
            }
        },
        onSuccess: (newMedia) => {
            setTimeout(() => {
                // Instead of just adding to the existing media items,
                // refetch all media to ensure we have the latest data
                fetchMediaMutation.mutate()

                setSelectedMedia(newMedia.id)
                setIsUploading(false)

                // Reset the generated image state
                setGeneratedImageUrl(null)
                setImagePrompt('')

                // Switch to library tab to see the uploaded image
                setActiveTab('library')

                toast({
                    title: t('mediaUploaded'),
                    description: t('mediaUploadedDescription'),
                })
            }, 800)
        },
        onError: () => {
            setUploadProgress(0)
            setIsUploading(false)
            toast({
                title: t('errorUploadingGeneratedImage'),
                description: t('errorUploadingGeneratedImageDescription'),
                variant: 'destructive',
            })
        },
    })

    const handleGenerateImage = () => {
        if (!imagePrompt.trim()) {
            toast({
                title: t('emptyPrompt'),
                description: t('emptyPromptDescription'),
                variant: 'destructive',
            })
            return
        }

        setIsGeneratingImage(true)
        setGenerationProgress(0)
        generateImageMutation.mutate(imagePrompt.trim())
    }

    const handleUploadGeneratedImage = () => {
        if (!generatedImageUrl) return

        setIsUploading(true)
        uploadGeneratedImageMutation.mutate(generatedImageUrl)
    }

    const handleCancelGeneration = () => {
        setGeneratedImageUrl(null)
        setImagePrompt('')
    }

    // Reset generate image state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setGeneratedImageUrl(null)
            setImagePrompt('')
            setIsGeneratingImage(false)
            setGenerationProgress(0)
            setUploadProgress(0)
        }
    }, [isOpen])

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
                        <TabsList
                            className={`grid ${mediaType === 'video' ? 'grid-cols-2 w-[300px]' : 'grid-cols-3 w-[450px]'}`}
                        >
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
                            {/* Only show generate tab for image or all media types */}
                            {(mediaType === 'image' || mediaType === 'all') && (
                                <TabsTrigger
                                    value="generate"
                                    className="flex items-center gap-2"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    {t('generate')}
                                </TabsTrigger>
                            )}
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

                    {/* New Generate Image Tab */}
                    <TabsContent
                        value="generate"
                        className="mt-4 flex-1 overflow-auto"
                    >
                        <div className="flex flex-col h-full">
                            {!generatedImageUrl ? (
                                <div className="border rounded-md p-6">
                                    <h3 className="text-lg font-medium mb-4">
                                        {t('generateAIImage')}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="image-prompt"
                                                className="block text-sm font-medium mb-2"
                                            >
                                                {t('imagePrompt')}
                                            </label>
                                            <Textarea
                                                id="image-prompt"
                                                placeholder={t(
                                                    'imagePromptPlaceholder'
                                                )}
                                                value={imagePrompt}
                                                onChange={(e) =>
                                                    setImagePrompt(
                                                        e.target.value
                                                    )
                                                }
                                                className="min-h-[120px]"
                                                disabled={
                                                    isGeneratingImage ||
                                                    !user ||
                                                    user?.soLuongCoin <
                                                        IMAGE_GENERATOR_COST_COINS
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                onClick={handleGenerateImage}
                                                className="bg-purple-600 hover:bg-purple-700"
                                                disabled={
                                                    isGeneratingImage ||
                                                    !imagePrompt.trim() ||
                                                    !user ||
                                                    user?.soLuongCoin <
                                                        IMAGE_GENERATOR_COST_COINS
                                                }
                                            >
                                                {isGeneratingImage ? (
                                                    <>
                                                        <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                                                        {t('generatingImage')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        {t('generateImage')}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        {user &&
                                            user?.soLuongCoin <
                                                IMAGE_GENERATOR_COST_COINS && (
                                                <div className="w-fit bg-red-50 border border-red-200 rounded-md p-2 flex items-center justify-center">
                                                    <TriangleAlert className="h-5 w-5 text-yellow-600 mr-2" />
                                                    <p className="text-sm text-yellow-800 font-medium">
                                                        {t(
                                                            'notHaveEnoughCoins'
                                                        )}{' '}
                                                    </p>
                                                </div>
                                            )}
                                        <div className="w-fit bg-blue-50 border border-blue-200 rounded-md p-2 flex items-center justify-center">
                                            <OctagonAlert className="h-5 w-5 text-blue-600 mr-2" />
                                            <p className="text-sm text-blue-800 font-medium">
                                                {t('generateImageCosts')}{' '}
                                                {IMAGE_GENERATOR_COST_COINS}{' '}
                                                coins
                                            </p>
                                        </div>
                                        {isGeneratingImage && (
                                            <div className="mt-6 space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs text-gray-500">
                                                        <span>
                                                            {generationProgress <
                                                            25
                                                                ? t(
                                                                      'analyzePrompt'
                                                                  )
                                                                : generationProgress <
                                                                    40
                                                                  ? t(
                                                                        'creatingDesign'
                                                                    )
                                                                  : generationProgress <
                                                                      60
                                                                    ? t(
                                                                          'renderingImage'
                                                                      )
                                                                    : generationProgress <
                                                                        85
                                                                      ? t(
                                                                            'finalizingImage'
                                                                        )
                                                                      : t(
                                                                            'almostDone'
                                                                        )}
                                                        </span>
                                                        <span>
                                                            {generationProgress}
                                                            %
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={
                                                            generationProgress
                                                        }
                                                        className="h-2"
                                                    />
                                                </div>
                                                <p className="text-sm text-center text-gray-500">
                                                    {t(
                                                        'generatingImageMessage'
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded-md p-6">
                                    <h3 className="text-lg font-medium mb-4">
                                        {t('generatedImage')}
                                    </h3>
                                    <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden mb-4">
                                        <Image
                                            src={generatedImageUrl}
                                            alt="Generated image"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={handleUploadGeneratedImage}
                                            className="bg-purple-600 hover:bg-purple-700"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <span className="animate-pulse mr-2">
                                                        <Upload className="h-4 w-4" />
                                                    </span>
                                                    {t(
                                                        'uploadingGeneratedImage'
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {t('uploadToLibrary')}
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancelGeneration}
                                            disabled={isUploading}
                                        >
                                            {t('cancel')}
                                        </Button>
                                    </div>
                                    {isUploading && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>
                                                    {uploadProgress < 15
                                                        ? t('preparingUpload')
                                                        : uploadProgress < 30
                                                          ? t(
                                                                'downloadingImage'
                                                            )
                                                          : uploadProgress < 50
                                                            ? t(
                                                                  'optimizingImage'
                                                              )
                                                            : uploadProgress <
                                                                70
                                                              ? t(
                                                                    'uploadingToServer'
                                                                )
                                                              : uploadProgress <
                                                                  90
                                                                ? t(
                                                                      'processingUpload'
                                                                  )
                                                                : t(
                                                                      'finishingUp'
                                                                  )}
                                                </span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <Progress
                                                value={uploadProgress}
                                                className="h-2"
                                            />
                                        </div>
                                    )}
                                </div>
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
