// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:55:41"
//

import { useState, useEffect } from 'react'

function useIsMobile(width: number = 996): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(false)

    useEffect(() => {
        const handleWindowSizeChange = () => {
            setIsMobile(window.innerWidth < width)
        }
        handleWindowSizeChange()
        window.addEventListener('resize', handleWindowSizeChange)
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return isMobile
}

export default useIsMobile
