'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/other-ui/Dialog'
import { Button } from '@/components/other-ui/Button'
import { Textarea } from '@/components/other-ui/Textarea'
import { Input } from '@/components/other-ui/Input'
import { Label } from '@/components/other-ui/Label'
import { useToast } from '@/components/other-ui/useToast'
import {
    Sparkles,
    Loader2,
    Check,
    AlertCircle,
    Lightbulb,
    Wand2,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/other-ui/Select'
import { Separator } from '@/components/other-ui/Separator'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/other-ui/Tabs'
import { Slider } from '@/components/other-ui/Slider'
import { useMutation } from '@tanstack/react-query'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useLocale } from 'next-intl'

interface BlogGeneratorProps {
    isOpen: boolean
    onClose: () => void
    onBlogGenerated: (blogData: any) => void
}

// Sample blog topics for inspiration
const SAMPLE_TOPICS = [
    'The Future of Artificial Intelligence in Healthcare',
    'How Machine Learning is Transforming Financial Services',
    'Ethical Considerations in Generative AI Development',
    'Computer Vision Applications in Autonomous Vehicles',
    'The Evolution of Natural Language Processing',
    'Reinforcement Learning: Challenges and Opportunities',
    'AI and Climate Change: How Technology Can Help',
    'The Impact of Quantum Computing on AI Research',
]

