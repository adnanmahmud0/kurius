"use client";

import React, { useState } from "react";

import { Activity, TrendingUp } from "lucide-react";

import { Badge } from "@/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <Card className="border-border/80 border">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Activity className="text-primary h-5 w-5" />
            Platform Activity Overview
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-0.5 text-xs">
            Real-time engagement trends across views, likes, and comments
          </CardDescription>
        </div>
        <div className="bg-muted/60 flex items-center gap-1.5 rounded-lg p-1">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                timeRange === range
                  ? "bg-background text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-border bg-muted/20 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-foreground text-sm font-semibold">
            Activity telemetry recording live events
          </p>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            As mobile and web users watch videos, view events are recorded with 24-hour window
            deduplication.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Badge variant="outline" className="bg-background text-xs">
              Views Tracking: <span className="ml-1 font-bold text-emerald-500">Active</span>
            </Badge>
            <Badge variant="outline" className="bg-background text-xs">
              Likes Deduplication: <span className="ml-1 font-bold text-emerald-500">Enforced</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
