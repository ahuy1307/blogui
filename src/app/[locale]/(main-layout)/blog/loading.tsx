import { Skeleton } from '@/components/other-ui/Skeleton'

export default function Loading() {
    return (
        <div className="container mx-auto py-8 px-4">
            <Skeleton className="h-10 w-48 mb-8" />

            {/* Search and filters skeleton */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <Skeleton className="h-12 w-full mb-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-40 mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-6 w-24 mb-4" />
                        <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                >
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full mb-4" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results count skeleton */}
            <Skeleton className="h-6 w-40 mb-6" />

            {/* Blog grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex flex-col">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-4 flex-1">
                            <Skeleton className="h-4 w-1/3 mb-2" />
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="p-4 pt-2 border-t">
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center">
                                    <Skeleton className="h-8 w-8 rounded-full mr-2" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
