'use client'
import { useEffect, useState } from 'react'
import { ScrollToTopIcon } from '../../../../icon'
import { useIsMobile } from '@/hooks/useMobile'

function ScrollToTop({ isBlogDetail = false }: { isBlogDetail?: boolean }) {
    const [scrollPositon, setScrollPostion] = useState(0)
    const isMobile = useIsMobile()
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
                    className={`fixed ${!isBlogDetail && `bottom-[40px] md:bottom-[40px]`} ${!isBlogDetail && isMobile && `bottom-[25px] md:bottom-[40px]`} bottom-[90px] right-4 md:bottom-24 md:right-6 -rotate-45 rounded-full bg-gray-900 aspect-square p-2 opacity-100 pointer-events-auto shadow z-[48]`}
                >
                    <ScrollToTopIcon
                        width={isMobile ? '28px' : '36px'}
                        height={isMobile ? '28px' : '36px'}
                    />
                </button>
            )}
        </>
    )
}

export default ScrollToTop
