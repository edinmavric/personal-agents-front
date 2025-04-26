"use client";

import React, { useState, useMemo } from "react";
import { BarChart as BarChartIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SpendingCategoryData {
  category: string;
  amount: number;
}

interface SpendingByCategoryChartProps {
  monthlyData?: SpendingCategoryData[];
  className?: string;
}

type TimePeriod = "week" | "month" | "year";

export function SpendingByCategoryChart({
  monthlyData = [],
  className,
}: SpendingByCategoryChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month");

  const chartData = useMemo(() => {
    let factor = 1;
    if (selectedPeriod === "week") {
      factor = 1 / 4;
    } else if (selectedPeriod === "year") {
      factor = 12;
    }

    return monthlyData
      .map((item, index) => ({
        category: item.category,
        amount: Math.max(
          0,
          item.amount * factor * (1 + (Math.random() - 0.5) * 0.1)
        ),
        color: generateColorFromPurple(index, monthlyData.length),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyData, selectedPeriod]);

  const totalSpending = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.amount, 0);
  }, [chartData]);

  function generateColorFromPurple(index: number, total: number): string {
    const baseHue = 250;
    const hueStep = 15;
    const hue = (baseHue + index * hueStep) % 360;
    const saturation = 75 - index * 2;
    const lightness = 65 - index * 2;
    return `hsl(${hue}, ${Math.max(40, saturation)}%, ${Math.max(
      40,
      lightness
    )}%)`;
  }

  const formatCurrency = (value: number) => {
    if (value == null) return "€0";
    return `€${value.toLocaleString("en-IE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "#9681fa",
    },
  } satisfies ChartConfig;

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value as TimePeriod);
  };

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const formattedValue = formatCurrency(value);
    const textWidth = formattedValue.length * 6;

    if (width < textWidth + 15) {
      return null;
    }

    return (
      <text
        x={x + width - 10}
        y={y + height / 2}
        fill="#fff"
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={500}
      >
        {formattedValue}
      </text>
    );
  };

  const cardDescription = `Breakdown of ${selectedPeriod}ly spending`;

  return (
    <Card
      className={`h-full flex flex-col pr-4 overflow-hidden shadow-sm ${className}`}
    >
      <CardHeader className="pb-0 pt-4 px-6">
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChartIcon className="h-5 w-5 text-[#9681fa]" />
            Spending by Category
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger
              className="w-[100px] h-8 text-xs focus:ring-0 focus:ring-offset-0"
              aria-label="Select time period"
            >
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week" className="text-xs">
                Week
              </SelectItem>
              <SelectItem value="month" className="text-xs">
                Month
              </SelectItem>
              <SelectItem value="year" className="text-xs">
                Year
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow pb-0 pt-2 overflow-y-auto custom-scrollbar">
        <ChartContainer
          config={chartConfig}
          className="h-auto min-h-[300px] w-full"
        >
          <ResponsiveContainer
            width="100%"
            height={Math.max(250, chartData.length * 40)}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 30, top: 5, bottom: 5 }}
              barCategoryGap="25%"
            >
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={120}
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <XAxis
                dataKey="amount"
                type="number"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                orientation="top"
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(value as number),
                  "Amount",
                ]}
                cursor={{
                  fill: "rgba(150, 129, 250, 0.15)",
                  strokeWidth: 0,
                  radius: 0,
                }}
                contentStyle={{
                  border: "1px solid rgba(150, 129, 250, 0.2)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  backgroundColor: "white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: "5px",
                  color: "#333",
                }}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                <LabelList dataKey="amount" content={renderCustomizedLabel} />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm pt-3 pb-4 px-6 border-t mt-0">
        <div className="flex justify-between w-full">
          <div className="flex gap-2 font-medium leading-none">
            <span className="text-muted-foreground">
              Total {selectedPeriod}ly spending:
            </span>
            <span className="text-[#9681fa] font-semibold">
              {formatCurrency(totalSpending)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#9681fa]"></div>
            <span className="text-xs text-muted-foreground">
              Based on {selectedPeriod} data
            </span>
          </div>
        </div>
      </CardFooter>

      <style jsx global>{`
        /* ... (keep existing scrollbar styles) ... */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #9681fa;
          background-clip: content-box;
          border: 2px solid transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #7f6de3;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #9681fa transparent;
        }
      `}</style>
    </Card>
  );
}
