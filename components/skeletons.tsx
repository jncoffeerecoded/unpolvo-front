import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCardSkeleton() {
  return (
    <div className="grid grid-cols-[40%_1fr] overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="h-full min-h-[12rem] w-full rounded-none" />
      <div className="flex flex-col justify-center space-y-2 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function ProfileGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-64" /> {/* breadcrumb */}
      <Skeleton className="h-9 w-72" /> {/* título */}
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}

export function ProfileDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    </div>
  );
}
