"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip as ShadcnChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialDataPoint {
  period: string;
  income: number;
  spending: number;
}

const generateFinancialData = (
  timeframe: "weekly" | "monthly" | "yearly",
  baseMonthlyIncome: number,
  baseMonthlySpending: number
): FinancialDataPoint[] => {
  const data: FinancialDataPoint[] = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const safeBaseSpending = Math.min(
    baseMonthlySpending,
    baseMonthlyIncome * 0.9
  );

  switch (timeframe) {
    case "weekly":
      for (let i = 1; i <= 4; i++) {
        const incomePart =
          (baseMonthlyIncome / 4) * (Math.random() * 0.1 + 0.95);
        const spendingPart = Math.min(
          (safeBaseSpending / 4) * (Math.random() * 0.2 + 0.9),
          incomePart * 0.95
        );
        data.push({
          period: `W${i}`,
          income: Math.round(incomePart),
          spending: Math.round(spendingPart),
        });
      }
      return data;

    case "monthly":
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const incomeVariation = i === 0 ? 1 : Math.random() * 0.05 + 0.975;
        const spendingVariation = i === 0 ? 1 : Math.random() * 0.15 + 0.875;
        const monthlyIncome = Math.round(baseMonthlyIncome * incomeVariation);
        const monthlySpending = Math.min(
          Math.round(safeBaseSpending * spendingVariation),
          Math.round(monthlyIncome * 0.95)
        );
        data.push({
          period: months[monthIndex],
          income: monthlyIncome,
          spending: monthlySpending,
        });
      }
      return data.reverse();

    case "yearly":
      for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const yearlyVariation = 1 - i * 0.03 + (Math.random() * 0.06 - 0.03);
        const yearlyIncome = Math.round(
          baseMonthlyIncome * 12 * yearlyVariation
        );
        const yearlySpending = Math.min(
          Math.round(
            safeBaseSpending *
              12 *
              yearlyVariation *
              (Math.random() * 0.1 + 0.95)
          ),
          Math.round(yearlyIncome * 0.9)
        );
        data.push({
          period: year.toString(),
          income: yearlyIncome,
          spending: yearlySpending,
        });
      }
      return data.reverse();

    default:
      return [];
  }
};

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(142.1, 76.2%, 36.3%)",
  },
  spending: {
    label: "Spending",
    color: "hsl(0, 84.2%, 60.2%)",
  },
} satisfies ChartConfig;

interface RevenueChartProps {
  monthlyIncome: number;
  totalMonthlySpending: number;
}

export function RevenueChart({
  monthlyIncome,
  totalMonthlySpending,
}: RevenueChartProps) {
  const [timeframe, setTimeframe] = React.useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const [chartData, setChartData] = useState<FinancialDataPoint[] | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const safeSpending = Math.min(totalMonthlySpending, monthlyIncome * 0.9);
    const data = generateFinancialData(timeframe, monthlyIncome, safeSpending);
    setChartData(data);
  }, [monthlyIncome, totalMonthlySpending, timeframe]);

  const formatCurrency = (value: number): string => {
    if (timeframe === "yearly" && value > 10000) {
      return `€${(value / 1000).toFixed(0)}k`;
    }
    return `€${value.toLocaleString("en-IE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };
  const formatTooltipCurrency = (value: number): string => {
    return `€${value.toLocaleString("en-IE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalPeriodIncome =
    chartData?.reduce((sum, item) => sum + item.income, 0) ?? 0;
  const totalPeriodSpending =
    chartData?.reduce((sum, item) => sum + item.spending, 0) ?? 0;

  let trendText = "Calculating...";
  let isTrendingUp = false;
  if (chartData && chartData.length > 0) {
    const currentDataPoint = chartData[chartData.length - 1];
    const previousDataPoint =
      chartData.length > 1 ? chartData[chartData.length - 2] : null;
    if (currentDataPoint && previousDataPoint) {
      const currentNet = currentDataPoint.income - currentDataPoint.spending;
      const previousNet = previousDataPoint.income - previousDataPoint.spending;
      if (previousNet !== 0) {
        const trendPercentage =
          ((currentNet - previousNet) / Math.abs(previousNet)) * 100;
        isTrendingUp = trendPercentage >= 0;
        trendText = `${
          isTrendingUp ? "Trending up" : "Trending down"
        } by ${Math.abs(trendPercentage).toFixed(1)}%`;
      } else if (currentNet > 0) {
        isTrendingUp = true;
        trendText = "Trending up";
      } else if (currentNet < 0) {
        isTrendingUp = false;
        trendText = "Trending down";
      } else {
        trendText = "No change";
      }
    } else if (currentDataPoint) {
      isTrendingUp = currentDataPoint.income - currentDataPoint.spending >= 0;
      trendText = isTrendingUp ? "Positive balance" : "Negative balance";
    } else {
      trendText = "Data unavailable";
    }
  } else if (isClient) {
    trendText = "Data unavailable";
  }

  const timeframeTitles = {
    weekly: "Last 4 Weeks",
    monthly: "Last 12 Months",
    yearly: "Last 5 Years",
  };
  const cardTitle = `Income vs Spending (${timeframeTitles[timeframe]})`;
  const cardDescription = `${
    timeframe.charAt(0).toUpperCase() + timeframe.slice(1)
  } income and spending trends`;

  if (!isClient || !chartData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle>{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>
          <Select value={timeframe} disabled>
            <SelectTrigger className="w-[120px] h-8 text-xs ml-auto">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
          </Select>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </div>
        <Select
          value={timeframe}
          onValueChange={(value) =>
            setTimeframe(value as "weekly" | "monthly" | "yearly")
          }
        >
          <SelectTrigger className="w-[120px] h-8 text-xs ml-auto">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, left: 0, right: 10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={timeframe === "monthly" ? -30 : 0}
              dy={timeframe === "monthly" ? 5 : 0}
              interval={timeframe === "monthly" ? "preserveStartEnd" : 0}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCurrency}
              width={60}
            />
            <ShadcnChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) =>
                    typeof value === "number"
                      ? formatTooltipCurrency(value)
                      : value
                  }
                  labelClassName="font-semibold"
                />
              }
            />
            <Line
              dataKey="income"
              type="monotone"
              stroke={chartConfig.income.color}
              strokeWidth={2}
              dot={{ r: 4, fill: chartConfig.income.color, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                strokeWidth: 1,
                stroke: "hsl(var(--background))",
                fill: chartConfig.income.color,
              }}
            />
            <Line
              dataKey="spending"
              type="monotone"
              stroke={chartConfig.spending.color}
              strokeWidth={2}
              dot={{ r: 4, fill: chartConfig.spending.color, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                strokeWidth: 1,
                stroke: "hsl(var(--background))",
                fill: chartConfig.spending.color,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div
              className={`flex items-center gap-2 font-medium leading-none ${
                isTrendingUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendText}
              {(trendText.includes("up") || trendText.includes("down")) && (
                <TrendingUp
                  className={`h-4 w-4 ${!isTrendingUp ? "rotate-180" : ""}`}
                />
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} overview
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export { RevenueChart as Component };
