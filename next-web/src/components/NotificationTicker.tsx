'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Bell, CheckCircle, Activity, ShieldAlert, AlertCircle } from 'lucide-react';
import { NotificationItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationTickerProps {
  notices: NotificationItem[];
  loading?: boolean;
}

export const NotificationTicker: React.FC<NotificationTickerProps> = ({ notices, loading }) => {
  const router = useRouter();
  const [index, setIndex] = useState(0)


  useEffect(() => {
    if (notices.length <= 1) return
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % notices.length)
    }, 3000)
    return () => clearInterval(t)
  }, [notices.length])

  if (loading) {
    return <Skeleton className="h-12 w-full rounded-xl" />;
  }

  if (notices.length === 0) {
    return (
      <Card
        className="rounded-xl shadow-none bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30 p-0 h-12 flex items-center justify-center transition-colors"
      >
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">暂无异常告警</span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      data-slot="card"
      className="cursor-pointer rounded-xl shadow-none bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30 overflow-hidden border-l-4 border-l-red-600 p-0 h-12 flex items-center transition-colors hover:bg-red-100/50 dark:hover:bg-red-900/20"
      onClick={() => router.push('/notifications')}
    >
      <div className="shrink-0 px-4 flex items-center justify-center h-full">
        <Bell className="w-5 h-5 text-red-600 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0 h-full">
        {(() => {
          const currentIndex = notices.length ? (index % notices.length) : 0
          const notice = notices[currentIndex] ?? notices[0]
          const Icon = notice?.type === 'status_change' ? Activity : notice?.type === 'ssl_expiry' ? ShieldAlert : AlertCircle
          const iconColor =
            notice?.type === 'status_change'
              ? 'text-red-600/80 dark:text-red-400/80'
              : notice?.type === 'ssl_expiry'
              ? 'text-amber-600/80 dark:text-amber-400/80'
              : 'text-muted-foreground'
          const label = `[${(notice?.monitor_name || '未知站点')}] ${(notice?.message || '无详细信息')}`
          return (
            <div key={notice?.id ?? 'current'} className="flex items-center gap-2 sm:gap-3 w-full overflow-hidden pr-4" aria-label={label}>
              <Icon className={`shrink-0 w-4 h-4 ${iconColor}`} />
              <span className="text-xs hidden md:inline shrink-0 font-mono text-red-600/80 dark:text-red-400/80">
                {notice ? new Date(notice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
              </span>
              <div className="flex-1 min-w-0 truncate text-sm text-red-900 dark:text-red-100">
                <span className="font-semibold">[{notice?.monitor_name || '未知站点'}]</span> {notice?.message || '无详细信息'}
              </div>
            </div>
          )
        })()}
      </div>
    </Card>
  );
};
