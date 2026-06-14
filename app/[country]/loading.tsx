import { PageHeaderSkeleton, CardGridSkeleton, ProfileGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={8} />
      <ProfileGridSkeleton count={10} />
    </div>
  );
}
