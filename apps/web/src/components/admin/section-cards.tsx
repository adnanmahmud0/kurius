"use client";

import React from "react";

import { Eye, Heart, MessageSquare, Users, Video } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

interface StatCardsProps {
  totalUsers?: number;
  totalVideos?: number;
  totalViews?: number;
  totalLikes?: number;
  isLoading?: boolean;
}

export function SectionCards({
  totalUsers = 0,
  totalVideos = 0,
  totalViews = 0,
  totalLikes = 0,
  isLoading = false
}: StatCardsProps) {
  const cards = [
    {
      title: "Total Registered Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      description: "Active community members",
      gradient: "from-blue-500/10 to-indigo-500/5",
      textColor: "text-blue-500"
    },
    {
      title: "Total Videos Uploaded",
      value: totalVideos.toLocaleString(),
      icon: Video,
      description: "Catalog video items",
      gradient: "from-emerald-500/10 to-teal-500/5",
      textColor: "text-emerald-500"
    },
    {
      title: "Total Video Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      description: "Deduplicated views (24h window)",
      gradient: "from-amber-500/10 to-orange-500/5",
      textColor: "text-amber-500"
    },
    {
      title: "Total Likes Given",
      value: totalLikes.toLocaleString(),
      icon: Heart,
      description: "Community engagement",
      gradient: "from-rose-500/10 to-pink-500/5",
      textColor: "text-rose-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="my-2 h-8 w-20" />
            <Skeleton className="h-3 w-36" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`border-border/80 border bg-gradient-to-br ${card.gradient} transition-all duration-200 hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {card.title}
              </CardTitle>
              <div className={`bg-background/80 rounded-lg p-2 shadow-xs ${card.textColor}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-foreground text-3xl font-extrabold tracking-tight">
                {card.value}
              </div>
              <p className="text-muted-foreground mt-1 text-xs font-medium">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
