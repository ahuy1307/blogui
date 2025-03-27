'use client'

import { useDraggable as useDndKitDraggable } from '@dnd-kit/core'
import { useState } from 'react'

interface UseDraggableProps {
    id: string
    data?: Record<string, any>
}

export function useDraggable({ id, data = {} }: UseDraggableProps) {
    const [isDragging, setIsDragging] = useState(false)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging: dndKitIsDragging,
    } = useDndKitDraggable({
        id,
        data: {
            ...data,
        },
    })

    // Combine the isDragging state from dnd-kit with our local state
    const combinedIsDragging = isDragging || dndKitIsDragging

    // Enhanced listeners that also update our local state
    const enhancedListeners = {
        ...listeners,
        onDragStart: (e: any) => {
            setIsDragging(true)
            listeners?.onDragStart?.(e)
        },
        onDragEnd: (e: any) => {
            setIsDragging(false)
            listeners?.onDragEnd?.(e)
        },
    }

    return {
        attributes,
        listeners: enhancedListeners,
        setNodeRef,
        transform,
        isDragging: combinedIsDragging,
    }
}
