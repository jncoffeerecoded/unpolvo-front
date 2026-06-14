import { ProfileDetailSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <ProfileDetailSkeleton />
    </div>
  );
}
