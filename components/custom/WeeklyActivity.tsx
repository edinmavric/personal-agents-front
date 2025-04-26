"use client";

import { CalendarDays } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface WeeklyActivityData {
  name: string;
  steps: number;
  calories: number;
}

interface WeeklyActivityChartProps {
  data: WeeklyActivityData[];
}

export function Component({ data }: WeeklyActivityChartProps) {
  const avgSteps = data.reduce((sum, d) => sum + d.steps, 0) / data.length;
  const avgCalories =
    data.reduce((sum, d) => sum + d.calories, 0) / data.length;

  const stepsColor = "hsl(221.2 83.2% 53.3%)";
  const caloriesColor = "hsl(22.6 82.1% 56.9%)";

  return (
    <Card className="h-full max-h-[550px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-600" /> Weekly Activity
        </CardTitle>
        <CardDescription>
          Steps and Calories Burned (Last 7 Days)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow h-full max-h-full">
        <ChartContainer config={{}} className="h-full max-h-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={50}
              tickFormatter={(value) =>
                value > 1000
                  ? `${(value / 1000).toFixed(0)}k`
                  : value.toString()
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="steps" fill={stepsColor} radius={4} />
            <Bar dataKey="calories" fill={caloriesColor} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
        <div className="leading-none text-muted-foreground">
          Avg. Daily Steps: {Math.round(avgSteps).toLocaleString()} | Avg. Daily
          Calories: {Math.round(avgCalories).toLocaleString()} kcal
        </div>
      </CardFooter>
    </Card>
  );
}
