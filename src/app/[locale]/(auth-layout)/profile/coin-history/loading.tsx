import { Skeleton } from '@/components/other-ui/Skeleton'
import { Card, CardContent, CardHeader } from '@/components/other-ui/Card'

export default function CoinHistoryLoading() {
    return (
        <div className="min-h-screen bg-white">
            <div className="h-16 border-b border-gray-200 bg-white"></div>

            <main className="container mx-auto px-4 py-12">
                <div className="h-8 w-32 mb-8">
                    <Skeleton className="h-full w-full" />
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="h-10 w-64 mb-8">
                        <Skeleton className="h-full w-full" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-10 w-64" />
                            </div>
                            <Skeleton className="h-4 w-56 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <Skeleton className="h-10 flex-1" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 w-[180px]" />
                                    <Skeleton className="h-10 w-10" />
                                    <Skeleton className="h-10 w-10" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
