'use client'

import { useState } from 'react'
import { ImageIcon, Video, Copy, Check, Sun, Moon } from 'lucide-react'
import type { SectionType } from '@/types/editor'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/other-ui/useToast'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface PreviewSectionProps {
    section: SectionType
    className?: string
}

export function PreviewSection({ section, className }: PreviewSectionProps) {
    const t = useTranslations('write')
    const [copied, setCopied] = useState(false)
    const [showFullCode, setShowFullCode] = useState(false) // State to toggle full code display
    const [isDarkTheme, setIsDarkTheme] = useState(true) // State to toggle code theme
    const { toast } = useToast()

    const spacingStyles = {
        marginTop: section.marginTop && section.marginTop + 36,
        marginBottom: section.marginBottom && section.marginBottom + 36,
    }
    // Helper function to apply text formatting based on class names
    const formatTextContent = (content: string) => {
        // Check if content is a JSON string with formatting (old format)
        if (
            typeof content === 'string' &&
            content.startsWith('{') &&
            content.endsWith('}')
        ) {
            try {
                const parsedContent = JSON.parse(content)
                if (
                    parsedContent.text !== undefined &&
                    parsedContent.format !== undefined
                ) {
                    const { text, format } = parsedContent
                    const formatClassName = cn(
                        format.bold ? 'font-bold' : '',
                        format.italic ? 'italic' : '',
                        format.align == '' ? 'text-justify' : '',
                        format.align === 'left' ? 'text-left' : '',
                        format.align === 'center' ? 'text-center' : '',
                        format.align === 'right' ? 'text-right' : '',
                        format.fontSize === 'small' ? 'text-sm' : '',
                        format.fontSize === 'normal' ? 'text-base' : '',
                        format.fontSize === 'large' ? 'text-lg' : '',
                        format.fontSize === 'xlarge' ? 'text-xl' : ''
                        // 'whitespace-pre-wrap break-words'
                    )
                    return <div className={formatClassName}>{text}</div>
                }
            } catch (e) {
                // Not valid JSON with format, fall through to treat as HTML
            }
        }

        // Default case - treat as HTML from react-quill
        // We need to render the HTML without prose styles to respect quill's output.
        return (
            <div
                className={cn(
                    'ql-editor',
                    className,
                    '[&_a]:text-blue-600 [&_a]:underline'
                )}
                style={{
                    textAlign: 'justify',
                }}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        )
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)

        toast({
            title: t('copyToClipboard'),
            description: t('copyCodeToClipBoardDesc'),
        })

        setTimeout(() => setCopied(false), 2000)
    }

    switch (section.type) {
        case 'text':
            return (
                <div
                    className="text-justify text-base md:text-lg"
                    style={{
                        ...spacingStyles,
                    }}
                >
                    {formatTextContent(section.content) || t('noContentYet')}
                </div>
            )

        case 'image':
            return (
                <figure
                    className="mb-6"
                    style={{
                        ...spacingStyles,
                    }}
                >
                    {section.url ? (
                        <Image
                            src={section.url || '/images/default_image.jpg'}
                            alt={section.caption || 'Blog image'}
                            width={
                                section.size === 'small'
                                    ? 300
                                    : section.size === 'medium'
                                      ? 500
                                      : section.size === 'large'
                                        ? 800
                                        : 1000
                            }
                            height={
                                section.size === 'small'
                                    ? 300
                                    : section.size === 'medium'
                                      ? 500
                                      : section.size === 'large'
                                        ? 800
                                        : 1000
                            }
                            className={cn(
                                'w-full h-auto rounded-md',
                                section.size === 'small' &&
                                    'max-w-[300px] mx-auto',
                                section.size === 'medium' &&
                                    'max-w-[500px] mx-auto',
                                section.size === 'large' &&
                                    'max-w-[800px] mx-auto',
                                section.size === 'full' && 'max-w-none'
                            )}
                        />
                    ) : (
                        <div className="bg-gray-200 w-full h-48 rounded-md flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                    {section.caption && (
                        <figcaption className="text-center text-gray-500 mt-2 text-sm">
                            {section.caption}
                        </figcaption>
                    )}
                </figure>
            )

        case 'code':
            const MAX_LINES = 15 // Maximum number of lines to show initially
            const codeLines = section.content.split('\n')
            const isTruncated = codeLines.length > MAX_LINES

            return (
                <div
                    className="mb-6 relative"
                    style={{
                        ...spacingStyles,
                    }}
                >
                    <div
                        className={cn(
                            'px-4 py-2 rounded-t-md text-xs flex justify-between items-center',
                            isDarkTheme
                                ? 'bg-gray-800 text-gray-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-300'
                        )}
                    >
                        <span>{section.language || 'javascript'}</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyToClipboard(section.content)}
                                className={cn(
                                    'transition-colors',
                                    isDarkTheme
                                        ? 'text-gray-300 hover:text-white'
                                        : 'text-gray-600 hover:text-black'
                                )}
                                aria-label="Copy code"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={() => setIsDarkTheme(!isDarkTheme)}
                                className={cn(
                                    'transition-colors',
                                    isDarkTheme
                                        ? 'text-gray-300 hover:text-white'
                                        : 'text-gray-600 hover:text-black'
                                )}
                                aria-label="Toggle theme"
                            >
                                {isDarkTheme ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    {isTruncated && (
                        <button
                            onClick={() => setShowFullCode(!showFullCode)}
                            className="text-purple-500 hover:text-purple-700 mt-1 text-sm text-right float-right px-1 py-2 w-full transition-all duration-300"
                        >
                            {showFullCode ? t('showLess') : t('showMore')}
                        </button>
                    )}
                    <pre
                        className={cn(
                            'my-2 p-4 rounded-b-md overflow-x-auto whitespace-pre-wrap break-words transition-all duration-300',
                            isDarkTheme
                                ? 'bg-gray-900 text-gray-100'
                                : 'bg-gray-50 text-gray-800 border border-gray-300'
                        )}
                    >
                        <code>
                            {showFullCode
                                ? section.content || t('yourCodeHere')
                                : codeLines.slice(0, MAX_LINES).join('\n')}
                        </code>
                    </pre>
                </div>
            )

        case 'heading':
            if (section.level === 1) {
                return (
                    <h1
                        className="text-3xl font-bold mb-4 mt-6"
                        style={{
                            ...spacingStyles,
                        }}
                    >
                        {section.content || 'Heading 1'}
                    </h1>
                )
            } else if (section.level === 2) {
                return (
                    <h2
                        className="text-2xl font-bold mb-3 mt-6"
                        style={{
                            ...spacingStyles,
                        }}
                    >
                        {section.content || 'Heading 2'}
                    </h2>
                )
            } else {
                return (
                    <h3
                        className="text-xl font-bold mb-2 mt-6"
                        style={{
                            ...spacingStyles,
                        }}
                    >
                        {section.content || 'Heading 3'}
                    </h3>
                )
            }

        case 'numbered-list':
            return (
                <div
                    style={{
                        ...spacingStyles,
                    }}
                >
                    {section.title && (
                        <h6 className="font-bold mb-2 text-black">
                            {section.title}
                        </h6>
                    )}
                    <ol
                        className={cn(
                            'list-decimal pl-6 mb-6 space-y-2 mt-4',
                            section.fontSize === 'small' && 'text-sm',
                            section.fontSize === 'normal' && 'text-base',
                            section.fontSize === 'large' && 'text-lg',
                            section.fontSize === 'xlarge' && 'text-xl'
                        )}
                    >
                        {section.items.length > 0 ? (
                            section.items.map((item, index) => (
                                <li
                                    key={index}
                                    className="whitespace-pre-wrap break-words m-0"
                                >
                                    {item || t('listItem')}
                                </li>
                            ))
                        ) : (
                            <li>{t('listItem')}</li>
                        )}
                    </ol>
                </div>
            )

        case 'bullet-list':
            return (
                <div
                    style={{
                        ...spacingStyles,
                    }}
                >
                    {section.title && (
                        <h6 className="font-bold mb-2 text-black">
                            {section.title}
                        </h6>
                    )}
                    <ul
                        className={cn(
                            'list-disc pl-6 mb-6 space-y-2 mt-4',
                            section.fontSize === 'small' && 'text-sm',
                            section.fontSize === 'normal' && 'text-base',
                            section.fontSize === 'large' && 'text-lg',
                            section.fontSize === 'xlarge' && 'text-xl'
                        )}
                    >
                        {section.items.length > 0 ? (
                            section.items.map((item, index) => (
                                <li
                                    key={index}
                                    className="whitespace-pre-wrap break-words m-0"
                                >
                                    {item || t('listItem')}
                                </li>
                            ))
                        ) : (
                            <li>{t('listItem')}</li>
                        )}
                    </ul>
                </div>
            )

        case 'quote':
            return (
                <blockquote
                    style={{
                        ...spacingStyles,
                    }}
                    className={cn(
                        'border-l-4 border-purple-300 pl-4 italic mb-6 bg-purple-50 p-4 rounded-r-md',
                        section.fontSize === 'small' && 'text-sm',
                        section.fontSize === 'normal' && 'text-base',
                        section.fontSize === 'large' && 'text-lg',
                        section.fontSize === 'xlarge' && 'text-xl'
                    )}
                >
                    <p className="whitespace-pre-wrap break-words">
                        {section.content || 'Quote text'}
                    </p>
                    {section.citation && (
                        <footer className="text-gray-500 text-sm mt-2 not-italic">
                            — {section.citation}
                        </footer>
                    )}
                </blockquote>
            )

        case 'divider':
            const dividerSettings = section.dinhDang || {}
            const dividerType =
                dividerSettings.dividerType || section.dividerType || 'solid'
            const spacing = dividerSettings.spacing || section.spacing || 8
            const thickness =
                dividerSettings.thickness || section.thickness || 1
            const color = dividerSettings.color || section.color || '#e5e7eb'

            if (dividerType === 'space') {
                return (
                    <div
                        style={{
                            height: `${spacing}px`,
                            margin: '2rem 0',
                            ...spacingStyles,
                        }}
                    ></div>
                )
            } else if (dividerType === 'gradient') {
                return (
                    <div
                        className="w-full my-8"
                        style={{
                            height: `${thickness}px`,
                            background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                            margin: `${spacing}px 0`,
                            ...spacingStyles,
                        }}
                    ></div>
                )
            } else {
                return (
                    <div
                        className="w-full my-8"
                        style={{
                            borderTopWidth:
                                dividerType === 'double'
                                    ? '3px'
                                    : `${thickness}px`,
                            borderTopStyle:
                                (dividerType as
                                    | 'solid'
                                    | 'dashed'
                                    | 'dotted'
                                    | 'double') || 'solid',
                            borderTopColor: color,
                            margin: `${spacing}px 0`,
                            ...spacingStyles,
                        }}
                    ></div>
                )
            }

        case 'video':
            return (
                <figure
                    className="mb-6"
                    style={{
                        ...spacingStyles,
                    }}
                >
                    {section.url ? (
                        <div className="aspect-video rounded-md overflow-hidden shadow-md">
                            <iframe
                                src={section.url}
                                title={section.caption || 'Video'}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="bg-gray-200 w-full aspect-video rounded-md flex items-center justify-center">
                            <Video className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                    {section.caption && (
                        <figcaption className="text-center text-gray-500 mt-2 text-sm">
                            {section.caption}
                        </figcaption>
                    )}
                </figure>
            )

        default:
            return null
    }
}
