'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/other-ui/Dialog'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/other-ui/Tabs'
import { Button } from '@/components/other-ui/Button'
import { Input } from '@/components/other-ui/Input'
import { Label } from '@/components/other-ui/Label'
import { useToast } from '@/components/other-ui/useToast'
import { Video, Upload, LinkIcon } from 'lucide-react'

interface VideoUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onVideoSelected: (videoUrl: string) => void
}

export function VideoUploadModal({
    isOpen,
    onClose,
    onVideoSelected,
}: VideoUploadModalProps) {
    const [activeTab, setActiveTab] = useState('upload')
    const [videoUrl, setVideoUrl] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setVideoUrl('')
            setActiveTab('upload')
        }
    }, [isOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check if file is a video
        if (!file.type.startsWith('video/')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload a video file (MP4, WebM, etc.)',
                variant: 'destructive',
            })
            return
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please upload a video smaller than 10MB',
                variant: 'destructive',
            })
            return
        }

        // In a real app, you would upload the file to a server here
        // For demo purposes, we'll create a local URL
        setIsUploading(true)

        // Simulate upload delay
        setTimeout(() => {
            const videoUrl = URL.createObjectURL(file)
            setIsUploading(false)
            onVideoSelected(videoUrl)
            onClose()

            toast({
                title: 'Video uploaded',
                description: 'Your video has been uploaded successfully',
            })
        }, 1500)
    }

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!videoUrl.trim()) {
            toast({
                title: 'Empty URL',
                description: 'Please enter a video URL',
                variant: 'destructive',
            })
            return
        }

        // Basic URL validation
        try {
            new URL(videoUrl)
        } catch (err) {
            toast({
                title: 'Invalid URL',
                description: 'Please enter a valid URL',
                variant: 'destructive',
            })
            return
        }

        // Check if it's a valid video URL (basic check)
        const isYouTube =
            videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
        const isVimeo = videoUrl.includes('vimeo.com')

        // For YouTube, convert to embed URL
        if (isYouTube) {
            let embedUrl = videoUrl

            // Convert standard YouTube URL to embed format
            if (videoUrl.includes('watch?v=')) {
                const videoId = videoUrl.split('watch?v=')[1].split('&')[0]
                embedUrl = `https://www.youtube.com/embed/${videoId}`
            } else if (videoUrl.includes('youtu.be/')) {
                const videoId = videoUrl.split('youtu.be/')[1].split('?')[0]
                embedUrl = `https://www.youtube.com/embed/${videoId}`
            }

            onVideoSelected(embedUrl)
            onClose()

            toast({
                title: 'Video added',
                description: 'YouTube video has been added successfully',
            })
            return
        }

        // For Vimeo, convert to embed URL
        if (isVimeo) {
            let embedUrl = videoUrl

            // Convert standard Vimeo URL to embed format
            if (videoUrl.includes('vimeo.com/')) {
                const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0]
                embedUrl = `https://player.vimeo.com/video/${videoId}`
            }

            onVideoSelected(embedUrl)
            onClose()

            toast({
                title: 'Video added',
                description: 'Vimeo video has been added successfully',
            })
            return
        }

        // For other URLs, just use as is
        onVideoSelected(videoUrl)
        onClose()

        toast({
            title: 'Video added',
            description: 'Your video URL has been added successfully',
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Insert Video</DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-4"
                >
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger
                            value="upload"
                            className="flex items-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger
                            value="url"
                            className="flex items-center gap-2"
                        >
                            <LinkIcon className="h-4 w-4" />
                            URL
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="py-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="video/*"
                                className="hidden"
                            />
                            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">
                                Upload a video file (max 10MB)
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                                Supported formats: MP4, WebM, OGG
                            </p>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isUploading ? 'Uploading...' : 'Select File'}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="url" className="py-4">
                        <form onSubmit={handleUrlSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="video-url">Video URL</Label>
                                <Input
                                    id="video-url"
                                    value={videoUrl}
                                    onChange={(e) =>
                                        setVideoUrl(e.target.value)
                                    }
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="border-gray-300 focus-visible:ring-purple-500"
                                />
                                <p className="text-xs text-gray-500">
                                    Paste a YouTube, Vimeo, or other video URL.
                                    For YouTube and Vimeo, the URL will be
                                    automatically converted to an embed URL.
                                </p>
                            </div>
                            <Button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Add Video
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