export function BlogGenerator({
    isOpen,
    onClose,
    onBlogGenerated,
}: BlogGeneratorProps) {
    // Client-side rendering flag to prevent hydration issues
    const [isMounted, setIsMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('idea')
    const [blogIdea, setBlogIdea] = useState('')
    const [title, setTitle] = useState('')
    const [tone, setTone] = useState('informative')
    const [targetAudience, setTargetAudience] = useState('general')
    const [includeCode, setIncludeCode] = useState(false)
    const [includeEmojis, setIncludeEmojis] = useState(false)
    const [generatedBlog, setGeneratedBlog] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const locale = useLocale()
    const [generationStep, setGenerationStep] = useState<string | null>(null)

    // Move useMutation hook to top level before any conditional returns
    const generateBlogMutation = useMutation({
        mutationFn: async () => {
            setGenerationStep('planning')

            // Simulate step progress for better UX
            setTimeout(() => setGenerationStep('researching'), 1500)
            setTimeout(() => setGenerationStep('writing'), 3000)
            setTimeout(() => setGenerationStep('finalizing'), 6000)

            return await authenticationService.generateBlogContent({
                title: title || '',
                content: blogIdea || '',
                writing_tone: tone || 'informative',
                target_audience: targetAudience || 'general',
                include_code: includeCode || false,
                language: locale || 'en',
                include_emojis: includeEmojis || false,
            })
        },
        onSuccess: (response) => {
            setGenerationStep('completed')

            if (!response || !response.data) {
                setError('Received empty response from the server')
                return
            }

            // Transform API response to the blog format expected by the editor
            try {
                const blog = transformAPIResponseToBlog(response.data)
                if (blog && blog.sections) {
                    setGeneratedBlog(blog)

                    toast({
                        title: 'Blog generated successfully',
                        description: 'Your AI-generated blog is ready to use',
                    })
                } else {
                    throw new Error('Failed to create blog structure')
                }
            } catch (err) {
                console.error('Error processing blog response:', err)
                setError(
                    'Error processing the generated blog. Please try again.'
                )
            }
        },
        onError: (error) => {
            setGenerationStep(null)
            console.error('Error generating blog:', error)
            setError(
                'An error occurred while generating the blog. Please try again.'
            )

            toast({
                title: 'Generation failed',
                description:
                    'There was an error generating your blog. Please try again.',
                variant: 'destructive',
            })
        },
    })

    // Initialize the component when it opens
    useEffect(() => {
        setIsMounted(true)

        if (isOpen) {
            // Only reset states if we don't have a generated blog yet
            if (!generatedBlog) {
                setActiveTab('idea')
                setBlogIdea('')
                setTitle('')
                setError(null)
            }
        }
    }, [isOpen, generatedBlog])

    // If not mounted yet (during SSR), return a minimal version to prevent hydration issues
    if (!isMounted) {
        return null
    }

    // Transform API response to the blog format expected by the editor
    const transformAPIResponseToBlog = (apiResponse: any) => {
        if (!apiResponse) {
            return {
                title: title || 'Generated Blog',
                summary: `This article explores ${blogIdea || title || 'the topic'} in depth.`,
                sections: [],
            }
        }

        const timestamp = Date.now()
        let sections = []

        try {
            if (
                apiResponse.thanhPhans &&
                Array.isArray(apiResponse.thanhPhans)
            ) {
                sections = apiResponse.thanhPhans
                    .map((component: any, index: number) => {
                        if (!component || !component.loaiThanhPhan) return null

                        const id = `section-${timestamp}-${index}`

                        switch (component.loaiThanhPhan) {
                            case 'heading':
                                return {
                                    type: 'heading',
                                    content: component.noiDung || '',
                                    level: component.dinhDang?.level || 2,
                                    id,
                                }
                            case 'text':
                                return {
                                    type: 'text',
                                    content: JSON.stringify({
                                        text: component.noiDung || '',
                                        format: {
                                            bold: false,
                                            italic: false,
                                            align: 'left',
                                            fontSize: 'normal',
                                        },
                                    }),
                                    id,
                                }
                            case 'bullet-list':
                                try {
                                    // Try to parse JSON format first
                                    const parsedData = JSON.parse(
                                        component.noiDung || '{}'
                                    )
                                    return {
                                        type: 'bullet-list',
                                        items: parsedData.items || [],
                                        title: parsedData.title || '',
                                        fontSize:
                                            component.dinhDang?.fontSize ||
                                            'normal',
                                        id,
                                    }
                                } catch (e) {
                                    // Fallback to the old format (string split by newlines)
                                    return {
                                        type: 'bullet-list',
                                        items: component.noiDung
                                            ? component.noiDung.split('\n')
                                            : [],
                                        fontSize:
                                            component.dinhDang?.fontSize ||
                                            'normal',
                                        id,
                                    }
                                }
                            case 'numbered-list':
                                try {
                                    // Try to parse JSON format first
                                    const parsedData = JSON.parse(
                                        component.noiDung || '{}'
                                    )
                                    return {
                                        type: 'numbered-list',
                                        items: parsedData.items || [],
                                        title: parsedData.title || '',
                                        fontSize:
                                            component.dinhDang?.fontSize ||
                                            'normal',
                                        id,
                                    }
                                } catch (e) {
                                    // Fallback to the old format (string split by newlines)
                                    return {
                                        type: 'numbered-list',
                                        items: component.noiDung
                                            ? component.noiDung.split('\n')
                                            : [],
                                        fontSize:
                                            component.dinhDang?.fontSize ||
                                            'normal',
                                        id,
                                    }
                                }
                            case 'code':
                                try {
                                    const codeData = JSON.parse(
                                        component.noiDung
                                    )
                                    return {
                                        type: 'code',
                                        content: codeData.content || '',
                                        language:
                                            codeData.language || 'javascript',
                                        id,
                                    }
                                } catch (e) {
                                    return {
                                        type: 'code',
                                        content: component.noiDung || '',
                                        language: 'javascript',
                                        id,
                                    }
                                }
                            case 'quote':
                                try {
                                    const quoteData = JSON.parse(
                                        component.noiDung
                                    )
                                    return {
                                        type: 'quote',
                                        content: quoteData.content || '',
                                        citation: quoteData.citation || '',
                                        fontSize: 'normal',
                                        id,
                                    }
                                } catch (e) {
                                    return {
                                        type: 'quote',
                                        content: component.noiDung || '',
                                        citation: '',
                                        fontSize: 'normal',
                                        id,
                                    }
                                }
                            default:
                                return null
                        }
                    })
                    .filter(Boolean)
            }
        } catch (error) {
            console.error('Error transforming API response:', error)
            // Return a simple fallback section if transformation fails
            sections = [
                {
                    type: 'text',
                    content: JSON.stringify({
                        text: 'Generated content could not be properly formatted. You can edit this text.',
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id: `section-${timestamp}-fallback`,
                },
            ]
        }

        return {
            title: apiResponse.tieuDe || title || 'Generated Blog',
            summary: `This article explores ${blogIdea || title || 'the topic'} in depth, providing insights for ${targetAudience === 'general' ? 'everyone' : targetAudience === 'technical' ? 'technical professionals' : 'business leaders'}.`,
            sections: sections,
        }
    }

    const handleGenerateBlog = () => {
        if (!blogIdea) {
            toast({
                title: 'Content required',
                description:
                    'Please provide content for your blog idea or topic',
                variant: 'destructive',
            })
            return
        }

        setError(null)
        generateBlogMutation.mutate()
    }

    const handleUseBlog = () => {
        if (!generatedBlog) return

        onBlogGenerated(generatedBlog)
        onClose()

        toast({
            title: 'Blog imported',
            description: 'The generated blog has been imported to the editor',
        })
    }

    // Prevent rendering if not open to avoid unnecessary state updates
    if (!isOpen) return null

    // Split the component into separate rendering methods to reduce complexity
    const renderInputForm = () => (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
        >
            <TabsList className="grid grid-cols-2 w-[400px] mx-auto">
                <TabsTrigger value="idea" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Start with an Idea
                </TabsTrigger>
                <TabsTrigger
                    value="advanced"
                    className="flex items-center gap-2"
                >
                    <Wand2 className="h-4 w-4" />
                    Advanced Options
                </TabsTrigger>
            </TabsList>

            <div className="mt-6 overflow-y-auto flex-1 pr-2">
                <TabsContent value="idea" className="mt-0 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="blog-idea">
                            What would you like to write about?
                        </Label>
                        <Textarea
                            id="blog-idea"
                            placeholder="Describe your blog idea or topic..."
                            value={blogIdea}
                            onChange={(e) => setBlogIdea(e.target.value)}
                            className="min-h-[120px]"
                        />
                        <p className="text-xs text-gray-500">
                            Provide a brief description of your blog topic or
                            the main idea you want to explore.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="blog-title">
                            Blog Title (optional)
                        </Label>
                        <Input
                            id="blog-title"
                            placeholder="Enter a title or leave blank to generate one"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                            You can provide a specific title or let the AI
                            generate one based on your idea.
                        </p>
                    </div>

                    <div className="hidden">
                        <h3 className="text-sm font-medium mb-2">
                            Need inspiration? Try one of these topics:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {SAMPLE_TOPICS.slice(0, 4).map((topic, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setBlogIdea(topic)
                                        setTitle('')
                                    }}
                                    className="text-xs"
                                >
                                    {topic}
                                </Button>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="advanced" className="mt-0 space-y-6">
                    <div className="space-y-6">
                        <div className="bg-purple-50 rounded-md p-4 mb-4">
                            <h3 className="text-sm font-medium text-purple-800 mb-2">
                                Writing Style Options
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tone" className="text-sm">
                                        Writing Tone
                                    </Label>
                                    <Select
                                        value={tone}
                                        onValueChange={setTone}
                                    >
                                        <SelectTrigger
                                            id="tone"
                                            className="bg-white"
                                        >
                                            <SelectValue placeholder="Select tone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="informative">
                                                Informative
                                            </SelectItem>
                                            <SelectItem value="conversational">
                                                Conversational
                                            </SelectItem>
                                            <SelectItem value="professional">
                                                Professional
                                            </SelectItem>
                                            <SelectItem value="technical">
                                                Technical
                                            </SelectItem>
                                            <SelectItem value="persuasive">
                                                Persuasive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="audience"
                                        className="text-sm"
                                    >
                                        Target Audience
                                    </Label>
                                    <Select
                                        value={targetAudience}
                                        onValueChange={setTargetAudience}
                                    >
                                        <SelectTrigger
                                            id="audience"
                                            className="bg-white"
                                        >
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">
                                                General Audience
                                            </SelectItem>
                                            <SelectItem value="technical">
                                                Technical Professionals
                                            </SelectItem>
                                            <SelectItem value="business">
                                                Business Leaders
                                            </SelectItem>
                                            <SelectItem value="beginners">
                                                Beginners
                                            </SelectItem>
                                            <SelectItem value="experts">
                                                Domain Experts
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-800 mb-2">
                                Content Elements
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                                    <input
                                        type="checkbox"
                                        id="include-code"
                                        checked={includeCode}
                                        onChange={(e) =>
                                            setIncludeCode(e.target.checked)
                                        }
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div className="ml-3">
                                        <Label
                                            htmlFor="include-code"
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            Include Code Examples
                                        </Label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Add code snippets for technical
                                            topics
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                                    <input
                                        type="checkbox"
                                        id="include-emojis"
                                        checked={includeEmojis}
                                        onChange={(e) =>
                                            setIncludeEmojis(e.target.checked)
                                        }
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div className="ml-3">
                                        <Label
                                            htmlFor="include-emojis"
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            Include Emojis
                                        </Label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Add emojis for a more casual,
                                            engaging style
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    )

    const renderPreview = () => (
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h3 className="font-medium text-green-800">
                        Blog Generated Successfully
                    </h3>
                    <p className="text-green-700 text-sm mt-1">
                        Your AI-generated blog is ready to use. Click "Use This
                        Blog" to import it into the editor.
                    </p>
                </div>
            </div>

            {/* Blog title and summary */}
            <div className="space-y-2">
                <h3 className="font-medium">Title</h3>
                <div className="p-3 bg-gray-50 rounded-md">
                    {generatedBlog?.title || ''}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="font-medium">Summary</h3>
                <div className="p-3 bg-gray-50 rounded-md">
                    {generatedBlog?.summary || ''}
                </div>
            </div>

            {/* Blog content preview */}
            <div className="space-y-2">
                <h3 className="font-medium">Content Preview</h3>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                    {/* Render only basic content to simplify DOM operations */}
                    <h2 className="text-xl font-bold mb-4">
                        {generatedBlog?.title || ''}
                    </h2>

                    {generatedBlog?.sections &&
                    Array.isArray(generatedBlog.sections) &&
                    generatedBlog.sections.length > 0 ? (
                        <div>
                            <p className="text-gray-600">
                                Blog generated with{' '}
                                {generatedBlog.sections.length} sections
                            </p>
                            <p className="mt-4 mb-2 font-medium">
                                Preview of first few sections:
                            </p>
                            {generatedBlog.sections
                                .slice(0, 2)
                                .map((section: any, i: number) => {
                                    if (!section) return null
                                    if (section.type === 'heading') {
                                        return (
                                            <h3
                                                key={i}
                                                className="font-semibold mt-3"
                                            >
                                                {section.content}
                                            </h3>
                                        )
                                    }
                                    if (section.type === 'text') {
                                        try {
                                            const content = JSON.parse(
                                                section.content
                                            )
                                            return (
                                                <p key={i} className="mt-2">
                                                    {content.text.substring(
                                                        0,
                                                        150
                                                    )}
                                                    ...
                                                </p>
                                            )
                                        } catch {
                                            return (
                                                <p key={i} className="mt-2">
                                                    {String(
                                                        section.content
                                                    ).substring(0, 150)}
                                                    ...
                                                </p>
                                            )
                                        }
                                    }
                                    return null
                                })}
                            <p className="text-gray-500 italic mt-4">
                                (Full content will be available in the editor)
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            No content sections available
                        </p>
                    )}
                </div>
            </div>
        </div>
    )

    // Add a function to render the current generation step
    const renderGenerationStep = () => {
        if (!generationStep) return null

        const steps = {
            planning: 'Planning content structure',
            researching: 'Researching topic information',
            writing: 'Writing blog content',
            finalizing: 'Finalizing and formatting',
            completed: 'Blog generation complete!',
        }

        return (
            <div className="text-xs text-purple-700 mt-1 flex justify-center">
                <span>{steps[generationStep as keyof typeof steps]}</span>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Blog Generator
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Provide content for your blog to generate a complete
                        article
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {!generatedBlog ? renderInputForm() : renderPreview()}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3 mt-4">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-2" />
                        <div>
                            <h4 className="font-medium text-red-800">
                                Generation Failed
                            </h4>
                            <p className="text-red-700 text-base mt-1">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <Separator className="my-4" />

                <DialogFooter className="pt-2">
                    {!generatedBlog ? (
                        <>
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <div className="flex flex-col">
                                <Button
                                    onClick={handleGenerateBlog}
                                    disabled={
                                        generateBlogMutation.isPending ||
                                        !blogIdea // Only disable if no content (blogIdea) is provided
                                    }
                                    className="bg-purple-600 hover:bg-purple-700 min-w-[150px]"
                                >
                                    {generateBlogMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="relative">
                                                {generationStep === 'planning'
                                                    ? 'Planning'
                                                    : generationStep ===
                                                        'researching'
                                                      ? 'Researching'
                                                      : generationStep ===
                                                          'writing'
                                                        ? 'Writing'
                                                        : generationStep ===
                                                            'finalizing'
                                                          ? 'Finalizing'
                                                          : 'Processing'}
                                                <span className="absolute animate-pulse">
                                                    ...
                                                </span>
                                            </span>
                                        </span>
                                    ) : (
                                        <span>Generate Blog</span>
                                    )}
                                </Button>
                                {/* Keep the detailed step description below for additional context */}
                                {!error &&
                                    generateBlogMutation.isPending &&
                                    renderGenerationStep()}
                            </div>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setGeneratedBlog(null)}
                            >
                                Start Over
                            </Button>
                            <Button
                                onClick={handleUseBlog}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Use This Blog
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
