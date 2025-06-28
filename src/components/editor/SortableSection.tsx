'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    GripVertical,
    ImageIcon,
    X,
    Plus,
    Video,
    Trash2,
    ArrowDown,
    Settings,
    Smile,
} from 'lucide-react'
import { Button } from '@/components/other-ui/Button'
import { Input } from '@/components/other-ui/Input'
import { Textarea } from '@/components/other-ui/Textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/other-ui/Select'
import { DividerSection } from '@/components/editor/DividerSection'
import type { SectionType } from '@/types/editor'
import { useState, useRef } from 'react'
import { Label } from '@/components/other-ui/Label'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/other-ui/useToast'
import { TextEditor } from '../text-editor/TextEditor'
import { CodeBlockEditor } from '../features/blog/CodeBlockEditor'
import Image from 'next/image'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/other-ui/Popover'
import { SIDEBAR_SECTIONS } from '@/components/editor/constants'
import { useLocale, useTranslations } from 'next-intl'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useIsMobile } from '@/hooks/useMobile'

interface SortableSectionProps {
    section: SectionType
    updateSection: (id: string, updates: Partial<SectionType>) => void
    deleteSection: (id: string) => void
    openImageModal: () => void
    openVideoModal?: () => void
    codeTheme?: 'light' | 'dark'
    addSectionAfter: (type: string, currentSectionId: string) => void
    sectionIndex: number
    totalSections: number
    moveSectionTo: (sectionId: string, newIndex: number) => void
    toggleCodeTheme?: () => void
}

