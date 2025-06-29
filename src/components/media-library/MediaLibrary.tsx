'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import {
    ReactCrop,
    centerCrop,
    makeAspectCrop,
    type Crop,
    type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
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
    Link,
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
    const [url, setUrl] = useState('')

    // State for image cropping
    const [imgSrc, setImgSrc] = useState('')
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const imgRef = useRef<HTMLImageElement>(null)
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)

    // AI image generation states
    const [imagePrompt, setImagePrompt] = useState('')
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
        null
    )
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const [generationProgress, setGenerationProgress] = useState(0)

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget
        const newCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                16 / 9,
                width,
                height
            ),
            width,
            height
        )
        setCrop(newCrop)
    }

    const handleAddFromUrl = () => {
        if (!url.trim()) {
            toast({
                title: t('emptyUrl'),
                description: t('emptyUrlDescription'),
                variant: 'destructive',
            })
            return
        }

        let finalUrl = url.trim()
        let type: 'image' | 'video' = 'image' // Default to image

        // Basic check for video URLs
        if (
            finalUrl.includes('youtube.com/watch?v=') ||
            finalUrl.includes('youtu.be/')
        ) {
            type = 'video'
            const videoId = finalUrl.includes('youtu.be/')
                ? finalUrl.split('youtu.be/')[1].split('?')[0]
                : new URL(finalUrl).searchParams.get('v')
            finalUrl = `https://www.youtube.com/embed/${videoId}`
        } else if (finalUrl.match(/\.(mp4|webm|ogg)$/)) {
            type = 'video'
        }

        if (mediaType !== 'all' && mediaType !== type) {
            toast({
                title: t('invalidFileType'),
                description:
                    mediaType === 'image'
                        ? t('invalidFileTypeDescriptionImage')
                        : t('invalidFileTypeDescriptionVideo'),
                variant: 'destructive',
            })
            return
        }

        // Create a mock media object to pass back
        const media: BlogMedia = {
            id: `url-${Date.now()}`,
            loaiMedia: type,
            noiDungMedia: {
                url: finalUrl,
                name: finalUrl,
                size: 0,
                date: new Date().toISOString(),
            },
        }

        onMediaSelected(media)
        onClose()
    }

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

    const handleCropAndUpload = async () => {
        if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
            toast({
                title: 'Crop error',
                description: 'Could not process the crop.',
                variant: 'destructive',
            })
            return
        }

        const image = imgRef.current
        const canvas = previewCanvasRef.current
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw new Error('No 2d context')
        }

        canvas.width = completedCrop.width
        canvas.height = completedCrop.height

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        )

        canvas.toBlob((blob) => {
            if (!blob) {
                toast({
                    title: 'Error creating image',
                    description: 'Could not create image file for upload.',
                    variant: 'destructive',
                })
                return
            }

            const croppedFile = new File([blob], 'cropped-image.png', {
                type: 'image/png',
            })

            setIsUploading(true)
            setUploadProgress(10)
            uploadMediaMutation.mutate({
                loaiMedia: 'image',
                mediaFile: croppedFile,
            })
            setImgSrc('') // Go back to dropzone
        }, 'image/png')
    }

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

        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')

        // Check if file is an image or video based on mediaType
        if (mediaType === 'image' && !isImage) {
            toast({
                title: t('invalidFileType'),
                description: t('invalidFileTypeDescriptionImage'),
                variant: 'destructive',
            })
            return
        }

        if (mediaType === 'video' && !isVideo) {
            toast({
                title: t('invalidFileType'),
                description: t('invalidFileTypeDescriptionVideo'),
                variant: 'destructive',
            })
            return
        }

        if (
            mediaType === 'all' &&
            !file.type.startsWith('image/') &&
            !file.type.startsWith('video/')
        ) {
            toast({
                title: t('invalidFileType'),
                description: t('supportedFormatsAll'),
                variant: 'destructive',
            })
            return
        }

        // Check file size
        if (isImage && file.size > MAX_IMAGE_SIZE) {
            toast({
                title: t('fileTooLarge'),
                description: t('imageFileTooLargeDescription'),
                variant: 'destructive',
            })
            return
        } else if (isVideo && file.size > MAX_VIDEO_SIZE) {
            toast({
                title: t('fileTooLarge'),
                description: t('videoFileTooLargeDescription'),
                variant: 'destructive',
            })
            return
        }

        if (isImage) {
            setCrop(undefined) // Reset crop state
            const reader = new FileReader()
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || '')
            )
            reader.readAsDataURL(file)
            return
        }

        // It's a video, upload directly
        setIsUploading(true)
        setUploadProgress(10) // Start progress at 10%
        uploadMediaMutation.mutate({
            loaiMedia: 'video',
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
            // Reset cropper state
            setImgSrc('')
            setCrop(undefined)
            setCompletedCrop(undefined)
        }
    }, [isOpen])

    // Prevent rendering if not open to avoid unnecessary state updates
    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-w-[95vw] h-[90vh] sm:h-[80vh] flex flex-col p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {t('mediaLibrary')}
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col min-h-0"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                        <TabsList
                            className={`grid ${mediaType === 'video' ? 'grid-cols-3 w-full sm:w-[450px]' : 'grid-cols-4 w-full sm:w-[600px]'}`}
                        >
                            <TabsTrigger
                                value="library"
                                className="flex items-center gap-2 px-2 sm:px-4 text-sm sm:text-sm"
                            >
                                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 hidden md:block" />
                                {t('library')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="flex items-center gap-2 px-2 sm:px-4 text-sm sm:text-sm"
                            >
                                <Upload className="h-3 w-3 sm:h-4 sm:w-4 hidden md:block" />
                                {t('upload')}
                            </TabsTrigger>
                            {mediaType == 'video' && (
                                <TabsTrigger
                                    value="from-url"
                                    className="flex items-center gap-2 px-2 sm:px-4 text-sm sm:text-sm"
                                >
                                    <Link className="h-3 w-3 sm:h-4 sm:w-4 hidden md:block" />
                                    {t('fromUrl')}
                                </TabsTrigger>
                            )}
                            {/* Only show generate tab for image or all media types */}
                            {(mediaType === 'image' || mediaType === 'all') && (
                                <TabsTrigger
                                    value="generate"
                                    className="flex items-center gap-2 px-2 sm:px-4 text-sm sm:text-sm"
                                >
                                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 hidden md:block" />
                                    {t('generate')}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
                                    className="pl-10 h-10 text-base"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                {searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredMedia.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                        {filteredMedia.map((media, index) => (
                                            <div
                                                key={index}
                                                className={`
                          relative rounded-md overflow-hidden border-2 cursor-pointer touch-manipulation
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
                                                                className="h-8 w-8 p-0 rounded-full"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation()
                                                                    handleDeleteMedia(
                                                                        media.id
                                                                    )
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                          flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 sm:p-4 rounded-md cursor-pointer touch-manipulation
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
                                                    <div className="text-xs mt-2 text-gray-500 flex flex-wrap gap-2 sm:gap-3">
                                                        {/* <span>
                                                            {media.loaiMedia ===
                                                            'image'
                                                                ? 'Dimensions Unknown'
                                                                : 'Duration Unknown'}
                                                        </span> */}
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
                                                    className="h-9 w-9 p-0 rounded-full flex-shrink-0 ml-auto mt-2 sm:mt-0"
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
                                <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                                        {mediaType === 'video' ? (
                                            <Video className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                                        )}
                                    </div>
                                    <h3 className="text-base sm:text-lg font-medium mb-1">
                                        {t('noMediaFound')}
                                    </h3>
                                    <p className="text-gray-500 mb-4 text-sm sm:text-base">
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
                        {imgSrc ? (
                            <div className="flex flex-col items-center gap-4">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) =>
                                        setCrop(percentCrop)
                                    }
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={16 / 9}
                                    className="max-w-full"
                                >
                                    <Image
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                        width={600}
                                        height={600}
                                        style={{
                                            maxHeight: '50vh',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </ReactCrop>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setImgSrc('')}
                                        variant="outline"
                                        disabled={isUploading}
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleCropAndUpload}
                                        disabled={isUploading}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isUploading
                                            ? t('uploadingInProgress')
                                            : t('cropAndUpload')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-md p-4 sm:p-8 text-center"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    if (e.dataTransfer.files.length > 0) {
                                        handleFileChange({
                                            target: {
                                                files: e.dataTransfer.files,
                                            },
                                        } as unknown as React.ChangeEvent<HTMLInputElement>)
                                    }
                                }}
                            >
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
                                    <Video className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4" />
                                )}

                                <p className="text-gray-600 mb-4 text-sm sm:text-base">
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
                                    {mediaType === 'image' &&
                                        t('maxFileSizeImage')}
                                    {mediaType === 'video' &&
                                        t('maxFileSizeVideo')}
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
                                        className="bg-purple-600 hover:bg-purple-700 h-10"
                                    >
                                        {t('selectFile')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent
                        value="from-url"
                        className="mt-4 flex-1 overflow-auto"
                    >
                        <div className="border rounded-md p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-medium mb-4">
                                {t('addFromUrlTitle')}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="media-url"
                                        className="block text-sm font-medium mb-2"
                                    >
                                        {t('mediaUrlLabel')}
                                    </label>
                                    <Input
                                        id="media-url"
                                        placeholder={t('mediaUrlPlaceholder')}
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t('mediaUrlDescription')}
                                    </p>
                                </div>
                                <div>
                                    <Button
                                        onClick={handleAddFromUrl}
                                        className="bg-purple-600 hover:bg-purple-700 h-10 w-full sm:w-auto"
                                        disabled={!url.trim()}
                                    >
                                        {t('addMedia')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* New Generate Image Tab */}
                    <TabsContent
                        value="generate"
                        className="mt-4 flex-1 overflow-auto"
                    >
                        <div className="flex flex-col h-full">
                            {!generatedImageUrl ? (
                                <div className="border rounded-md p-3 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-medium mb-4">
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
                                                className="min-h-[100px] sm:min-h-[120px]"
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
                                                className="bg-purple-600 hover:bg-purple-700 h-10 w-full sm:w-auto"
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
                                                <div className="w-full sm:w-fit bg-red-50 border border-red-200 rounded-md p-2 flex items-center justify-center">
                                                    <TriangleAlert className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                                                    <p className="text-sm text-yellow-800 font-medium">
                                                        {t(
                                                            'notHaveEnoughCoins'
                                                        )}{' '}
                                                    </p>
                                                </div>
                                            )}
                                        <div className="w-full sm:w-fit bg-blue-50 border border-blue-200 rounded-md p-2 flex items-center">
                                            <OctagonAlert className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
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
                                <div className="border rounded-md p-3 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-medium mb-4">
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
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <Button
                                            onClick={handleUploadGeneratedImage}
                                            className="bg-purple-600 hover:bg-purple-700 h-10"
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
                                            className="h-10"
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

                {/* Hidden canvas for cropping */}
                <canvas
                    ref={previewCanvasRef}
                    style={{
                        display: 'none',
                        objectFit: 'contain',
                        width: completedCrop?.width ?? 0,
                        height: completedCrop?.height ?? 0,
                    }}
                />

                <Separator className="my-3 sm:my-4" />

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto h-10"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSelectMedia}
                        disabled={!selectedMedia}
                        className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto h-10"
                    >
                        {t('insertSelectedMedia')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
