import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-8">
      <div className="space-y-4 text-center flex flex-col items-center">
        <Skeleton className="h-12 w-3/4 max-w-md" />
        <Skeleton className="h-6 w-1/2 max-w-xs" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
