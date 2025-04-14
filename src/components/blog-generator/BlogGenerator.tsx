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
    const [activeTab, setActiveTab] = useState('idea')
    const [blogIdea, setBlogIdea] = useState('')
    const [title, setTitle] = useState('')
    const [tone, setTone] = useState('informative')
    const [targetAudience, setTargetAudience] = useState('general')
    const [wordCount, setWordCount] = useState(1000)
    const [includeImages, setIncludeImages] = useState(true)
    const [includeCode, setIncludeCode] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStep, setGenerationStep] = useState(0)
    const [generatedBlog, setGeneratedBlog] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    // Initialize the component when it opens
    useEffect(() => {
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

    const handleGenerateBlog = async () => {
        if (!blogIdea && !title) {
            toast({
                title: 'Missing information',
                description: 'Please provide either a blog idea or a title',
                variant: 'destructive',
            })
            return
        }

        setIsGenerating(true)
        setGenerationStep(0)
        setError(null)

        try {
            // In a real app, this would be an API call to an AI service
            // For demo purposes, we'll simulate the generation process

            // Step 1: Generate title if not provided
            await simulateApiCall()
            setGenerationStep(1)

            let generatedTitle = title
            if (!title) {
                // Simulate generating a title
                generatedTitle = `The Complete Guide to ${blogIdea}`
                setTitle(generatedTitle)
            }

            // Step 2: Generate outline
            await simulateApiCall()
            setGenerationStep(2)

            // Step 3: Generate content
            await simulateApiCall(2000) // Longer delay for content generation
            setGenerationStep(3)

            // Step 4: Generate images if requested
            if (includeImages) {
                await simulateApiCall()
                setGenerationStep(4)
            }

            // Step 5: Final formatting
            await simulateApiCall()
            setGenerationStep(5)

            // Create a sample generated blog
            const blog = generateSampleBlog(generatedTitle || blogIdea)
            setGeneratedBlog(blog)

            toast({
                title: 'Blog generated successfully',
                description: 'Your AI-generated blog is ready to use',
            })
        } catch (err) {
            console.error('Error generating blog:', err)
            setError(
                'An error occurred while generating the blog. Please try again.'
            )

            toast({
                title: 'Generation failed',
                description:
                    'There was an error generating your blog. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsGenerating(false)
        }
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

    const simulateApiCall = (delay = 1000) => {
        return new Promise((resolve) => setTimeout(resolve, delay))
    }

    const generateSampleBlog = (blogTitle: string) => {
        // This would be the response from the AI service in a real app
        const timestamp = Date.now()
        return {
            title: blogTitle,
            summary: `This article explores ${blogIdea || blogTitle} in depth, providing insights and practical applications for ${targetAudience === 'general' ? 'everyone' : targetAudience === 'technical' ? 'technical professionals' : 'business leaders'}.`,
            sections: [
                {
                    type: 'heading',
                    content: 'Introduction',
                    level: 2,
                    id: `section-${timestamp}-1`,
                },
                {
                    type: 'text',
                    content: JSON.stringify({
                        text: `Artificial intelligence has been transforming industries at an unprecedented pace. ${blogIdea || blogTitle} represents one of the most significant developments in this field. This article will explore the key concepts, applications, and future directions of this technology.`,
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id: `section-${timestamp}-2`,
                },
                {
                    type: 'heading',
                    content: 'Key Concepts',
                    level: 2,
                    id: `section-${timestamp}-3`,
                },
                {
                    type: 'text',
                    content: JSON.stringify({
                        text: "Before diving into applications, it's important to understand the fundamental concepts that underpin this technology. These building blocks form the foundation of how these systems work and why they're so powerful.",
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id: `section-${timestamp}-4`,
                },
                {
                    type: 'bullet-list',
                    items: [
                        'Machine Learning Algorithms',
                        'Neural Network Architectures',
                        'Training Methodologies',
                        'Evaluation Metrics',
                    ],
                    fontSize: 'normal',
                    id: `section-${timestamp}-5`,
                },
                includeImages
                    ? {
                          type: 'image',
                          url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&h=800&auto=format&fit=crop',
                          caption: 'AI technology visualization',
                          size: 'medium',
                          id: `section-${timestamp}-6`,
                      }
                    : null,
                {
                    type: 'heading',
                    content: 'Applications',
                    level: 2,
                    id: `section-${timestamp}-7`,
                },
                {
                    type: 'text',
                    content: JSON.stringify({
                        text: 'The applications of this technology span across numerous industries, from healthcare to finance, manufacturing to entertainment. Here are some of the most impactful use cases:',
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id: `section-${timestamp}-8`,
                },
                {
                    type: 'numbered-list',
                    items: [
                        'Predictive analytics for business intelligence',
                        'Natural language processing for customer service',
                        'Computer vision for quality control',
                        'Recommendation systems for personalized experiences',
                        'Autonomous systems for transportation and logistics',
                    ],
                    fontSize: 'normal',
                    id: `section-${timestamp}-9`,
                },
                includeCode
                    ? {
                          type: 'code',
                          content: `import tensorflow as tf
import numpy as np

# Simple neural network example
model = tf.keras.Sequential([
  tf.keras.layers.Dense(128, activation='relu', input_shape=(784,)),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10, activation='softmax')
])

model.compile(
  optimizer='adam',
  loss='sparse_categorical_crossentropy',
  metrics=['accuracy']
)`,
                          language: 'python',
                          id: `section-${timestamp}-10`,
                      }
                    : null,
                {
                    type: 'heading',
                    content: 'Future Directions',
                    level: 2,
                    id: `section-${timestamp}-11`,
                },
                {
                    type: 'text',
                    content: JSON.stringify({
                        text: "As technology continues to evolve, we can expect several exciting developments in this field. Researchers are working on addressing current limitations while exploring new frontiers of what's possible.",
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id: `section-${timestamp}-12`,
                },
                {
                    type: 'quote',
                    content:
                        'The future of AI is not about replacing humans, but augmenting human capabilities and solving problems that were previously intractable.',
                    citation: 'Dr. Andrew Ng',
                    fontSize: 'normal',
                    id: `section-${timestamp}-13`,
                },
                {
                    type: 'heading',
                    content: 'Conclusion',
                    level: 2,
                    id: `section-${timestamp}-14`,
                },
                {
                    type: 'text',
                    content: JSON.stringify({
                        text: `${blogIdea || blogTitle} represents a significant frontier in artificial intelligence research and application. As we've explored in this article, the technology offers tremendous potential across various domains while also presenting important challenges that researchers and practitioners must address.`,
                        format: {
                            bold: false,
                            italic: false,
                            align: 'left',
                            fontSize: 'normal',
                        },
                    }),
                    id: `section-${timestamp}-15`,
                },
            ].filter(Boolean),
        }
    }

    // Prevent rendering if not open to avoid unnecessary state updates
    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Blog Generator
                    </DialogTitle>
                </DialogHeader>

                {!generatedBlog ? (
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        <TabsList className="grid grid-cols-2 w-[400px] mx-auto">
                            <TabsTrigger
                                value="idea"
                                className="flex items-center gap-2"
                            >
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
                            <TabsContent
                                value="idea"
                                className="mt-0 space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="blog-idea">
                                        What would you like to write about?
                                    </Label>
                                    <Textarea
                                        id="blog-idea"
                                        placeholder="Describe your blog idea or topic..."
                                        value={blogIdea}
                                        onChange={(e) =>
                                            setBlogIdea(e.target.value)
                                        }
                                        className="min-h-[120px]"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Provide a brief description of your blog
                                        topic or the main idea you want to
                                        explore.
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
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                    />
                                    <p className="text-xs text-gray-500">
                                        You can provide a specific title or let
                                        the AI generate one based on your idea.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">
                                        Need inspiration? Try one of these
                                        topics:
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {SAMPLE_TOPICS.slice(0, 4).map(
                                            (topic, index) => (
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
                                            )
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="advanced"
                                className="mt-0 space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tone">
                                            Writing Tone
                                        </Label>
                                        <Select
                                            value={tone}
                                            onValueChange={setTone}
                                        >
                                            <SelectTrigger id="tone">
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
                                        <Label htmlFor="audience">
                                            Target Audience
                                        </Label>
                                        <Select
                                            value={targetAudience}
                                            onValueChange={setTargetAudience}
                                        >
                                            <SelectTrigger id="audience">
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

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="word-count">
                                            Approximate Word Count: {wordCount}
                                        </Label>
                                    </div>
                                    <Slider
                                        id="word-count"
                                        min={500}
                                        max={2000}
                                        step={100}
                                        value={[wordCount]}
                                        onValueChange={(value) =>
                                            setWordCount(value[0])
                                        }
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>500</span>
                                        <span>1000</span>
                                        <span>1500</span>
                                        <span>2000</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">
                                        Content Elements
                                    </h3>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="include-images"
                                            checked={includeImages}
                                            onChange={(e) =>
                                                setIncludeImages(
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <Label
                                            htmlFor="include-images"
                                            className="text-sm cursor-pointer"
                                        >
                                            Include images and visual elements
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="include-code"
                                            checked={includeCode}
                                            onChange={(e) =>
                                                setIncludeCode(e.target.checked)
                                            }
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <Label
                                            htmlFor="include-code"
                                            className="text-sm cursor-pointer"
                                        >
                                            Include code examples (for technical
                                            topics)
                                        </Label>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                ) : (
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
                                    Your AI-generated blog is ready to use.
                                    Click `Use This Blog` to import it into the
                                    editor.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Title</h3>
                            <div className="p-3 bg-gray-50 rounded-md">
                                {generatedBlog.title}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Summary</h3>
                            <div className="p-3 bg-gray-50 rounded-md">
                                {generatedBlog.summary}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Content Preview</h3>
                            <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                                <h2 className="text-xl font-bold mb-4">
                                    {generatedBlog.title}
                                </h2>

                                {generatedBlog.sections
                                    .slice(0, 5)
                                    .map((section: any, index: number) => {
                                        if (section.type === 'heading') {
                                            return (
                                                <h3
                                                    key={index}
                                                    className="text-lg font-semibold mt-4 mb-2"
                                                >
                                                    {section.content}
                                                </h3>
                                            )
                                        } else if (section.type === 'text') {
                                            try {
                                                const parsedContent =
                                                    JSON.parse(section.content)
                                                return (
                                                    <p
                                                        key={index}
                                                        className="mb-3"
                                                    >
                                                        {parsedContent.text}
                                                    </p>
                                                )
                                            } catch (e) {
                                                return (
                                                    <p
                                                        key={index}
                                                        className="mb-3"
                                                    >
                                                        {section.content}
                                                    </p>
                                                )
                                            }
                                        } else if (
                                            section.type === 'bullet-list'
                                        ) {
                                            return (
                                                <ul
                                                    key={index}
                                                    className="list-disc pl-6 mb-3 space-y-1"
                                                >
                                                    {section.items.map(
                                                        (
                                                            item: any,
                                                            i: number
                                                        ) => (
                                                            <li key={i}>
                                                                {item}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )
                                        } else if (
                                            section.type === 'numbered-list'
                                        ) {
                                            return (
                                                <ol
                                                    key={index}
                                                    className="list-decimal pl-6 mb-3 space-y-1"
                                                >
                                                    {section.items.map(
                                                        (
                                                            item: any,
                                                            i: number
                                                        ) => (
                                                            <li key={i}>
                                                                {item}
                                                            </li>
                                                        )
                                                    )}
                                                </ol>
                                            )
                                        }
                                        return null
                                    })}

                                <p className="text-gray-500 italic mt-4">
                                    ... (preview showing first 5 sections of{' '}
                                    {generatedBlog.sections.length} total)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3 mt-4">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-red-800">
                                Generation Failed
                            </h3>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                <Separator className="my-4" />

                <DialogFooter>
                    {!generatedBlog ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isGenerating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerateBlog}
                                disabled={isGenerating || (!blogIdea && !title)}
                                className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {generationStep === 0 && 'Analyzing...'}
                                        {generationStep === 1 &&
                                            'Creating outline...'}
                                        {generationStep === 2 &&
                                            'Writing content...'}
                                        {generationStep === 3 &&
                                            'Adding details...'}
                                        {generationStep === 4 &&
                                            'Adding images...'}
                                        {generationStep === 5 &&
                                            'Finalizing...'}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate Blog
                                    </>
                                )}
                            </Button>
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
                                <Sparkles className="h-4 w-4 mr-2" />
                                Use This Blog
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
