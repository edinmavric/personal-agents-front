"use client";

import { Smartphone } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface ScreenTimeData {
  app: string;
  minutes: number;
  color: string;
}

interface ScreenTimeChartProps {
  data: ScreenTimeData[];
}

const colorToCategory: Record<string, string> = {
  "#6366f1": "Social",
  "#22d3ee": "Productivity",
  "#f59e42": "Entertainment",
  "#a3e635": "Other",
};

const CustomTooltip = ({
  active,
  payload,
  total,
  formatTime,
}: {
  active?: boolean;
  payload?: any[];
  total: number;
  formatTime: (min: number) => string;
}) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    const category = colorToCategory[entry.color] || entry.app;
    return (
      <div className="rounded-lg bg-black border border-zinc-800 px-4 py-2 shadow-lg min-w-[150px] flex items-center gap-3">
        <span
          className="inline-block w-4 h-4 rounded-full border border-zinc-700"
          style={{ backgroundColor: entry.color }}
        />
        <div className="flex flex-col">
          <span className="font-semibold text-white text-base">
            {entry.app}
          </span>
          <span className="text-xs text-zinc-300">{category}</span>
        </div>
        <span className="ml-auto text-sm text-white">
          {formatTime(entry.minutes)}
        </span>
      </div>
    );
  }
  return null;
};

export function Component({ data }: ScreenTimeChartProps) {
  const total = data.reduce((sum, d) => sum + d.minutes, 0);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
  };

  return (
    <Card className="h-full max-h-[550px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-indigo-600" /> Screen Time
        </CardTitle>
        <CardDescription>Daily phone usage by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex h-full max-h-full gap-8">
        <div className="flex-[2] flex items-center justify-center min-w-[180px]">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="minutes"
                nameKey="app"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.app} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    {...props}
                    total={total}
                    formatTime={formatTime}
                  />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="rounded-xl border bg-muted/60 p-4 shadow-sm flex flex-col gap-1">
            {data.map((entry) => (
              <div
                key={entry.app}
                className="flex items-center px-2 py-2 rounded-md hover:bg-muted transition group"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium flex-1 text-sm">{entry.app}</span>
                <span className="text-xs tabular-nums text-right min-w-[56px] text-muted-foreground">
                  {formatTime(entry.minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Total: {formatTime(total)}
      </CardFooter>
    </Card>
  );
}
