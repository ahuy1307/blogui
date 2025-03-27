'use client'

import { useDroppable as useDndKitDroppable } from '@dnd-kit/core'

interface UseDroppableProps {
    id: string
    data?: Record<string, any>
}

export function useDroppable({ id, data = {} }: UseDroppableProps) {
    const { isOver, setNodeRef, active, over } = useDndKitDroppable({
        id,
        data: {
            ...data,
        },
    })

    return {
        isOver,
        setNodeRef,
        active,
        over,
    }
}
