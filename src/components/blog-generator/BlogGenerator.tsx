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
    OctagonAlert,
    TriangleAlert,
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
import { useLocale, useTranslations } from 'next-intl'
import { signIn } from '@/contexts/auth/reducers'
import { useAuth } from '@/contexts/auth/AuthContext'
import { useMissions } from '@/hooks/useMissions'

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

const BLOG_GENERATOR_COST_COINS = 10

export function BlogGenerator({
    isOpen,
    onClose,
    onBlogGenerated,
}: BlogGeneratorProps) {
    // Client-side rendering flag to prevent hydration issues
    const t = useTranslations('write.BlogGenerator')
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
    const { dispatch, user } = useAuth()

    const { fetchTransactionHistory } = useMissions()

    async function handleSignIn() {
        try {
            const userInformation =
                await authenticationService.getInformationUser()
            await dispatch(
                signIn({ isAuthenticated: true, user: userInformation })
            )
        } catch (error) {}
    }

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
            fetchTransactionHistory()
            handleSignIn()
            if (!response || !response.data) {
                setError(t('error'))
                return
            }

            // Transform API response to the blog format expected by the editor
            try {
                const blog = transformAPIResponseToBlog(response.data)
                if (blog && blog.sections) {
                    setGeneratedBlog(blog)

                    toast({
                        title: t('generateSuccess'),
                        description: t('generateSuccessDesc'),
                    })
                } else {
                    throw new Error(t('error'))
                }
            } catch (err) {
                console.error('Error processing blog response:', err)
                setError(t('errorProcessing'))
            }
        },
        onError: (error) => {
            setGenerationStep(null)
            console.error('Error generating blog:', error)
            setError(t('errorProcessing'))

            toast({
                title: t('generateFailure'),
                description: t('generateFailureDesc'),
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
                title: t('contentRequired'),
                description: t('contentRequiredDesc'),
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
            title: t('blogImported'),
            description: t('blogImportedDesc'),
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
            <TabsList className="grid grid-cols-2 w-[420px] mx-auto">
                <TabsTrigger
                    value="idea"
                    className="flex items-center gap-2 font-bold"
                >
                    <Lightbulb className="h-4 w-4" />
                    {t('startIdea')}
                </TabsTrigger>
                <TabsTrigger
                    value="advanced"
                    className="flex items-center gap-2 font-bold"
                >
                    <Wand2 className="h-4 w-4" />
                    {t('advancedOptions')}
                </TabsTrigger>
            </TabsList>

            <div className="mt-8 overflow-y-auto flex-1 pr-2">
                <TabsContent value="idea" className="mt-0 space-y-6">
                    <div className="space-y-2 px-2">
                        <Label
                            htmlFor="blog-idea"
                            className="font-bold text-base"
                        >
                            {t('whatToWrite')}
                        </Label>
                        <Textarea
                            id="blog-idea"
                            placeholder="Describe your blog idea or topic..."
                            value={blogIdea}
                            onChange={(e) => setBlogIdea(e.target.value)}
                            className="min-h-[120px]"
                            disabled={
                                generateBlogMutation.isPending ||
                                !!generatedBlog ||
                                !user ||
                                user?.soLuongCoin < BLOG_GENERATOR_COST_COINS
                            }
                        />
                        <p className="text-xs text-gray-500">
                            {t('writeDesc')}
                        </p>
                    </div>

                    <div className="space-y-2 px-2">
                        <Label
                            htmlFor="blog-title"
                            className="font-bold text-base"
                        >
                            {t('blogTitle')}
                        </Label>
                        <Input
                            id="blog-title"
                            placeholder="Enter a title or leave blank to generate one"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={
                                generateBlogMutation.isPending ||
                                !!generatedBlog ||
                                !user ||
                                user?.soLuongCoin < BLOG_GENERATOR_COST_COINS
                            }
                        />
                        <p className="text-xs text-gray-500">
                            {t('titleDesc')}
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
                            <h3 className="text-base text-purple-800 mb-2 font-bold">
                                {t('writingStyle')}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="tone"
                                        className="text-sm font-bold"
                                    >
                                        {t('writingTone')}
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
                                                {t('informative')}
                                            </SelectItem>
                                            <SelectItem value="conversational">
                                                {t('conversational')}
                                            </SelectItem>
                                            <SelectItem value="professional">
                                                {t('professional')}
                                            </SelectItem>
                                            <SelectItem value="technical">
                                                {t('technical')}
                                            </SelectItem>
                                            <SelectItem value="persuasive">
                                                {t('persuasive')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="audience"
                                        className="text-sm font-bold"
                                    >
                                        {t('targetAudience')}
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
                                                {t('generalAudience')}
                                            </SelectItem>
                                            <SelectItem value="technical">
                                                {t('technicalAudience')}
                                            </SelectItem>
                                            <SelectItem value="business">
                                                {t('businessAudience')}
                                            </SelectItem>
                                            <SelectItem value="beginners">
                                                {t('beginnersAudience')}
                                            </SelectItem>
                                            <SelectItem value="experts">
                                                {t('expertsAudience')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-md p-4">
                            <h3 className="text-base font-bold text-gray-800 mb-2">
                                {t('contentElements')}
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
                                            {t('includeCode')}
                                        </Label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {t('includeCodeDesc')}
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
                                            {t('includeEmojis')}
                                        </Label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {t('includeEmojisDesc')}
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
        <div className="flex-1 overflow-y-auto py-4 space-y-6 h-full">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h3 className="font-medium text-green-800">
                        {t('blogGenerated')}
                    </h3>
                    <p className="text-green-700 text-sm mt-1">
                        {t('blogGeneratedDesc')}
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

            {/* <div className="space-y-2">
                <h3 className="font-medium">Summary</h3>
                <div className="p-3 bg-gray-50 rounded-md">
                    {generatedBlog?.summary || ''}
                </div>
            </div> */}

            {/* Blog content preview */}
            <div className="space-y-2">
                <h3 className="font-medium">Content Preview</h3>
                <div className="border rounded-md p-4 max-h-full overflow-y-scroll">
                    {/* Render only basic content to simplify DOM operations */}
                    <h2 className="text-xl font-bold mb-4">
                        {generatedBlog?.title || ''}
                    </h2>

                    {generatedBlog?.sections &&
                    Array.isArray(generatedBlog.sections) &&
                    generatedBlog.sections.length > 0 ? (
                        <div>
                            <p className="text-gray-600 italic">
                                {t('blogGeneratedWith')}
                                {generatedBlog.sections.length} {t('sections')}
                            </p>
                            <p className="mt-4 mb-2 font-medium">
                                {t('previewSections')}
                            </p>
                            {generatedBlog.sections
                                .slice(0, 8)
                                .map((section: any, i: number) => {
                                    if (!section) return null
                                    if (section.type === 'heading') {
                                        return (
                                            <h4
                                                key={i}
                                                className="font-semibold mt-5"
                                            >
                                                {section.content}
                                            </h4>
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
                            <p className="text-gray-500 italic mt-5">
                                {t('previewMore')}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500">{t('noContent')}</p>
                    )}
                </div>
            </div>
        </div>
    )

    // Add a function to render the current generation step
    const renderGenerationStep = () => {
        if (!generationStep) return null

        const steps = {
            planning: t('planningContent'),
            researching: t('researchingContent'),
            writing: t('writingContent'),
            finalizing: t('finalizingContent'),
            completed: t('completedContent'),
        }

        return (
            <div className="text-xs text-purple-700 mt-1 flex justify-center">
                <span>{steps[generationStep as keyof typeof steps]}</span>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-6 overflow-y-scroll">
                <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        {t('blogGenerator')}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1 italic">
                        {t('blogGeneratorDesc')}
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
                                {t('generationError')}
                            </h4>
                            <p className="text-red-700 text-base mt-1">
                                {error}
                            </p>
                        </div>
                    </div>
                )}
                {/* Coin cost notice */}
                {activeTab == 'idea' && <Separator className="my-4" />}
                <div className={`flex flex-row gap-4`}>
                    <div className="w-fit bg-red-50 border border-red-200 rounded-md p-2 flex items-center justify-center">
                        <TriangleAlert className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800 font-medium">
                            {t('notHaveEnoughCoins')}{' '}
                        </p>
                    </div>
                    <div className="w-fit bg-blue-50 border border-blue-200 rounded-md p-2 flex items-center justify-center">
                        <OctagonAlert className="h-5 w-5 text-blue-600 mr-2" />
                        <p className="text-sm text-blue-800 font-medium">
                            {t('generateBlogCosts')} {BLOG_GENERATOR_COST_COINS}{' '}
                            coins
                        </p>
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    {!generatedBlog ? (
                        <>
                            <Button variant="outline" onClick={onClose}>
                                {t('cancel')}
                            </Button>
                            <div className="flex flex-col">
                                <Button
                                    onClick={handleGenerateBlog}
                                    disabled={
                                        generateBlogMutation.isPending ||
                                        !blogIdea ||
                                        !user ||
                                        user?.soLuongCoin <
                                            BLOG_GENERATOR_COST_COINS
                                    }
                                    className="bg-purple-600 hover:bg-purple-700 min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {generateBlogMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="relative">
                                                {generationStep === 'planning'
                                                    ? t('planning')
                                                    : generationStep ===
                                                        'researching'
                                                      ? t('researching')
                                                      : generationStep ===
                                                          'writing'
                                                        ? t('writing')
                                                        : generationStep ===
                                                            'finalizing'
                                                          ? t('finalizing')
                                                          : t('processing')}
                                                <span className="absolute animate-pulse">
                                                    ...
                                                </span>
                                            </span>
                                        </span>
                                    ) : (
                                        <span>{t('generateBlog')}</span>
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
                                {t('startOver')}
                            </Button>
                            <Button
                                onClick={handleUseBlog}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {t('useBlog')}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
