import { useEffect } from 'react'

export function useUnlockBodyScroll() {
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (document.body.hasAttribute('data-scroll-locked')) {
                document.body.removeAttribute('data-scroll-locked')
                document.body.style.overflow = 'auto'
            }
        })

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-scroll-locked'],
        })

        return () => observer.disconnect()
    }, [])
}
