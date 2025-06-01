'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import {
    Bold,
    Italic,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/other-ui/Select'
import { cn } from '@/lib/utils'
import { Button } from '@/components/other-ui/Button'
import { useTranslations } from 'next-intl'

interface TextEditorProps {
    value: string
    onChange: (value: string) => void
    className?: string
}

type TextFormat = {
    bold: boolean
    italic: boolean
    align: 'left' | 'center' | 'right'
    fontSize: string
}

// Update the TextEditor component to save formatting data
export function TextEditor({ value, onChange, className }: TextEditorProps) {
    const t = useTranslations('write')
    const [text, setText] = useState('')
    const [format, setFormat] = useState<TextFormat>({
        bold: false,
        italic: false,
        align: 'left',
        fontSize: 'normal',
    })

    // Extract format and text from value if it contains formatting data
    useEffect(() => {
        if (typeof value === 'string') {
            if (value.startsWith('{') && value.endsWith('}')) {
                try {
                    const parsedValue = JSON.parse(value)
                    if (
                        parsedValue.text !== undefined &&
                        parsedValue.format !== undefined
                    ) {
                        setText(parsedValue.text)
                        setFormat(parsedValue.format)
                        return
                    }
                } catch (e) {
                    // Not valid JSON with format
                }
            }
            // If not a formatted value, just use the raw text
            setText(value)
        }
    }, [value])

    const handleFormatChange = (key: keyof TextFormat, newValue: any) => {
        const newFormat = {
            ...format,
            [key]: newValue,
        }
        setFormat(newFormat)

        // Save both text and format in the value
        const formattedValue = JSON.stringify({
            text: text,
            format: newFormat,
        })

        onChange(formattedValue)
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value
        setText(newText)

        // Save both text and format in the value
        const formattedValue = JSON.stringify({
            text: newText,
            format,
        })
        onChange(formattedValue)
    }

    const formatClassName = cn(
        format.bold ? 'font-bold' : '',
        format.italic ? 'italic' : '',
        format.align === 'left' ? 'text-left' : '',
        format.align === 'center' ? 'text-center' : '',
        format.align === 'right' ? 'text-right' : '',
        format.fontSize === 'small' ? 'text-sm' : '',
        format.fontSize === 'normal' ? 'text-base' : '',
        format.fontSize === 'large' ? 'text-lg' : '',
        format.fontSize === 'xlarge' ? 'text-xl' : '',
        'w-full min-h-[150px] border-gray-300 focus-visible:ring-purple-500 hide-scrollbar rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-500 resize-none',
        className
    )

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center border border-gray-300 rounded-md p-1 bg-white">
                <Select
                    value={format.fontSize}
                    onValueChange={(value) =>
                        handleFormatChange('fontSize', value)
                    }
                >
                    <SelectTrigger className="w-[150px] h-8 border-0 focus:ring-0">
                        <Type className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="small">{t('small')}</SelectItem>
                        <SelectItem value="normal">{t('normal')}</SelectItem>
                        <SelectItem value="large">{t('large')}</SelectItem>
                        <SelectItem value="xlarge">
                            {t('extraLarge')}
                        </SelectItem>
                    </SelectContent>
                </Select>

                <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block" />

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFormatChange('bold', !format.bold)}
                        className={cn(
                            'h-8 px-2 rounded-md',
                            format.bold ? 'bg-gray-200' : ''
                        )}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            handleFormatChange('italic', !format.italic)
                        }
                        className={cn(
                            'h-8 px-2 rounded-md',
                            format.italic ? 'bg-gray-200' : ''
                        )}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>

                    <div className="h-6 w-px bg-gray-300 mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFormatChange('align', 'left')}
                        className={cn(
                            'h-8 px-2 rounded-md',
                            format.align === 'left' ? 'bg-gray-200' : ''
                        )}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFormatChange('align', 'center')}
                        className={cn(
                            'h-8 px-2 rounded-md',
                            format.align === 'center' ? 'bg-gray-200' : ''
                        )}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFormatChange('align', 'right')}
                        className={cn(
                            'h-8 px-2 rounded-md',
                            format.align === 'right' ? 'bg-gray-200' : ''
                        )}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <textarea
                value={text}
                onChange={handleTextChange}
                className={formatClassName}
                placeholder="Enter your text here..."
                style={{
                    outlineColor: '#d1d5db',
                    marginTop: '16px',
                }}
            />
        </div>
    )
}
