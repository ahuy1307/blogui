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
    label: {
        en: string
        vi: string
    }
}[] = [
    {
        type: 'text',
        icon: <FileText className="h-5 w-5" />,
        label: {
            en: 'Text',
            vi: 'Văn bản',
        },
    },
    {
        type: 'heading',
        icon: <Type className="h-5 w-5" />,
        label: {
            en: 'Heading',
            vi: 'Tiêu đề',
        },
    },
    {
        type: 'image',
        icon: <ImageIcon className="h-5 w-5" />,
        label: {
            en: 'Image',
            vi: 'Hình ảnh',
        },
    },
    {
        type: 'code',
        icon: <Code className="h-5 w-5" />,
        label: {
            en: 'Code',
            vi: 'Mã',
        },
    },
    {
        type: 'numbered-list',
        icon: <ListOrdered className="h-5 w-5" />,
        label: {
            en: 'Numbered List',
            vi: 'Danh sách số',
        },
    },
    {
        type: 'bullet-list',
        icon: <List className="h-5 w-5" />,
        label: {
            en: 'Bullet List',
            vi: 'Danh sách dấu đầu dòng',
        },
    },
    {
        type: 'quote',
        icon: <Quote className="h-5 w-5" />,
        label: {
            en: 'Quote',
            vi: 'Trích dẫn',
        },
    },
    {
        type: 'divider',
        icon: <Minus className="h-5 w-5" />,
        label: {
            en: 'Divider',
            vi: 'Phân cách',
        },
    },
    {
        type: 'video',
        icon: <Video className="h-5 w-5" />,
        label: {
            en: 'Video',
            vi: 'Video',
        },
    },
]
