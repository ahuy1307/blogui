// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:16:04"
//

import { useCallback, useRef } from 'react'

export function useDebounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    return useCallback(
        (...args: Parameters<T>) => {
            const later = () => {
                timeoutRef.current = null
                func(...args)
            }

            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(later, wait)
        },
        [func, wait] // Only re-create the debounced function if `func` or `wait` changes
    ) as T
}
