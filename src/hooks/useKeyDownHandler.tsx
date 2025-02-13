// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:56:15"
//

import { useCallback, KeyboardEvent } from 'react'

type UseKeyDownHandlerProps = {
    key?: string
    onClick?: () => void
}

const useKeyDownHandler = ({
    key = 'Enter',
    onClick,
}: UseKeyDownHandlerProps = {}) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === key) {
                event.preventDefault()
                if (onClick) {
                    onClick()
                } else {
                    event.currentTarget.click()
                }
            }
        },
        [key, onClick]
    )

    return handleKeyDown
}

export default useKeyDownHandler
