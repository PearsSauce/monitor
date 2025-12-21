'use client'

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { NotificationItem } from '@/types';
import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';

interface NotificationTickerProps {
  notices: NotificationItem[];
  loading?: boolean;
  onClick: () => void;
}

export const NotificationTicker: React.FC<NotificationTickerProps> = ({ notices, loading, onClick }) => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  if (loading) {
    return <Skeleton className="h-12 w-full rounded-xl" />;
  }

  if (notices.length === 0) {
    return (
      <Card
        className="cursor-pointer rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60 p-3"
        onClick={onClick}
      >
        <div className="w-full flex justify-center items-center gap-2 text-muted-foreground">
          <Bell className="w-5 h-5" />
          <span>暂无异常通知</span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60 overflow-hidden border-l-4 border-l-red-600 p-0 h-12 flex items-center"
      onClick={onClick}
    >
      <div className="shrink-0 px-4 flex items-center justify-center h-full">
        <Bell className="w-5 h-5 text-red-600" />
      </div>
      <div className="flex-1 min-w-0 h-full">
        <Carousel
          plugins={[plugin.current]}
          orientation="vertical"
          className="w-full h-full"
          opts={{ align: "start", loop: true }}
        >
          <CarouselContent className="-mt-1 h-12">
            {notices.map((notice) => (
              <CarouselItem key={notice.id} className="pt-1 h-12 flex items-center">
                <div className="flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
                  <Badge variant={notice.type === 'status_change' ? 'destructive' : notice.type === 'ssl_expiry' ? 'secondary' : 'default'} className="shrink-0">
                    {notice.type === 'status_change' ? '状态变更' : notice.type === 'ssl_expiry' ? 'SSL过期' : notice.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">
                    {new Date(notice.created_at).toLocaleTimeString()}
                  </span>
                  <div className="min-w-0 truncate text-sm">
                    <span className="font-medium">[{notice.monitor_name}]</span> {notice.message}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </Card>
  );
};
