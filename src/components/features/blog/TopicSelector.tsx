'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/other-ui/Button'
import { Input } from '@/components/other-ui/Input'
import { Badge } from '@/components/other-ui/Badge'
import { Topic } from '@/types/interface'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { useLocale, useTranslations } from 'next-intl'

// Sample topics - in a real app, these would come from your backend
interface TopicSelectorProps {
    selectedTopics: Topic[]
    onChange: (topics: Topic[]) => void
}

export function TopicSelector({
    selectedTopics,
    onChange,
}: TopicSelectorProps) {
    const t = useTranslations('write.TopicSelector')
    const [searchTerm, setSearchTerm] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [newTopic, setNewTopic] = useState(null)
    const [topics, setTopics] = useState<Topic[]>([])
    const locale = useLocale()

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await authenticationService.getTopics({
                    have_blog: false,
                })
                setTopics(response.data)
            } catch (error) {
                console.error('Error fetching topics:', error)
            }
        }

        fetchTopics()
    }, [])

    // Filter topics based on search term
    const filteredTopics = topics.filter(
        (topic) =>
            !selectedTopics.includes(topic) &&
            topic.tenChuDe[locale]
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    )

    const handleAddTopic = (topic: Topic) => {
        if (!selectedTopics.includes(topic) && topic.tenChuDe[locale].trim()) {
            onChange([...selectedTopics, topic])
            setSearchTerm('')
            setNewTopic(null)
        }
    }

    const handleRemoveTopic = (topic: Topic) => {
        onChange(selectedTopics.filter((t) => t !== topic))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newTopic) {
            e.preventDefault()
            handleAddTopic(newTopic)
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3 mb-2">
                {selectedTopics.map((topic) => (
                    <Badge
                        key={topic.id}
                        variant="secondary"
                        className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 text-sm"
                    >
                        {topic.tenChuDe[locale]}
                        <button
                            onClick={() => handleRemoveTopic(topic)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="relative">
                <Input
                    placeholder={t('placeholder')}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        // setNewTopic(e.target.value)
                        setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                        // Delay hiding suggestions to allow for clicks
                        setTimeout(() => setShowSuggestions(false), 200)
                    }}
                    style={{ borderRadius: '6px' }}
                    onKeyDown={handleKeyDown}
                    className="border-gray-300 focus-visible:ring-purple-500 py-6 text-base placeholder:text-base"
                />

                {showSuggestions &&
                    (searchTerm || filteredTopics.length > 0) && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredTopics.length > 0 ? (
                                <ul className="py-1">
                                    {filteredTopics.map((topic) => (
                                        <li
                                            key={topic.id}
                                            className="px-3 py-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between"
                                            onClick={() =>
                                                handleAddTopic(topic)
                                            }
                                        >
                                            <span>
                                                {topic.tenChuDe[locale]}
                                            </span>
                                            <Plus className="h-4 w-4 text-purple-500" />
                                        </li>
                                    ))}
                                </ul>
                            ) : searchTerm ? (
                                <div className="p-3">
                                    <p className="text-sm text-gray-500 mb-2">
                                        {t('noMatch')}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    )}
            </div>

            {selectedTopics.length === 0 && (
                <p className="text-sm text-gray-500">{t('selectOne')}</p>
            )}
        </div>
    )
}
