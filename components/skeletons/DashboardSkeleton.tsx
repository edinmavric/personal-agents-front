import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4 min-h-screen bg-white dark:bg-neutral-950">
      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-t-3xl shadow-sm pb-6 -mx-4 px-4">
        {/* Top row skeleton */}
        <div className="flex flex-wrap h-52 gap-3 pt-4">
          {/* Greeting Card skeleton */}
          <div className="w-full md:w-[35%] h-full">
            <Card className="h-full">
              <CardContent className="flex flex-col justify-between h-full p-4">
                <div>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-6" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stat Cards skeleton */}
          <div className="w-full md:w-[35%] h-full">
            <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Pie Chart skeleton */}
          <div className="w-full md:w-[28%] h-full">
            <Card className="w-full h-full">
              <CardContent className="p-4 h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-28 w-28 rounded-full" />
                  <Skeleton className="h-6 w-20 mt-2" />
                  <Skeleton className="h-4 w-28 mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts row skeleton */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="w-full lg:w-[60%]">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-8 w-28" />
                </div>
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="w-full lg:w-[calc(40%-1rem)] bg-white dark:bg-neutral-800 rounded-xl">
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appointments list skeleton */}
        <div className="w-full mt-4">
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
