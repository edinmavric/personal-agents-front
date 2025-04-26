import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  trendValue?: string;
  trendIcon?: LucideIcon;
  trendColor?: string;
  isFinancial?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  trendValue,
  trendIcon: TrendIcon,
  trendColor,
  isFinancial = false,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "shadow-sm border border-neutral100 dark:border-neutral800 dark:bg-neutral900 h-full",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                iconBgColor
              )}
              style={{ flexShrink: 0 }}
            >
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
            <p className="text-sm font-medium text-neutral500 dark:text-neutral400">
              {title}
            </p>
          </div>
          {trendValue && (
            <div
              className={cn(
                "flex items-center text-xs font-medium",
                trendColor
              )}
            >
              {TrendIcon && <TrendIcon className="h-3 w-3 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-2">
          <h4 className="text-xl font-semibold text-neutral900 dark:text-white tracking-tight">
            {value}
          </h4>
        </div>
      </CardContent>
    </Card>
  );
}
