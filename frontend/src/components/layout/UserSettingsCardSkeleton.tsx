import { Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function UserSettingsCardSkeleton() {
  return (
    <div className="space-y-6 w-full flex flex-col bg-card text-card-foreground rounded-xl border p-6 shadow-sm transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-ring">
      <div className="w-full flex justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-48 h-8 rounded-xl" />
        </div>

        <Edit />
      </div>

      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  );
}
