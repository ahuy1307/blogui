import { useEffect, useCallback } from 'react'

declare global {
    interface Window {
        fbAsyncInit: () => void
        FB: {
            init: (options: any) => void
            login: (callback: (response: any) => void, options: any) => void
        }
    }
}

const useFacebookLogin = (appId: string, callback: (response: any) => void) => {
    useEffect(() => {
        // Load the Facebook SDK
        ;(function (d, s, id) {
            const js: HTMLScriptElement | null = d.createElement(
                s
            ) as HTMLScriptElement
            const fjs = d.getElementsByTagName(s)[0]
            if (d.getElementById(id)) return
            js.id = id
            js.src = 'https://connect.facebook.net/en_US/sdk.js'
            js.async = true
            if (fjs && fjs.parentNode) {
                fjs.parentNode.insertBefore(js, fjs)
            }
        })(document, 'script', 'facebook-jssdk')

        // Initialize the Facebook SDK
        window.fbAsyncInit = function () {
            window.FB.init({
                appId,
                cookie: true,
                xfbml: true,
                version: 'v11.0',
            })
        }
    }, [appId])

    const handleFacebookLogin = useCallback(() => {
        if (window.FB) {
            window.FB.login(callback, { scope: 'public_profile,email' })
        } else {
            console.log('Facebook SDK not loaded')
        }
    }, [callback])

    return handleFacebookLogin
}

export default useFacebookLogin
