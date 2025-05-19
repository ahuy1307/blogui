import type { Metadata } from 'next'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'

export default function CheckoutPage() {
    return (
        <div className="container mx-auto py-12">
            <CheckoutClient />
        </div>
    )
}
