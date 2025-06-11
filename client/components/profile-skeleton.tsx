import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div>
      {/* Cover Image Skeleton */}
      <div className="relative h-48 w-full md:h-64">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Header Skeleton */}
        <div className="relative -mt-16 mb-6 flex flex-col items-center md:flex-row md:items-end md:space-x-6">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-white" />
          <div className="mt-4 flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <div className="grid w-full grid-cols-2 mb-6">
            <Skeleton className="h-10 rounded-md mr-1" />
            <Skeleton className="h-10 rounded-md ml-1" />
          </div>

          {/* Content Area Skeleton */}
          <div className="space-y-4">
            {/* About Tab Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Bio section */}
                  <div>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  {/* Info section */}
                  <div>
                    <Skeleton className="h-6 w-20 mb-2" />
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 mr-2 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 mr-2 rounded" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 mr-2 rounded" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 mr-2 rounded" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  </div>

                  {/* Badges section */}
                  <div>
                    <Skeleton className="h-6 w-20 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-18" />
                      <Skeleton className="h-6 w-14" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Posts tab skeleton for additional loading states
export function ProfilePostsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="mb-4">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            {i % 2 === 0 && (
              <Skeleton className="h-48 w-full rounded-lg mb-4" />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 