'use client'

import type React from 'react'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { SquareArrowLeft } from 'lucide-react'
import { SectionTypeDefault } from '@/types/editor'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/other-ui/Tooltip'
import { SIDEBAR_SECTIONS } from './constants'

interface EditorSidebarProps {
    onAddSection: (type: SectionTypeDefault) => void
}

export function EditorSidebar({ onAddSection }: EditorSidebarProps) {
    const t = useTranslations('write') // Initialize translations for the 'write' namespace
    const locale = useLocale() // Get the current locale
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <aside
            className={cn(
                'fixed flex z-[100] top-[70px] w-[400px] right-0 h-[calc(100vh-73px)] bg-gray-50 overflow-y-auto transition-all duration-500 ease-in-out',
                {
                    'translate-x-0': isSidebarOpen,
                    'translate-x-[82%] z-0': !isSidebarOpen,
                }
            )}
        >
            <div className="bg-white shadow-sm mx-auto flex justify-center pb-3 h-full items-center w-[70px] border border-gray-300 px-6">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className=" bg-purple-600 text-white text-center mx-auto w-[50px] rounded-xl p-2 shadow-md transition-all h-[100px]"
                >
                    <SquareArrowLeft
                        className={cn(
                            'h-7 w-7 transition-transform duration-500 text-white mx-auto',
                            {
                                'transform rotate-180': isSidebarOpen,
                            }
                        )}
                    />
                </button>
            </div>
            <div className="w-full">
                <div
                    className={cn(
                        'p-4 pt-24 transition-all duration-300 grid grid-cols-2 gap-2 w-full'
                    )}
                >
                    {SIDEBAR_SECTIONS.map((section) => (
                        <SidebarItem
                            key={section.type}
                            type={section.type}
                            icon={section.icon}
                            label={section.label[locale as 'en' | 'vi']} // Use translation for the label
                            onAdd={onAddSection}
                        />
                    ))}
                </div>
                <div className="mt-6 px-4 transition-opacity duration-300">
                    <h3 className="font-medium text-gray-900 mb-2">
                        {t('instructions')}
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>{t('instruction1')}</li>
                        <li>{t('instruction2')}</li>
                        <li>{t('instruction3')}</li>
                    </ul>
                </div>
            </div>
        </aside>
    )
}

interface SidebarItemProps {
    type: SectionTypeDefault
    icon: React.ReactNode
    label: string
    onAdd: (type: SectionTypeDefault) => void
}

function SidebarItem({ type, icon, label, onAdd }: SidebarItemProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        onClick={() => onAdd(type)}
                        className={cn(
                            'flex border border-gray-200 rounded-md cursor-pointer hover:border-purple-500 hover:shadow-sm transition-all hover:bg-purple-50 transform hover:scale-105 flex-col items-center justify-center p-4 bg-white'
                        )}
                    >
                        <div className="text-gray-600 mb-1 group-hover:text-purple-500">
                            {icon}
                        </div>
                        <span className="text-sm mt-1 text-gray-700 transition-opacity duration-300 text-ellipsis whitespace-nowrap overflow-hidden max-w-[100%] group-hover:text-purple-500">
                            {label}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
