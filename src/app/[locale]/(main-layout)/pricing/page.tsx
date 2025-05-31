import Header from '@/components/features/home/Header'
import { CoinPurchase } from '@/components/pricing/CoinPurchase'

export default function SubscriptionPage() {
    return (
        <div>
            <Header />
            <div className="md:container px-4 mx-auto py-12 mt-[80px]">
                <CoinPurchase />
            </div>
        </div>
    )
}
