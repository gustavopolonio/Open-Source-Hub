import { Card, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <div className="relative rounded-xl shadow-sm hover:shadow-[var(--shadow-xl)]">
      <Card className="transition-transform duration-200 gap-3 h-full">
        <CardHeader className="grid-cols-[auto_1fr_auto]!">
          <Skeleton className="w-12 h-12 rounded-sm" />
          <div className="min-h-[52px] flex flex-col justify-center gap-1">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        </CardHeader>
        <Skeleton className="h-[84px] mx-6" />
        <Skeleton className="h-6 mx-6" />
      </Card>
    </div>
  );
}
