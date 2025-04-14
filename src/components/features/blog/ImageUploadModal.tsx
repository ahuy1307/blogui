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
import { Image as ImageIcon, Upload, LinkIcon } from 'lucide-react'
import Image from 'next/image'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { BlogMedia } from '@/types/interface'

// In a real app, this would be fetched from a database or API
interface ImageUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onImageSelected: (imageUrl: string) => void
}

export function ImageUploadModal({
    isOpen,
    onClose,
    onImageSelected,
}: ImageUploadModalProps) {
    const [activeTab, setActiveTab] = useState('upload')
    const [uploadedImages, setUploadedImages] = useState<BlogMedia[]>([])
    const [selectedImage, setSelectedImage] = useState<BlogMedia | null>(null)
    const [imageUrl, setImageUrl] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedImage(null)
            setImageUrl('')
            setActiveTab('upload')
        }
        const fetchImages = async () => {
            try {
                const res = await authenticationService.getAllBlogMedias({ type: 'image' })
                setUploadedImages(res.data.results) // Populate uploadedImages with API data
            } catch (error) {
                toast({
                    title: 'Error fetching images',
                    description: 'Unable to fetch images from the server',
                    variant: 'destructive',
                })
            }
        }
        fetchImages()
    }, [isOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file type',
                description:
                    'Please upload an image file (JPEG, PNG, GIF, etc.)',
                variant: 'destructive',
            })
            return
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please upload an image smaller than 5MB',
                variant: 'destructive',
            })
            return
        }

        // In a real app, you would upload the file to a server here
        // For demo purposes, we'll create a local URL
        setIsUploading(true)

        // Simulate upload delay
        setTimeout(() => {
            const imageUrl = URL.createObjectURL(file)
            // setUploadedImages([imageUrl, ...uploadedImages])
            // setSelectedImage(imageUrl)
            setIsUploading(false)

            toast({
                title: 'Image uploaded',
                description: 'Your image has been uploaded successfully',
            })
        }, 1500)
    }

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!imageUrl.trim()) {
            toast({
                title: 'Empty URL',
                description: 'Please enter an image URL',
                variant: 'destructive',
            })
            return
        }

        // Basic URL validation
        try {
            new URL(imageUrl)
        } catch (err) {
            toast({
                title: 'Invalid URL',
                description: 'Please enter a valid URL',
                variant: 'destructive',
            })
            return
        }

        // In a real app, you would validate the image URL on the server
        // For demo purposes, we'll just add it to the list
        // setUploadedImages([imageUrl, ...uploadedImages])
        // setSelectedImage(imageUrl)
        setImageUrl('')

        toast({
            title: 'Image added',
            description: 'Your image URL has been added successfully',
        })
    }

    const handleSelectImage = () => {
        if (selectedImage) {
            onImageSelected(selectedImage.noiDungMedia.url) // Pass selected image URL
        } else {
            toast({
                title: 'No image selected',
                description: 'Please select an image first',
                variant: 'destructive',
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-4"
                >
                    <TabsList className="grid grid-cols-3">
                        <TabsTrigger
                            value="upload"
                            className="flex items-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger
                            value="library"
                            className="flex items-center gap-2"
                        >
                            <ImageIcon className="h-4 w-4" />
                            Library
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
                                accept="image/*"
                                className="hidden"
                            />
                            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">
                                Drag and drop an image here, or click to select
                                a file
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

                    <TabsContent value="library" className="py-4">
                        {uploadedImages && uploadedImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4">
                                {uploadedImages.map((image) => (
                                    <div
                                        key={image.id || image.noiDungMedia.url} // Use id or URL as key
                                        className={`
                      relative rounded-md overflow-hidden border-2 cursor-pointer
                      ${selectedImage === image ? 'border-purple-500' : 'border-transparent hover:border-gray-300'}
                    `}
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <Image
                                            src={
                                                image.noiDungMedia.url ||
                                                '/images/default_image.jpg'
                                            }
                                            alt={
                                                image.noiDungMedia.name ||
                                                'Uploaded image'
                                            }
                                            width={600}
                                            height={600}
                                            className="w-full h-32 object-cover"
                                        />
                                        {selectedImage === image && (
                                            <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                                                <div className="bg-purple-500 text-white rounded-full p-1">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No images in your library yet.</p>
                                <p>Upload images to see them here.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="url" className="py-4">
                        <form onSubmit={handleUrlSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input
                                    id="image-url"
                                    value={imageUrl}
                                    onChange={(e) =>
                                        setImageUrl(e.target.value)
                                    }
                                    placeholder="https://example.com/image.jpg"
                                    className="border-gray-300 focus-visible:ring-purple-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Add Image
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
                    <Button
                        onClick={handleSelectImage}
                        disabled={!selectedImage}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        Insert Selected Image
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
