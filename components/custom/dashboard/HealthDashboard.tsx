"use client";

import React, { useState } from "react";
import { StatCard } from "@/components/custom/StatCard";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Uvoz novih chart komponenti ---
import { Component as WeeklyActivityChart } from "../WeeklyActivity"; // Pretpostavljamo da je ovo Bar chart
import { Component as ActivityRadarChart } from "../ActivityRadarChart"; // Pretpostavljamo da je ovo Radar chart
import { Component as ScreenTimeChart } from "../ScreenTimeChart"; // Dodaj import

import {
  LucideIcon,
  HeartPulse,
  Footprints,
  Flame,
  Bed,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  CalendarDays,
} from "lucide-react";

// --- Interfejsi (isti kao pre) ---
interface UserHealthSummary {
  averageSteps: number;
  averageCaloriesBurned: number;
  averageSleepHours: number;
  restingHeartRate: number;
  stepsGoal: number;
  caloriesGoal: number;
  activityTrend: string;
}

interface ActivityRadarData {
  activity: string;
  minutes: number;
  fullMark: number;
}

interface WeeklyActivityData {
  name: string;
  steps: number;
  calories: number;
}

interface ActivityTypeDistribution {
  activity: string;
  minutes: number;
  fill: string;
}

interface HealthDashboardProps {}

// --- Mock podaci (ažurirani za chartove) ---
const mockUserHealthSummary: UserHealthSummary = {
  averageSteps: 8500,
  averageCaloriesBurned: 2100,
  averageSleepHours: 7.2,
  restingHeartRate: 65,
  stepsGoal: 10000,
  caloriesGoal: 2500,
  activityTrend: "+8%",
};

const mockWeeklyActivityData: WeeklyActivityData[] = [
  { name: "Mon", steps: 9200, calories: 2300 },
  { name: "Tue", steps: 7800, calories: 2000 },
  { name: "Wed", steps: 10500, calories: 2600 },
  { name: "Thu", steps: 8800, calories: 2200 },
  { name: "Fri", steps: 11200, calories: 2750 },
  { name: "Sat", steps: 12500, calories: 3100 },
  { name: "Sun", steps: 8100, calories: 2050 },
];

const mockActivityDistribution: ActivityTypeDistribution[] = [
  { activity: "Walking", minutes: 90, fill: "hsl(var(--chart-1))" },
  { activity: "Running", minutes: 30, fill: "hsl(var(--chart-2))" },
  { activity: "Strength", minutes: 45, fill: "hsl(var(--chart-3))" },
  { activity: "Cycling", minutes: 20, fill: "hsl(var(--chart-4))" },
  { activity: "Other", minutes: 15, fill: "hsl(var(--chart-5))" },
];

const maxMinutes = Math.max(
  ...mockActivityDistribution.map((a) => a.minutes),
  60
);
const mockActivityRadarData: ActivityRadarData[] = mockActivityDistribution.map(
  (item) => ({
    activity: item.activity,
    minutes: item.minutes,
    fullMark: maxMinutes,
  })
);

// --- Komponenta ---
export default function HealthDashboard({}: HealthDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [healthSummary, setHealthSummary] = useState<UserHealthSummary>(
    mockUserHealthSummary
  );
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityData[]>(
    mockWeeklyActivityData
  );
  const [activityRadarData, setActivityRadarData] = useState<
    ActivityRadarData[]
  >(mockActivityRadarData);

  const formatNumber = (value: number): string => {
    if (value == null) return "0";
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };
  const formatHours = (value: number): string => {
    if (value == null) return "0h";
    return `${value.toFixed(1)}h`;
  };

  const isPositiveTrend = healthSummary.activityTrend.startsWith("+");
  const TrendIcon: LucideIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const trendColor = isPositiveTrend
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  const stepsPercentage = Math.min(
    (healthSummary.averageSteps / healthSummary.stepsGoal) * 100,
    100
  );
  const caloriesPercentage = Math.min(
    (healthSummary.averageCaloriesBurned / healthSummary.caloriesGoal) * 100,
    100
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* StatCards ostaju iste */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* ... StatCard komponente ... */}
        <StatCard
          title="Avg. Daily Steps"
          value={formatNumber(healthSummary.averageSteps)}
          icon={Footprints}
          iconBgColor="bg-blue-100 dark:bg-blue-900"
          iconColor="text-blue-600 dark:text-blue-400"
          trendIcon={TrendIcon}
          trendValue={healthSummary.activityTrend}
          trendColor={trendColor}
        />
        <StatCard
          title="Avg. Calories Burned"
          value={formatNumber(healthSummary.averageCaloriesBurned)}
          icon={Flame}
          iconBgColor="bg-orange-100 dark:bg-orange-900"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          title="Avg. Sleep"
          value={formatHours(healthSummary.averageSleepHours)}
          icon={Bed}
          iconBgColor="bg-purple-100 dark:bg-purple-900"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Resting Heart Rate"
          value={`${formatNumber(healthSummary.restingHeartRate)} bpm`}
          icon={HeartPulse}
          iconBgColor="bg-red-100 dark:bg-red-900"
          iconColor="text-red-600 dark:text-red-400"
        />
      </div>

      {/* Dnevni ciljevi (Horizontalni Barovi) - Pomereno gore */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" /> Daily Steps Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-4">
            <div className="w-full text-center mb-2">
              <span className="text-2xl font-bold">
                {formatNumber(healthSummary.averageSteps)}
              </span>
              <span className="text-muted-foreground">
                {" "}
                / {formatNumber(healthSummary.stepsGoal)} steps
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Goal
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-indigo-300 dark:bg-indigo-800 h-3 rounded-full"></div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Current Avg.
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{ width: `${stepsPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-600" /> Daily Calories Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-4">
            <div className="w-full text-center mb-2">
              <span className="text-2xl font-bold">
                {formatNumber(healthSummary.averageCaloriesBurned)}
              </span>
              <span className="text-muted-foreground">
                {" "}
                / {formatNumber(healthSummary.caloriesGoal)} kcal
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Goal
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-rose-300 dark:bg-rose-800 h-3 rounded-full"></div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Current Avg.
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-rose-600 h-3 rounded-full"
                  style={{ width: `${caloriesPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raspored za grafikone - Pomereno dole */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 min-h-[400px]">
        {/* Weekly Activity - uža kolona */}
        <div className="lg:col-span-1 flex flex-col">
          <WeeklyActivityChart data={weeklyActivity} />
        </div>

        {/* Screen Time Chart - nova kolona */}
        <div className="lg:col-span-1 flex flex-col">
          <ScreenTimeChart
            data={[
              { app: "Social", minutes: 120, color: "#6366f1" },
              { app: "Productivity", minutes: 90, color: "#22d3ee" },
              { app: "Entertainment", minutes: 60, color: "#f59e42" },
              { app: "Other", minutes: 30, color: "#a3e635" },
            ]}
          />
        </div>

        {/* Activity Distribution */}
        <div className="lg:col-span-1 flex flex-col">
          <ActivityRadarChart data={activityRadarData} />
        </div>
      </div>
    </div>
  );
}