export function SortableSection({
    section,
    updateSection,
    deleteSection,
    openImageModal,
    openVideoModal,
    addSectionAfter,
    sectionIndex,
    totalSections,
    moveSectionTo,
    ...props
}: SortableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id })
    const t = useTranslations('write.SortableSection')
    const [showAddMenu, setShowAddMenu] = useState(false)
    const [showPositionMenu, setShowPositionMenu] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const locale = useLocale()
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const [cursorPosition, setCursorPosition] = useState<number | null>(null)

    const positionOptions = Array.from({ length: totalSections }, (_, i) => ({
        value: i.toString(),
        label: `${t('position')} ${i + 1}`,
    }))

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    }

    const handleDelete = () => {
        setIsRemoving(true)
        setTimeout(() => {
            deleteSection(section.id)
            setIsRemoving(false) // Reset state after deletion
        }, 300) // Delay matches the CSS transition duration
    }

    function placeCaretAtEnd(el: HTMLElement) {
        el.focus()

        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false) // Đặt con trỏ ở cuối

        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
    }

    const handleInsertEmoji = (emoji: { native: string }) => {
        if (section.type === 'heading') {
            // For heading, set a default cursor position if none exists
            if (cursorPosition === null) {
                setCursorPosition(section.content.length)
            }

            const pos =
                cursorPosition !== null
                    ? cursorPosition
                    : section.content.length
            const newContent =
                section.content.substring(0, pos) +
                emoji.native +
                section.content.substring(pos)

            updateSection(section.id, { content: newContent })

            // Reset cursor position after a short delay to allow React to update the DOM
            setTimeout(() => {
                if (inputRef.current) {
                    const newCursorPos = pos + emoji.native.length
                    inputRef.current.focus()
                    inputRef.current.setSelectionRange(
                        newCursorPos,
                        newCursorPos
                    )
                }
            }, 10)
        } else if (section.type === 'text') {
            // For text editor, we need a different approach
            // First check if content is in JSON format
            console.log(section)
            try {
                const parser = new DOMParser()
                const doc = parser.parseFromString(section.content, 'text/html')

                // Tìm phần tử có nội dung cuối cùng
                const body = doc.body
                const elements = Array.from(body.childNodes).filter(
                    (n) =>
                        n.nodeType === Node.ELEMENT_NODE ||
                        n.nodeType === Node.TEXT_NODE
                )

                if (elements.length > 0) {
                    const lastEl = elements[elements.length - 1]

                    if (
                        lastEl.nodeType === Node.ELEMENT_NODE &&
                        lastEl instanceof HTMLElement
                    ) {
                        lastEl.innerHTML += emoji.native
                    } else if (lastEl.nodeType === Node.TEXT_NODE) {
                        lastEl.textContent += emoji.native
                    }
                }

                // Lấy lại HTML đã chỉnh sửa
                const updatedHtml = body.innerHTML
                updateSection(section.id, {
                    content: updatedHtml,
                })
                setTimeout(() => {
                    const editor = document.querySelector(
                        '[contenteditable="true"]'
                    )
                    if (editor instanceof HTMLElement) {
                        placeCaretAtEnd(editor)
                    }
                }, 5) // Delay vừa đủ để DOM render xong
            } catch (e) {
                // Not JSON, just append normally
                updateSection(section.id, {
                    content: section.content + emoji.native,
                })
            }
        }
        setShowEmojiPicker(false)
    }

    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
        setCursorPosition(e.currentTarget.selectionStart)
    }

    const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        setCursorPosition(e.currentTarget.selectionStart)
    }

    // Track input focus for heading to ensure cursor position is available
    const handleInputFocus = () => {
        if (inputRef.current && cursorPosition === null) {
            setCursorPosition(
                inputRef.current.selectionStart || section.content?.length || 0
            )
        }
    }

    const renderSpacingControls = () => {
        return (
            <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium">{t('spacing')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs text-gray-500">
                            {t('topMargin')}
                        </Label>
                        <Select
                            value={section.marginTop?.toString() || '0'}
                            onValueChange={(value) =>
                                updateSection(section.id, {
                                    marginTop: Number.parseInt(value),
                                })
                            }
                        >
                            <SelectTrigger className="w-full border-gray-300 focus:ring-purple-500">
                                <SelectValue placeholder="Top Margin" />
                            </SelectTrigger>
                            <SelectContent>
                                {[0, 16, 34, 64, 108].map((value) => (
                                    <SelectItem
                                        key={value}
                                        value={value.toString()}
                                    >
                                        {value}px
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500">
                            Bottom Margin
                        </Label>
                        <Select
                            value={section.marginBottom?.toString() || '0'}
                            onValueChange={(value) =>
                                updateSection(section.id, {
                                    marginBottom: Number.parseInt(value),
                                })
                            }
                        >
                            <SelectTrigger className="w-full border-gray-300 focus:ring-purple-500">
                                <SelectValue placeholder="Bottom Margin" />
                            </SelectTrigger>
                            <SelectContent>
                                {[0, 16, 34, 64, 108].map((value) => (
                                    <SelectItem
                                        key={value}
                                        value={value.toString()}
                                    >
                                        {value}px
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        )
    }

    const renderSectionContent = () => {
        switch (section.type) {
            case 'text':
                return (
                    <div className="relative">
                        <TextEditor
                            value={section.content}
                            onChange={(value) =>
                                updateSection(section.id, { content: value })
                            }
                        />
                        <div className="absolute top-2 right-2 hidden md:block">
                            <Popover
                                open={showEmojiPicker}
                                onOpenChange={setShowEmojiPicker}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full"
                                    >
                                        <Smile className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 border-none shadow-lg"
                                    align="end"
                                >
                                    <Picker
                                        data={data}
                                        onEmojiSelect={handleInsertEmoji}
                                        locale={locale}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                )

            case 'image':
                return (
                    <div className="space-y-3">
                        {section.url ? (
                            <div className="relative rounded-md overflow-hidden border border-gray-300">
                                <Image
                                    src={
                                        section.url ||
                                        '/images/default_image.jpg'
                                    }
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
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:bg-gray-50"
                                onClick={openImageModal}
                            >
                                <ImageIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500">{t('addImage')}</p>
                            </div>
                        )}

                        <div className="hidden md:flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium">
                                {t('imageSize')}:
                            </Label>
                            <Select
                                value={section.size || 'medium'}
                                onValueChange={(value) =>
                                    updateSection(section.id, { size: value })
                                }
                            >
                                <SelectTrigger className="w-[120px] border-gray-300 focus:ring-purple-500">
                                    <SelectValue placeholder="Image Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">
                                        {t('small')}
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        {t('medium')}
                                    </SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                    <SelectItem value="full">
                                        {t('full')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Input
                            value={section.caption || ''}
                            onChange={(e) =>
                                updateSection(section.id, {
                                    caption: e.target.value,
                                })
                            }
                            placeholder={t('imageCaptionOptional')}
                            className="border-gray-300 focus-visible:ring-purple-500"
                        />
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openImageModal}
                                className="border-gray-300 hover:bg-gray-100"
                            >
                                {t('changeImage')}
                            </Button>
                        </div>
                    </div>
                )

            case 'code':
                return (
                    <CodeBlockEditor
                        code={section.content}
                        language={section.language}
                        onCodeChange={(code) =>
                            updateSection(section.id, { content: code })
                        }
                        onLanguageChange={(language) =>
                            updateSection(section.id, { language })
                        }
                        theme={props.codeTheme}
                        onThemeChange={props.toggleCodeTheme}
                    />
                )

            case 'heading':
                return (
                    <div className="space-y-3">
                        <Select
                            value={section.level.toString()}
                            onValueChange={(value) =>
                                updateSection(section.id, {
                                    level: Number.parseInt(value) as 1 | 2 | 3,
                                })
                            }
                        >
                            <SelectTrigger className="w-[180px] border-gray-300 focus:ring-purple-500">
                                <SelectValue placeholder={t('headingLevel')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">
                                    {t('heading1')}
                                </SelectItem>
                                <SelectItem value="2">
                                    {t('heading2')}
                                </SelectItem>
                                <SelectItem value="3">
                                    {t('heading3')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <Input
                                ref={inputRef}
                                value={section.content}
                                onChange={(e) =>
                                    updateSection(section.id, {
                                        content: e.target.value,
                                    })
                                }
                                onClick={handleInputClick}
                                onKeyUp={handleInputKeyUp}
                                onFocus={handleInputFocus}
                                placeholder={t('headingText')}
                                className="border-gray-300 focus-visible:ring-purple-500 font-bold pr-10"
                                style={{
                                    fontSize:
                                        section.level === 1
                                            ? '2rem'
                                            : section.level === 2
                                              ? '1.5rem'
                                              : '1.25rem',
                                }}
                            />
                            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 hidden md:block">
                                <Popover
                                    open={showEmojiPicker}
                                    onOpenChange={setShowEmojiPicker}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-full"
                                        >
                                            <Smile className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0 border-none shadow-lg"
                                        align="end"
                                    >
                                        <Picker
                                            data={data}
                                            onEmojiSelect={handleInsertEmoji}
                                            locale={locale}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                )

            case 'numbered-list':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Label className="text-base font-medium block w-[100px]">
                                {t('listTitle')}:
                            </Label>
                            <Input
                                value={section.title || ''}
                                onChange={(e) =>
                                    updateSection(section.id, {
                                        title: e.target.value,
                                    })
                                }
                                placeholder={t('listTitleOptional')}
                                className="border-gray-300 focus-visible:ring-purple-500"
                                style={{
                                    fontSize: 16,
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Select
                                value={section.fontSize || 'normal'}
                                onValueChange={(value) =>
                                    updateSection(section.id, {
                                        fontSize: value,
                                    })
                                }
                            >
                                <SelectTrigger className="w-[120px] border-gray-300 focus:ring-purple-500">
                                    <SelectValue placeholder={t('fontSize')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">
                                        {t('small')}
                                    </SelectItem>
                                    <SelectItem value="normal">
                                        {t('normal')}
                                    </SelectItem>
                                    <SelectItem value="large">
                                        {t('large')}
                                    </SelectItem>
                                    <SelectItem value="xlarge">
                                        {t('extraLarge')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {section.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <span className="text-gray-500 w-6 text-right">
                                    {index + 1}.
                                </span>
                                <Input
                                    value={item}
                                    onChange={(e) => {
                                        const newItems = [...section.items]
                                        newItems[index] = e.target.value
                                        updateSection(section.id, {
                                            items: newItems,
                                        })
                                    }}
                                    placeholder={t('listItem')}
                                    className={cn(
                                        'border-gray-300 focus-visible:ring-purple-500',
                                        section.fontSize === 'small' &&
                                            'text-sm',
                                        section.fontSize === 'large' &&
                                            'text-lg',
                                        section.fontSize === 'xlarge' &&
                                            'text-xl'
                                    )}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const newItems = section.items.filter(
                                            (_, i) => i !== index
                                        )
                                        updateSection(section.id, {
                                            items: newItems.length
                                                ? newItems
                                                : [''],
                                        })
                                    }}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                updateSection(section.id, {
                                    items: [...section.items, ''],
                                })
                            }}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            {t('addItem')}
                        </Button>
                    </div>
                )

            case 'bullet-list':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Label className="text-base font-medium w-[100px]">
                                {t('listTitle')}:
                            </Label>
                            <Input
                                value={section.title || ''}
                                onChange={(e) =>
                                    updateSection(section.id, {
                                        title: e.target.value,
                                    })
                                }
                                placeholder={t('listTitleOptional')}
                                className="border-gray-300 focus-visible:ring-purple-500"
                                style={{
                                    fontSize: 16,
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Select
                                value={section.fontSize || 'normal'}
                                onValueChange={(value) =>
                                    updateSection(section.id, {
                                        fontSize: value,
                                    })
                                }
                            >
                                <SelectTrigger className="w-[120px] border-gray-300 focus:ring-purple-500">
                                    <SelectValue placeholder={t('fontSize')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">
                                        {t('small')}
                                    </SelectItem>
                                    <SelectItem value="normal">
                                        {t('normal')}
                                    </SelectItem>
                                    <SelectItem value="large">
                                        {t('large')}
                                    </SelectItem>
                                    <SelectItem value="xlarge">
                                        {t('extraLarge')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {section.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <span className="text-gray-500 w-6 text-right">
                                    •
                                </span>
                                <Input
                                    value={item}
                                    onChange={(e) => {
                                        const newItems = [...section.items]
                                        newItems[index] = e.target.value
                                        updateSection(section.id, {
                                            items: newItems,
                                        })
                                    }}
                                    placeholder="List item"
                                    className={cn(
                                        'border-gray-300 focus-visible:ring-purple-500',
                                        section.fontSize === 'small' &&
                                            'text-sm',
                                        section.fontSize === 'large' &&
                                            'text-lg',
                                        section.fontSize === 'xlarge' &&
                                            'text-xl'
                                    )}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const newItems = section.items.filter(
                                            (_, i) => i !== index
                                        )
                                        updateSection(section.id, {
                                            items: newItems.length
                                                ? newItems
                                                : [''],
                                        })
                                    }}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                updateSection(section.id, {
                                    items: [...section.items, ''],
                                })
                            }}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            {t('addItem')}
                        </Button>
                    </div>
                )

            case 'quote':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Select
                                value={section.fontSize || 'normal'}
                                onValueChange={(value) =>
                                    updateSection(section.id, {
                                        fontSize: value,
                                    })
                                }
                            >
                                <SelectTrigger className="w-[120px] border-gray-300 focus:ring-purple-500">
                                    <SelectValue placeholder={t('fontSize')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">
                                        {t('small')}
                                    </SelectItem>
                                    <SelectItem value="normal">
                                        {t('normal')}
                                    </SelectItem>
                                    <SelectItem value="large">
                                        {t('large')}
                                    </SelectItem>
                                    <SelectItem value="xlarge">
                                        {t('extraLarge')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Textarea
                            value={section.content}
                            onChange={(e) =>
                                updateSection(section.id, {
                                    content: e.target.value,
                                })
                            }
                            placeholder={t('quoteText')}
                            className={cn(
                                'min-h-[100px] border-gray-300 focus-visible:ring-purple-500 hide-scrollbar',
                                section.fontSize === 'small' && 'text-sm',
                                section.fontSize === 'large' && 'text-lg',
                                section.fontSize === 'xlarge' && 'text-xl'
                            )}
                        />
                        <Input
                            value={section.citation || ''}
                            onChange={(e) =>
                                updateSection(section.id, {
                                    citation: e.target.value,
                                })
                            }
                            placeholder={t('citationOptional')}
                            className="border-gray-300 focus-visible:ring-purple-500 italic"
                        />
                    </div>
                )

            case 'divider':
                return (
                    <DividerSection
                        dividerType={section.dividerType || 'solid'}
                        spacing={section.spacing || 8}
                        thickness={section.thickness || 4}
                        color={section.color || '#9c65d0'}
                        onUpdate={(updates) => {
                            // Create or update the dinhDang object
                            const currentFormat = section.dinhDang || {}
                            const newFormat = {
                                ...currentFormat,
                                dividerType:
                                    updates.dividerType ||
                                    section.dividerType ||
                                    'solid',
                                spacing:
                                    updates.spacing || section.spacing || 8,
                                thickness:
                                    updates.thickness || section.thickness || 1,
                                color:
                                    updates.color || section.color || '#e5e7eb',
                            }

                            // Update both the direct properties and the dinhDang object
                            updateSection(section.id, {
                                ...updates,
                                dinhDang: newFormat,
                            })
                        }}
                    />
                )

            case 'video':
                return (
                    <div className="space-y-3">
                        {section.url ? (
                            <div className="relative rounded-md overflow-hidden border border-gray-300 aspect-video">
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
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:bg-gray-50"
                                onClick={openVideoModal}
                            >
                                <Video className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500">{t('addVideo')}</p>
                            </div>
                        )}

                        <Input
                            value={section.caption || ''}
                            onChange={(e) =>
                                updateSection(section.id, {
                                    caption: e.target.value,
                                })
                            }
                            placeholder={t('videoCaptionOptional')}
                            className="border-gray-300 focus-visible:ring-purple-500"
                        />

                        {section.url && (
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={openVideoModal}
                                    className="border-gray-300 hover:bg-gray-100"
                                >
                                    {t('changeVideo')}
                                </Button>
                            </div>
                        )}
                    </div>
                )

            case 'column-container':
                return null

            default:
                return null
        }
    }

    const isMobile = useIsMobile()

    // Add a function to add a section to a specific column
    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                marginTop: section.marginTop && section.marginTop + 36,
                marginBottom: section.marginBottom && section.marginBottom + 36,
            }}
            className={cn(
                'bg-white border border-gray-200 rounded-md p-4 shadow-sm transition-all duration-400 ease-in-out',
                isRemoving
                    ? 'opacity-0 translate-y-[-20px] scale-95'
                    : 'opacity-100 translate-y-0 scale-100',
                section.marginTop && `mt-${section.marginTop + 100}`,
                section.marginBottom && `mb-${section.marginBottom + 100}`
            )}
            data-dragging={isDragging ? 'true' : 'false'}
            data-id={section.id}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab p-2 hover:bg-gray-100 rounded-md"
                    >
                        <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="font-medium capitalize text-gray-700">
                        {section.type.replace('-', ' ')}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {t('position')} {sectionIndex + 1} {t('of')}{' '}
                        {totalSections}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Popover open={showAddMenu} onOpenChange={setShowAddMenu}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-purple-500 hover:bg-purple-50 transition-colors h-8 w-8 p-0"
                                title={t('addSectionAfter')}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium px-2 py-1">
                                    {t('addSectionAfter')}
                                </h3>
                                <div className="grid grid-cols-2 gap-1">
                                    {SIDEBAR_SECTIONS.map((sectionType) => (
                                        <Button
                                            key={sectionType.type}
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start text-xs"
                                            onClick={() => {
                                                addSectionAfter(
                                                    sectionType.type,
                                                    section.id
                                                )
                                                setShowAddMenu(false)
                                            }}
                                        >
                                            <div className="mr-2">
                                                {sectionType.icon}
                                            </div>
                                            <p className="truncate text-clip">
                                                {
                                                    sectionType.label[
                                                        locale as 'en' | 'vi'
                                                    ]
                                                }
                                            </p>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Position selector */}
                    <Popover
                        open={showPositionMenu}
                        onOpenChange={setShowPositionMenu}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-purple-500 hover:bg-purple-50 transition-colors h-8 w-8 p-0"
                                title={t('changePosition')}
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium px-2 py-1">
                                    {t('moveToNewPosition')}
                                </h3>
                                <div className="max-h-48 overflow-y-auto">
                                    {positionOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                'justify-start text-xs w-full',
                                                Number.parseInt(
                                                    option.value
                                                ) === sectionIndex &&
                                                    'bg-purple-100 text-purple-700'
                                            )}
                                            onClick={() => {
                                                moveSectionTo(
                                                    section.id,
                                                    Number.parseInt(
                                                        option.value
                                                    )
                                                )
                                                setShowPositionMenu(false)
                                            }}
                                            disabled={
                                                Number.parseInt(
                                                    option.value
                                                ) === sectionIndex
                                            }
                                        >
                                            {option.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Spacing settings */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-purple-500 hover:bg-purple-50 transition-colors h-8 w-8 p-0"
                                title={t('spacingSettings')}
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-72 p-4"
                            align={isMobile ? 'end' : 'center'}
                        >
                            {renderSpacingControls()}
                        </PopoverContent>
                    </Popover>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors h-8 w-8 p-0"
                        title={t('deleteSection')}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {renderSectionContent()}
        </div>
    )
}
