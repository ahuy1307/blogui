'use client'

import type React from 'react'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/other-ui/button'
import { Input } from '@/components/other-ui/input'
import { Badge } from '@/components/other-ui/badge'

// Sample categories - in a real app, these would come from your backend
const AVAILABLE_CATEGORIES = [
    'Artificial Intelligence',
    'Machine Learning',
    'Deep Learning',
    'Computer Vision',
    'Natural Language Processing',
    'Generative AI',
    'Neural Networks',
    'Reinforcement Learning',
    'AI Ethics',
    'Data Science',
    'Robotics',
    'AI Applications',
]

interface CategorySelectorProps {
    selectedCategories: string[]
    onChange: (categories: string[]) => void
}

export function CategorySelector({
    selectedCategories,
    onChange,
}: CategorySelectorProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [newCategory, setNewCategory] = useState('')

    // Filter categories based on search term
    const filteredCategories = AVAILABLE_CATEGORIES.filter(
        (category) =>
            !selectedCategories.includes(category) &&
            category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddCategory = (category: string) => {
        if (!selectedCategories.includes(category) && category.trim()) {
            onChange([...selectedCategories, category])
            setSearchTerm('')
            setNewCategory('')
        }
    }

    const handleRemoveCategory = (category: string) => {
        onChange(selectedCategories.filter((c) => c !== category))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newCategory) {
            e.preventDefault()
            handleAddCategory(newCategory)
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedCategories.map((category) => (
                    <Badge
                        key={category}
                        variant="secondary"
                        className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200"
                    >
                        {category}
                        <button
                            onClick={() => handleRemoveCategory(category)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="relative">
                <Input
                    placeholder="Search or add categories..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setNewCategory(e.target.value)
                        setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                        // Delay hiding suggestions to allow for clicks
                        setTimeout(() => setShowSuggestions(false), 200)
                    }}
                    onKeyDown={handleKeyDown}
                    className="border-gray-300 focus-visible:ring-purple-500"
                />

                {showSuggestions &&
                    (searchTerm || filteredCategories.length > 0) && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredCategories.length > 0 ? (
                                <ul className="py-1">
                                    {filteredCategories.map((category) => (
                                        <li
                                            key={category}
                                            className="px-3 py-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between"
                                            onClick={() =>
                                                handleAddCategory(category)
                                            }
                                        >
                                            <span>{category}</span>
                                            <Plus className="h-4 w-4 text-purple-500" />
                                        </li>
                                    ))}
                                </ul>
                            ) : searchTerm ? (
                                <div className="p-3">
                                    <p className="text-sm text-gray-500 mb-2">
                                        No matching categories found.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleAddCategory(searchTerm)
                                        }
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        {/* Add "{searchTerm}" as new category */}
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    )}
            </div>

            {selectedCategories.length === 0 && (
                <p className="text-xs text-gray-500">
                    Select at least one category for your blog post.
                </p>
            )}
        </div>
    )
}
