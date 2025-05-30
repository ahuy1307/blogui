'use client'

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/components/other-ui/Toast'
import { useToast } from '@/components/other-ui/useToast'

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(({ id, title, description, action, ...props }) => (
                <Toast
                    key={id}
                    {...props}
                    className={`w-[300px] sm:w-[350px] md:w-[400px] ${
                        props.variant === 'destructive'
                            ? 'bg-red-500 text-white'
                            : ''
                    }`}
                >
                    <div className="grid gap-1">
                        {title && (
                            <ToastTitle
                                className={`text-sm sm:text-base ${
                                    props.variant === 'destructive'
                                        ? 'text-white'
                                        : ''
                                }`}
                            >
                                {title}
                            </ToastTitle>
                        )}
                        {description && (
                            <ToastDescription
                                className={`text-xs sm:text-sm ${
                                    props.variant === 'destructive'
                                        ? 'text-white opacity-90'
                                        : ''
                                }`}
                            >
                                {description}
                            </ToastDescription>
                        )}
                    </div>
                    {action}
                    <ToastClose
                        className={`transform scale-75 sm:scale-100 pr-5 ${
                            props.variant === 'destructive'
                                ? 'text-white hover:text-white/80'
                                : ''
                        }`}
                    />
                </Toast>
            ))}
            <ToastViewport
                className="fixed bottom-0 top-full translate-y-[-100%] sm:translate-y-0 right-0 p-3 sm:p-4 gap-2 flex flex-col-reverse"
                style={{
                    pointerEvents: toasts.length ? 'auto' : 'none',
                    height: 'fit-content',
                    width: 'fit-content',
                    maxWidth: '400px',
                    zIndex: 100,
                }}
            />
        </ToastProvider>
    )
}
