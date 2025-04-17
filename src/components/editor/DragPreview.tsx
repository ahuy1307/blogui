'use client'
import { SectionType } from '@/types/editor'
import {
    FileText,
    ImageIcon,
    Code,
    ListOrdered,
    List,
    Quote,
    Minus,
    Video,
    Columns,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DragPreviewProps {
    type: string
    section?: SectionType
}

export function DragPreview({ type, section }: DragPreviewProps) {
    // Get the appropriate icon based on section type
    const t = useTranslations('write')
    const getIcon = () => {
        switch (type) {
            case 'text':
                return <FileText className="h-5 w-5 text-purple-500" />
            case 'heading':
                return <FileText className="h-5 w-5 text-purple-500" />
            case 'image':
                return <ImageIcon className="h-5 w-5 text-purple-500" />
            case 'code':
                return <Code className="h-5 w-5 text-purple-500" />
            case 'numbered-list':
                return <ListOrdered className="h-5 w-5 text-purple-500" />
            case 'bullet-list':
                return <List className="h-5 w-5 text-purple-500" />
            case 'quote':
                return <Quote className="h-5 w-5 text-purple-500" />
            case 'divider':
                return <Minus className="h-5 w-5 text-purple-500" />
            case 'video':
                return <Video className="h-5 w-5 text-purple-500" />
            case 'column-container':
                return <Columns className="h-5 w-5 text-purple-500" />
            default:
                return <FileText className="h-5 w-5 text-purple-500" />
        }
    }

    // Get preview content based on section type and data
    const getPreviewContent = () => {
        if (!section) {
            return (
                <span className="text-sm font-medium">
                    {type.replace('-', ' ')}
                </span>
            )
        }

        switch (section.type) {
            case 'text':
                let displayText = t('textContent')
                try {
                    if (
                        typeof section.content === 'string' &&
                        section.content.startsWith('{')
                    ) {
                        const parsed = JSON.parse(section.content)
                        if (parsed.text) {
                            displayText =
                                parsed.text.substring(0, 30) +
                                (parsed.text.length > 30 ? '...' : '')
                        }
                    } else {
                        displayText =
                            section.content.substring(0, 30) +
                            (section.content.length > 30 ? '...' : '')
                    }
                } catch (e) {
                    // Use default text
                }
                return <span className="text-sm">{displayText}</span>
            case 'heading':
                return (
                    <span className="text-sm font-bold">
                        {section.content || t('heading')}
                    </span>
                )
            case 'image':
                return (
                    <span className="text-sm">
                        {section.caption || t('image')}
                    </span>
                )
            case 'code':
                return (
                    <span className="text-sm font-mono">
                        {section.language || t('code')}
                    </span>
                )
            case 'numbered-list':
                return <span className="text-sm">{t('numberedList')}</span>
            case 'bullet-list':
                return <span className="text-sm">{t('bulletList')}</span>
            case 'quote':
                return (
                    <span className="text-sm italic">
                        {section.content.substring(0, 30) || t('quote')}
                    </span>
                )
            case 'divider':
                return <span className="text-sm">{t('divider')}</span>
            case 'video':
                return (
                    <span className="text-sm">
                        {section.caption || t('video')}
                    </span>
                )
            case 'column-container':
                return (
                    <span className="text-sm">
                        {section.columns} {t('collumns')}
                    </span>
                )
            default:
                return <span className="text-sm">{type.replace('-', ' ')}</span>
        }
    }

    return (
        <div className="flex items-center gap-2 bg-white border border-purple-500 rounded-md p-3 shadow-md">
            {getIcon()}
            {getPreviewContent()}
        </div>
    )
}
