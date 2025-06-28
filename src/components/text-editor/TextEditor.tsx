'use client'

import 'react-quill/dist/quill.snow.css'
import 'quill-emoji/dist/quill-emoji.css'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import Quill from 'quill'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface TextEditorProps {
    value: string
    onChange: (value: string) => void
    className?: string
}

export function TextEditor({ value, onChange, className }: TextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null)

    const modules = {
        toolbar: [
            [{ size: ['small', false, 'large'] }], // Use 'false' for normal/medium size
            ['bold', 'italic', 'underline', 'strike'],
            // [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'emoji'],
            // ['clean'],
        ],
    }

    const formats = [
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        // 'list',
        // 'bullet',
        'align',
        'link',
        'table',
        'emoji',
    ]

    useEffect(() => {
        if (editorRef.current) {
            const tooltips: { [key: string]: string } = {
                'ql-bold': 'Bold (Ctrl+B)',
                'ql-italic': 'Italic (Ctrl+I)',
                'ql-underline': 'Underline (Ctrl+U)',
                'ql-strike': 'Strikethrough',
                'ql-link': 'Insert Link',
                'ql-align': 'Alignment',
                'ql-size': 'Font Size',
                'ql-emoji': 'Insert Emoji',
            }

            Object.entries(tooltips).forEach(([className, title]) => {
                const elements =
                    editorRef.current?.querySelectorAll<HTMLElement>(
                        `.ql-toolbar .${className}`
                    )
                elements?.forEach((el) => {
                    // For dropdowns, the title should be on the container. For buttons, it's the button itself.
                    el.title = title
                })
            })
        }
    }, [])

    let processedValue = value
    try {
        const parsed = JSON.parse(value)
        if (parsed && typeof parsed.text === 'string' && parsed.format) {
            processedValue = parsed.text
        }
    } catch (e) {
        // Not a JSON string, use value as is.
    }

    return (
        <div ref={editorRef} className={cn('h-[350px] pb-12', className)}>
            <style jsx global>{`
                .ql-editor {
                    font-size: 16px;
                }
            `}</style>
            <ReactQuill
                theme="snow"
                value={processedValue}
                onChange={onChange}
                modules={modules}
                formats={formats}
                className="h-full"
            />
        </div>
    )
}
