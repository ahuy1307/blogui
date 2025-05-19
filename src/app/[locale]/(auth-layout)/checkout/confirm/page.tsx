'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PaymentConfirmation } from '@/components/checkout/PaymentConfirmation'
import { authenticationService } from '@/core/services/API/authentication/Authentication.service'
import { Loader2 } from 'lucide-react'

export default function ConfirmPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isVerifying, setIsVerifying] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const hasProcessed = useRef(false)

    useEffect(() => {
        // Prevent multiple verifications
        if (hasProcessed.current) {
            return
        }

        const verifyPayment = async () => {
            try {
                // Prevent processing multiple times
                hasProcessed.current = true
                setIsVerifying(true)

                // Create an object with all query parameters
                const queryParams: Record<string, string> = {}
                searchParams.forEach((value, key) => {
                    queryParams[key] = value
                })

                // Check if we have parameters to process
                if (Object.keys(queryParams).length === 0) {
                    setIsSuccess(false)
                    setErrorMessage('No payment information provided')
                    setIsVerifying(false)
                    return
                }

                // Call API to verify payment
                const response = await authenticationService.getPaymentCallback(
                    {
                        data: queryParams,
                    }
                )

                if (response && response.status === 200) {
                    setIsSuccess(true)
                } else {
                    setIsSuccess(false)
                    setErrorMessage(
                        response?.data?.message || 'Payment verification failed'
                    )
                }
            } catch (error: any) {
                console.error('Payment verification error:', error)
                setIsSuccess(false)
                setErrorMessage(
                    error?.response?.data?.message ||
                        'An error occurred during payment verification'
                )
            } finally {
                setIsVerifying(false)

                // Remove URL parameters by replacing the current URL without query params
                // Use a safe setTimeout to avoid potential React state update issues
                setTimeout(() => {
                    const { pathname } = window.location
                    window.history.replaceState({}, '', pathname)
                }, 10)
            }
        }

        if (searchParams.size > 0) {
            verifyPayment()
        } else {
            setIsVerifying(false)
            setIsSuccess(false)
            setErrorMessage('No payment information provided')
        }
    }, [searchParams])

    if (isVerifying) {
        return (
            <div className="container mx-auto py-24 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin mb-6 text-primary" />
                <h2 className="text-2xl font-medium">Verifying payment...</h2>
                <p className="text-muted-foreground mt-2">
                    Please wait while we confirm your transaction.
                </p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-12">
            <PaymentConfirmation
                isSuccess={isSuccess}
                errorMessage={errorMessage}
            />
        </div>
    )
}
