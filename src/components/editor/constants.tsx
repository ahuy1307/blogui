import {
    FileText,
    Type,
    ImageIcon,
    Code,
    ListOrdered,
    List,
    Quote,
    Minus,
    Video,
} from 'lucide-react'
import { SectionTypeDefault } from '@/types/editor'

// Sidebar section templates
export const SIDEBAR_SECTIONS: {
    type: SectionTypeDefault
    icon: React.ReactElement
    label: string
}[] = [
    { type: 'text', icon: <FileText className="h-5 w-5" />, label: 'Text' },
    { type: 'heading', icon: <Type className="h-5 w-5" />, label: 'Heading' },
    { type: 'image', icon: <ImageIcon className="h-5 w-5" />, label: 'Image' },
    { type: 'code', icon: <Code className="h-5 w-5" />, label: 'Code' },
    {
        type: 'numbered-list',
        icon: <ListOrdered className="h-5 w-5" />,
        label: 'Numbered List',
    },
    {
        type: 'bullet-list',
        icon: <List className="h-5 w-5" />,
        label: 'Bullet List',
    },
    { type: 'quote', icon: <Quote className="h-5 w-5" />, label: 'Quote' },
    { type: 'divider', icon: <Minus className="h-5 w-5" />, label: 'Divider' },
    { type: 'video', icon: <Video className="h-5 w-5" />, label: 'Video' },
]
