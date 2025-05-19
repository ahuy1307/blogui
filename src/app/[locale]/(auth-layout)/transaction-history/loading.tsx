import { Skeleton } from '@/components/other-ui/Skeleton'

export default function Loading() {
    return (
        <div className="container py-10">
            <div className="mb-8">
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>

            {/* Filters */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-4 mb-4">
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 w-[180px]" />
                    <Skeleton className="h-10 flex-1 min-w-[200px]" />
                </div>
            </div>

            {/* Transaction list */}
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                ))}
            </div>
        </div>
    )
}
