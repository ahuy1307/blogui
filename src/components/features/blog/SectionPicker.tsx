'use client'

import * as React from 'react'
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/other-ui/Command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/other-ui/Popover'
import { Button } from '@/components/other-ui/Button'
import { Plus, ChevronDown } from 'lucide-react'
import { SIDEBAR_SECTIONS } from '@/components/editor/constants'
import { useLocale } from 'next-intl'

interface SectionPickerProps {
    onSelect: (type: string) => void
}

export function SectionPicker({ onSelect }: SectionPickerProps) {
    const [open, setOpen] = React.useState(false)
    const locale = useLocale()

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full py-6 border-dashed border-gray-300 hover:bg-gray-50 hover:border-purple-300 transition-all flex items-center justify-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Section
                    <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-56" align="center" sideOffset={5}>
                <Command>
                    <CommandList>
                        <CommandGroup heading="Choose a section type">
                            {SIDEBAR_SECTIONS.map((section: any) => (
                                <CommandItem
                                    key={section.type}
                                    onSelect={() => {
                                        onSelect(section.type)
                                        setOpen(false)
                                    }}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-purple-50"
                                >
                                    <div className="text-purple-500">
                                        {section.icon}
                                    </div>
                                    <span>
                                        {section.label[locale as 'en' | 'vi']}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
