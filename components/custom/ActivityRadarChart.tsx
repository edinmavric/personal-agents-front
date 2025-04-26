"use client";

import { Activity } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer, // Importuj ResponsiveContainer
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Interfejs za podatke
interface ActivityRadarData {
  activity: string;
  minutes: number;
  fullMark: number; // Max vrednost za osu
}

interface ActivityRadarChartProps {
  data: ActivityRadarData[]; // Prop za podatke
}

export function Component({ data }: ActivityRadarChartProps) {
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const radarColor = "hsl(142.1 70.6% 45.3%)";

  return (
    <Card className="h-full max-h-[500px] flex flex-col">
      <CardHeader className="items-center pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" /> Activity Distribution
        </CardTitle>
        <CardDescription>
          Time spent on different activities (Avg. Daily)
        </CardDescription>
      </CardHeader>
      {/* Omogućavamo da CardContent raste i centriramo sadržaj */}
      <CardContent className="pb-0 flex-grow flex items-center justify-center h-full max-h-full">
        {/* ChartContainer sada samo pruža config, ResponsiveContainer upravlja veličinom */}
        <ChartContainer
          config={{}}
          className="w-full h-full max-h-full" // Neka ChartContainer zauzme sav prostor CardContent-a
        >
          {/* ResponsiveContainer će se prilagoditi ChartContainer-u */}
          <ResponsiveContainer width="100%" height="100%">
            {/* Dodajemo marginu na RadarChart */}
            <RadarChart
              data={data}
              margin={{ top: 20, right: 30, bottom: 10, left: 30 }}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
                formatter={(value, name) => [`${value} min`, name]}
              />
              <PolarGrid gridType="circle" />
              <PolarAngleAxis dataKey="activity" tick={{ fontSize: 10 }} />
              <Radar
                dataKey="minutes"
                fill={radarColor}
                fillOpacity={0.6}
                stroke={radarColor}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                  stroke: radarColor,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="leading-none text-muted-foreground">
          Total activity time shown: {totalMinutes} minutes
        </div>
      </CardFooter>
    </Card>
  );
}
