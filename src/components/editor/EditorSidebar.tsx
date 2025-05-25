'use client'

import type React from 'react'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, SquareArrowLeft } from 'lucide-react'
import { SectionTypeDefault } from '@/types/editor'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/other-ui/Tooltip'
import { SIDEBAR_SECTIONS } from './constants'
import { Button } from '../other-ui/Button'

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
                'fixed hidden lg:flex z-[0] top-[70px] w-[300px] right-0 h-[calc(100vh-73px)] bg-gray-50 overflow-y-auto transition-all duration-500 ease-in-out',
                {
                    'translate-x-0': isSidebarOpen,
                    'translate-x-0 w-[150px] z-0': !isSidebarOpen,
                }
            )}
        >
            {/* <div className="bg-white shadow-sm mx-auto flex justify-center pb-3 h-full items-center w-[70px] border border-gray-300 px-6">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="border border-black  text-white text-center mx-auto w-[50px] rounded-xl p-1 shadow-md transition-all h-[80px]"
                >
                    <SquareArrowLeft
                        className={cn(
                            'h-7 w-7 transition-transform duration-500 text-black mx-auto',
                            {
                                'transform rotate-180': isSidebarOpen,
                            }
                        )}
                    />
                </button>
            </div> */}
            <div className="w-full flex justify-center flex-col pt-24">
                <div className="flex items-center px-4 py-2 border-b border-gray-200">
                    <h4
                        className={cn(
                            'font-medium text-gray-900 transition-all duration-500 px-4',
                            !isSidebarOpen
                                ? 'opacity-0 scale-0 hidden'
                                : 'opacity-100 scale-100 block'
                        )}
                    >
                        Components
                    </h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 h-8 w-8 mx-auto"
                    >
                        {!isSidebarOpen ? (
                            <ChevronLeft className="h-6 w-6" />
                        ) : (
                            <ChevronRight className="h-6 w-6" />
                        )}
                    </Button>
                </div>
                <div
                    className={cn(
                        'p-4 transition-all duration-300',
                        !isSidebarOpen
                            ? 'grid grid-cols-1 gap-2'
                            : 'grid grid-cols-2 gap-2'
                    )}
                >
                    {SIDEBAR_SECTIONS.map((section) => (
                        <SidebarItem
                            key={section.type}
                            type={section.type}
                            icon={section.icon}
                            label={section.label[locale as 'en' | 'vi']} // Use translation for the label
                            onAdd={onAddSection}
                            collapsed={!isSidebarOpen} // Pass the collapsed state
                        />
                    ))}
                </div>
                {/* <div className="mt-6 px-4 transition-opacity duration-300">
                    <h3 className="font-medium text-gray-900 mb-2">
                        {t('instructions')}
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>{t('instruction1')}</li>
                        <li>{t('instruction2')}</li>
                        <li>{t('instruction3')}</li>
                    </ul>
                </div> */}
            </div>
        </aside>
    )
}

interface SidebarItemProps {
    type: SectionTypeDefault
    icon: React.ReactNode
    label: string
    onAdd: (type: SectionTypeDefault) => void
    collapsed: boolean
}

function SidebarItem({
    type,
    icon,
    label,
    onAdd,
    collapsed,
}: SidebarItemProps) {
    return (
        // <TooltipProvider>
        //     <Tooltip>
        //         <TooltipTrigger asChild>
        //             <div
        //                 onClick={() => onAdd(type)}
        //                 className={cn(
        //                     'flex border border-gray-200 rounded-md cursor-pointer hover:border-purple-500 hover:shadow-sm transition-all hover:bg-purple-50 transform hover:scale-105 flex-col items-center justify-center p-4 bg-white'
        //                 )}
        //             >
        //                 <div className="text-gray-600 mb-1 group-hover:text-purple-500">
        //                     {icon}
        //                 </div>
        //                 <span className="text-sm mt-1 text-gray-700 transition-opacity duration-300 text-ellipsis whitespace-nowrap overflow-hidden max-w-[100%] group-hover:text-purple-500">
        //                     {label}
        //                 </span>
        //             </div>
        //         </TooltipTrigger>
        //         <TooltipContent side="left">
        //             <p>{label}</p>
        //         </TooltipContent>
        //     </Tooltip>
        // </TooltipProvider>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        onClick={() => onAdd(type)}
                        className={cn(
                            'flex border border-gray-200 z-[200] rounded-md cursor-pointer hover:border-purple-500 hover:shadow-sm transition-all hover:bg-purple-50 transform hover:scale-105',
                            collapsed
                                ? 'flex-col items-center justify-center p-3 bg-white'
                                : 'flex-col items-center justify-center p-3 bg-white'
                        )}
                    >
                        <div className="text-gray-600 mb-1 group-hover:text-purple-500">
                            {icon}
                        </div>
                        {!collapsed && (
                            <span className="text-xs z-[200] text-gray-700 transition-opacity duration-300">
                                {label}
                            </span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-[200]">
                    <p>Add {label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
