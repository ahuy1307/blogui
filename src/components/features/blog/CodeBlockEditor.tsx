'use client'

import { useState, useEffect, useRef } from 'react'
import { BookOpen, Sun, Moon, Search, Copy, Check } from 'lucide-react'
import { Button } from '@/components/other-ui/Button'
import { Input } from '@/components/other-ui/Input'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/other-ui/useToast'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { materialLight } from '@ddietr/codemirror-themes/material-light'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { sql } from '@codemirror/lang-sql'
import { markdown } from '@codemirror/lang-markdown'
import { json } from '@codemirror/lang-json'
import { cpp } from '@codemirror/lang-cpp'
import { lineNumbers, highlightActiveLine } from '@codemirror/view'
import { keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { useTranslations } from 'next-intl'

interface CodeBlockEditorProps {
    code: string
    onCodeChange: (code: string) => void
    theme?: 'light' | 'dark'
    onThemeChange?: () => void
    language: string
    onLanguageChange: (language: string) => void
}

const LANGUAGE_OPTIONS = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'jsx', label: 'JSX' },
    { value: 'tsx', label: 'TSX' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'bash', label: 'Bash' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },
]

export function CodeBlockEditor({
    code,
    onCodeChange,
    theme = 'dark',
    onThemeChange,
    language,
    onLanguageChange,
}: CodeBlockEditorProps) {
    const t = useTranslations('write')
    const [localCode, setLocalCode] = useState(code || '')
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredLanguages, setFilteredLanguages] = useState(LANGUAGE_OPTIONS)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [isCopied, setIsCopied] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        // Update filtered languages in real-time as the user types
        setFilteredLanguages(
            LANGUAGE_OPTIONS.filter((option) =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
    }, [searchTerm])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onCodeChange(localCode)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [localCode, onCodeChange])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const targetNode = event.target as Node

            if (!dropdownRef.current) return
            if (!targetNode) return

            if (!dropdownRef.current.contains(targetNode)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(localCode)
        setIsCopied(true)
        toast({
            title: t('copyCodeToClipboard'),
            description: t('youCanPasteCode'),
        })
        setTimeout(() => setIsCopied(false), 2000)
    }

    const handleLanguageSelect = (value: string) => {
        const selectedLanguage = LANGUAGE_OPTIONS.find(
            (option) => option.value === value
        )
        if (selectedLanguage) {
            setSearchTerm(selectedLanguage.label) // Set the input value to the selected language's label
        }
        onLanguageChange(value) // Notify parent component
        setIsDropdownOpen(false) // Close dropdown
    }

    const getLanguageExtension = () => {
        switch (language) {
            case 'javascript':
            case 'typescript':
            case 'jsx':
            case 'tsx':
                return javascript()
            case 'python':
                return python()
            case 'html':
                return html()
            case 'css':
                return css()
            case 'sql':
                return sql()
            case 'markdown':
                return markdown()
            case 'json':
                return json()
            case 'c':
            case 'cpp':
                return cpp()
            default:
                return []
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative" ref={dropdownRef}>
                        <Input
                            value={searchTerm} // Only show search term
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)} // Open dropdown on focus
                            placeholder={t('searchLanguage')}
                            className="w-[180px] h-[32px] pl-[32px] border-gray-300 focus:ring-purple-500"
                        />
                        <Search className="absolute left-[8px] top-1/2 transform -translate-y-1/2 h-[16px] w-[16px] text-gray-400" />
                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-[4px] bg-white border border-gray-200 rounded-md shadow-lg max-h-[240px] overflow-auto">
                                {filteredLanguages.length > 0 ? (
                                    <ul className="py-[4px]">
                                        {filteredLanguages.map((option) => (
                                            <li
                                                key={option.value}
                                                className="px-[12px] py-[8px] hover:bg-purple-50 cursor-pointer"
                                                onClick={() =>
                                                    handleLanguageSelect(
                                                        option.value
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-[12px] text-[12px] text-gray-500">
                                        {t('noLanguageFound')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-[4px]">
                    {/* <button
                        onClick={copyToClipboard}
                        className="p-[4px] h-[28px] text-[10px] flex items-center gap-[4px]"
                    >
                        {isCopied ? (
                            <Check className="h-[14px] w-[14px]" />
                        ) : (
                            <Copy className="h-[14px] w-[14px]" />
                        )}
                        {isCopied ? t('copied') : t('copy')}
                    </button> */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onThemeChange}
                        className="p-[4px] h-[28px] w-[28px]"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-[16px] w-[16px]" />
                        ) : (
                            <Moon className="h-[16px] w-[16px]" />
                        )}
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    'relative rounded-md overflow-hidden border border-gray-300',
                    theme === 'dark' ? 'code-dark' : 'code-light'
                )}
            >
                <div
                    className={cn(
                        'flex items-center justify-between px-[12px] py-[8px] text-[10px]',
                        theme === 'dark'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-800'
                    )}
                >
                    <div className="flex items-center gap-[8px]">
                        <BookOpen className="h-[16px] w-[16px]" />
                        {LANGUAGE_OPTIONS.find((opt) => opt.value === language)
                            ?.label || t('unKnown')}
                    </div>
                </div>

                <CodeMirror
                    value={localCode}
                    height="280px"
                    extensions={[
                        getLanguageExtension(),
                        lineNumbers(),
                        highlightActiveLine(),
                        keymap.of(defaultKeymap),
                    ]}
                    theme={theme === 'dark' ? oneDark : materialLight}
                    onChange={(value) => setLocalCode(value)}
                    className="rounded-md"
                />
            </div>

            <div className="flex justify-between text-[10px] text-gray-500">
                <div>
                    {localCode.split('\n').length} {t('lines')} |{' '}
                    {localCode.length} {t('characters')}
                </div>
                <div className="text-right">{t('pressTabToIndent')}</div>
            </div>
        </div>
    )
}
