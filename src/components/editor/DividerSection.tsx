'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/other-ui/Select'
import { Label } from '@/components/other-ui/Label'
import { Input } from '@/components/other-ui/Input'
import { Slider } from '@/components/other-ui/Slider'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DividerSectionProps {
    dividerType: string
    spacing: number
    thickness: number
    color: string
    onUpdate: (updates: {
        dividerType?: string
        spacing?: number
        thickness?: number
        color?: string
    }) => void
}

const DIVIDER_TYPES = [
    { value: 'solid', label: 'Solid Line' },
    { value: 'dashed', label: 'Dashed Line' },
    { value: 'dotted', label: 'Dotted Line' },
    { value: 'double', label: 'Double Line' },
    { value: 'space', label: 'Empty Space' },
    { value: 'gradient', label: 'Gradient' },
]

const COLORS = [
    '#9c65d0',
    '#e5e7eb',
    '#f87171',
    '#fbbf24',
    '#34d399',
    '#60a5fa',
    '#a78bfa',
    '#f472b6',
    '#000000',
    '#ffffff',
    '#ffedd5',
    '#fde68a',
    '#d1fae5',
    '#bfdbfe',
    '#ddd6fe',
    '#fbcfe8',
    '#9ca3af',
    '#4b5563',
]

export function DividerSection({
    dividerType = 'solid',
    spacing = 8,
    thickness = 1,
    color = '#e5e7eb',
    onUpdate,
}: DividerSectionProps) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const colorPickerRef = useRef<HTMLDivElement>(null)
    const toggleButtonRef = useRef<HTMLDivElement>(null)

    // Close the color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                colorPickerRef.current &&
                !colorPickerRef.current.contains(event.target as Node) &&
                toggleButtonRef.current &&
                !toggleButtonRef.current.contains(event.target as Node)
            ) {
                setShowColorPicker(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Label
                    htmlFor="divider-type"
                    className="text-sm font-medium w-24"
                >
                    Type:
                </Label>
                <Select
                    value={dividerType}
                    onValueChange={(value) => onUpdate({ dividerType: value })}
                >
                    <SelectTrigger
                        id="divider-type"
                        className="w-[150px] border-gray-300 focus:ring-purple-500"
                    >
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        {DIVIDER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {dividerType !== 'space' && (
                <div className="flex items-center gap-2 relative">
                    <Label
                        htmlFor="divider-color"
                        className="text-sm font-medium w-24"
                    >
                        Color:
                    </Label>
                    <div
                        ref={toggleButtonRef}
                        className="flex items-center gap-2"
                    >
                        <div
                            className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => setShowColorPicker((prev) => !prev)}
                        />
                        <Input
                            id="divider-color"
                            type="text"
                            value={color}
                            onChange={(e) =>
                                onUpdate({ color: e.target.value })
                            }
                            className="w-[100px] border-gray-300 focus:ring-purple-500"
                        />
                    </div>
                    {showColorPicker && (
                        <div
                            ref={colorPickerRef}
                            className="absolute z-10 top-[100%] p-4 bg-white border border-gray-300 rounded-lg shadow-lg grid grid-cols-4 gap-2"
                        >
                            {COLORS.map((presetColor) => (
                                <div
                                    key={presetColor}
                                    className="w-10 h-10 rounded-md cursor-pointer border border-gray-200 hover:border-purple-500"
                                    style={{ backgroundColor: presetColor }}
                                    onClick={() => {
                                        onUpdate({ color: presetColor })
                                        setShowColorPicker(false)
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2">
                <Label
                    htmlFor="divider-spacing"
                    className="text-sm font-medium w-24"
                >
                    Spacing:
                </Label>
                <div className="flex-1 flex items-center gap-2">
                    <Slider
                        id="divider-spacing"
                        value={[spacing]}
                        min={2}
                        max={24}
                        step={2}
                        onValueChange={(values) =>
                            onUpdate({ spacing: values[0] })
                        }
                        className="flex-1"
                    />
                    <span className="text-xs text-gray-500 w-6 text-right">
                        {spacing}
                    </span>
                </div>
            </div>

            {dividerType !== 'space' && (
                <div className="flex items-center gap-2">
                    <Label
                        htmlFor="divider-thickness"
                        className="text-sm font-medium w-24"
                    >
                        Thickness:
                    </Label>
                    <div className="flex-1 flex items-center gap-2">
                        <Slider
                            id="divider-thickness"
                            value={[thickness]}
                            min={1}
                            max={8}
                            step={1}
                            onValueChange={(values) =>
                                onUpdate({ thickness: values[0] })
                            }
                            className="flex-1"
                        />
                        <span className="text-xs text-gray-500 w-6 text-right">
                            {thickness}px
                        </span>
                    </div>
                </div>
            )}

            {/* Divider preview */}
            <div className="pt-2">
                <div className="text-xs text-gray-500 mb-2">Preview:</div>
                <div className={cn('py-4')}>
                    {dividerType === 'space' ? (
                        <div style={{ height: `${spacing}px` }}></div>
                    ) : dividerType === 'gradient' ? (
                        <div
                            className="w-full"
                            style={{
                                height: `${thickness}px`,
                                background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                                margin: `${spacing}px 0`,
                            }}
                        ></div>
                    ) : (
                        <div
                            className="w-full"
                            style={{
                                borderTopWidth:
                                    dividerType === 'double'
                                        ? '3px'
                                        : `${thickness}px`,
                                borderTopStyle: dividerType as
                                    | 'solid'
                                    | 'dashed'
                                    | 'dotted'
                                    | 'double',
                                borderTopColor: color,
                                margin: `${spacing}px 0`,
                            }}
                        ></div>
                    )}
                </div>
            </div>
        </div>
    )
}
