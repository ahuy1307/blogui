'use client'
import { useEffect, useState } from 'react'
import { ScrollToTopIcon } from '../../../../icon'

function ScrollToTop() {
    const [scrollPositon, setScrollPostion] = useState(0)

    const changePositon = () => {
        if (typeof window !== 'undefined') {
            // Client-side-only code
            setScrollPostion(window.pageYOffset)
        }
    }

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    useEffect(() => {
        window.addEventListener('scroll', changePositon)

        return () => window.removeEventListener('scroll', changePositon)
    }, [])

    return (
        <>
            {scrollPositon > 1500 && (
                <button
                    onClick={handleScrollToTop}
                    className="fixed right-4 bottom-6 -rotate-45 rounded-full bg-gray-900 aspect-square p-2 sm:bottom-6 sm:right-6 opacity-100 pointer-events-auto shadow z-50"
                >
                    <ScrollToTopIcon />
                </button>
            )}
        </>
    )
}

export default ScrollToTop
