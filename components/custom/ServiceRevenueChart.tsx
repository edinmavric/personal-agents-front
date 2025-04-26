"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated data structure
interface SpendingItem {
  item: string; // Changed from serviceName (can be category or merchant)
  amount: number; // Changed from revenue
}

interface TopBottomSpendingChartProps {
  data?: SpendingItem[]; // Use updated interface
  className?: string;
  displayMode?: "top" | "bottom";
}

const chartConfig = {
  amount: {
    // Changed from revenue
    label: "Amount",
    color: "#9681fa", // Keep purple theme or adjust
  },
} satisfies ChartConfig;

export function ServiceRevenueChart({
  // Keep function name for now, or rename file/function
  data = [],
  className,
  displayMode = "top",
}: TopBottomSpendingChartProps) {
  // Use updated props interface
  const [selectedPeriod, setSelectedPeriod] = useState("month"); // Default to month

  // Process data passed via props
  const processedData = [...data]
    .sort(
      (a, b) =>
        displayMode === "top" ? b.amount - a.amount : a.amount - b.amount // Sort by amount
    )
    .slice(0, 5) // Take top/bottom 5
    .map((item, index) => ({
      ...item,
      // Shorten long names if necessary
      item: item.item.length > 10 ? item.item.slice(0, 9) + "..." : item.item,
      color: generateColorFromPurple(index, 5, displayMode === "bottom"),
    }));

  function generateColorFromPurple(
    index: number,
    total: number,
    reverse: boolean = false
  ): string {
    const effectiveIndex = reverse ? total - 1 - index : index;
    const baseHue = 250;
    const hueStep = 15;
    const hue = baseHue - effectiveIndex * hueStep;
    const saturation = 85 - effectiveIndex * 3;
    const lightness = 72 - effectiveIndex * 2;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Format currency as Euros
  const formatCurrency = (value: number) =>
    `€${value.toLocaleString("en-IE", {
      minimumFractionDigits: 0, // Whole Euros for chart simplicity
      maximumFractionDigits: 0,
    })}`;

  const formatAxisCurrency = (value: number) => `€${value / 1000}k`; // Format as k€

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    // Add logic to refetch/filter data based on period if needed
  };

  const chartTitle =
    displayMode === "top" ? "Top 5 Spending" : "Bottom 5 Spending";
  const chartDescription =
    displayMode === "top"
      ? "Highest spending items/merchants"
      : "Lowest spending items/merchants";
  const TitleIcon = displayMode === "top" ? TrendingUp : TrendingDown;

  return (
    <Card className={`flex flex-col ${className}`}>
      {/* Header remains similar, adjust text */}
      <CardHeader className="pb-2 px-6">
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TitleIcon
              className={`h-4 w-4 ${
                displayMode === "top" ? "text-green-500" : "text-red-500"
              }`}
            />
            {chartTitle}
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[110px] h-7 text-xs bg-muted border-none focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="text-xs">
          {chartDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow pt-0 pb-4 px-2">
        {processedData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No spending data.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[145px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 5, left: 5, bottom: 5 }}
                accessibilityLayer
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                />
                <XAxis
                  dataKey="item" // Use item key
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  dataKey="amount" // Use amount key
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatAxisCurrency}
                  tick={{ fontSize: 10 }}
                  tickMargin={5}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  }
                />
                <Bar dataKey="amount" radius={6}>
                  <LabelList
                    dataKey="amount"
                    position="top"
                    offset={8}
                    className="fill-foreground"
                    fontSize={10}
                    formatter={formatCurrency}
                  />
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      {/* Footer removed */}
    </Card>
  );
}
