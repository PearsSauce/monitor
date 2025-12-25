'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Activity, 
  ShieldAlert, 
  AlertCircle, 
  ChevronRight
} from 'lucide-react';
import { NotificationItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface NotificationTickerProps {
  notices: NotificationItem[];
  loading?: boolean;
}

export const NotificationTicker: React.FC<NotificationTickerProps> = ({ notices, loading }) => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 自动轮播逻辑
  useEffect(() => {
    if (notices.length <= 1 || isPaused) return;
    
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % notices.length);
    }, 4000); // 延长到4秒，给用户更多阅读时间
    
    return () => clearInterval(t);
  }, [notices.length, isPaused]);

  if (loading) {
    return <Skeleton className="h-11 w-full rounded-2xl" />;
  }

  // 空状态：一切正常 - Apple Style
  if (notices.length === 0) {
    return (
      <Card
        className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white/50 px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all hover:bg-white/80 dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-none dark:hover:bg-zinc-900/80"
      >
        <div className="flex h-6 items-center gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-500/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-xs font-medium text-black/70 dark:text-white/70">系统运行正常</span>
        </div>
      </Card>
    );
  }

  const currentIndex = index % notices.length;
  const currentNotice = notices[currentIndex];
  
  // 确定图标和颜色 - Apple Style Colors
  const getIconAndColor = (type?: string) => {
    switch (type) {
      case 'status_change':
        return { 
          icon: Activity, 
          color: 'text-red-500 dark:text-red-400',
          bg: 'bg-red-500/10 dark:bg-red-500/20'
        };
      case 'ssl_expiry':
        return { 
          icon: ShieldAlert, 
          color: 'text-amber-500 dark:text-amber-400',
          bg: 'bg-amber-500/10 dark:bg-amber-500/20'
        };
      default:
        return { 
          icon: AlertCircle, 
          color: 'text-orange-500 dark:text-orange-400',
          bg: 'bg-orange-500/10 dark:bg-orange-500/20'
        };
    }
  };

  const style = getIconAndColor(currentNotice?.type);
  const Icon = style.icon;

  return (
    <div className="w-full space-y-2">
      <style jsx>{`
        @keyframes slideUpFade {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slideUpFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <Card
        className={cn(
          "relative overflow-hidden rounded-2xl transition-all duration-300",
          // Apple Glassmorphism Base
          "border border-black/5 bg-white/60 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]",
          // Dark Mode
          "dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-none",
          // Hover State
          "hover:bg-white/80 dark:hover:bg-zinc-900/80 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]",
          // Active Border highlight
          "hover:border-black/10 dark:hover:border-white/20"
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="flex h-11 cursor-pointer items-center gap-3 px-3.5 pr-8"
          onClick={() => router.push('/notifications')}
        >
          {/* 左侧：圆形图标容器 */}
          <div className="relative shrink-0">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-full transition-colors", style.bg)}>
              <Icon className={cn("h-4 w-4", style.color)} />
            </div>
            {/* 计数器 - 悬浮在图标右下角的微型胶囊 */}
             <div className="absolute -bottom-1 -right-2 rounded-full border border-white/50 bg-white/90 px-1 py-[1px] text-[8px] font-bold leading-none text-black/60 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-zinc-800/90 dark:text-white/60">
              {currentIndex + 1}/{notices.length}
            </div>
          </div>

          {/* 分割线 - 极淡 */}
          <div className="h-5 w-px bg-black/5 dark:bg-white/10 shrink-0" />

          {/* 中间：内容区域 */}
          <div className="flex-1 overflow-hidden">
            <div key={currentNotice?.id ?? index} className="animate-slide-up flex flex-col justify-center gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 text-xs font-semibold tracking-tight text-black/80 dark:text-white/90">
                  {currentNotice?.monitor_name || '未知站点'}
                </span>
                <span className="shrink-0 text-[10px] font-medium text-black/40 dark:text-white/40">
                  {currentNotice ? new Date(currentNotice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <span className="truncate text-[11px] font-medium text-black/60 dark:text-white/60">
                {currentNotice?.message || '无详细信息'}
              </span>
            </div>
          </div>

          {/* 右侧：箭头 */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 transition-colors group-hover:text-black/60 dark:group-hover:text-white/60">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* 底部进度条 - 放在最底部，半透明 */}
        {notices.length > 1 && !isPaused && (
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-transparent">
             <div 
               key={index}
               className="h-full bg-black/10 dark:bg-white/20 blur-[1px]"
               style={{ 
                 width: '100%',
                 animation: 'progress 4s linear' 
               }} 
             />
          </div>
        )}
      </Card>
    </div>
  );
};
