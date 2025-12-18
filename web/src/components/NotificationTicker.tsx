import React from 'react';
import { Carousel, Tag, Typography, Space, Card } from '@arco-design/web-react';
import { IconNotification } from '@arco-design/web-react/icon';

type NotificationItem = {
  id: number;
  monitor_id: number;
  created_at: string;
  type: string;
  message: string;
  monitor_name: string;
};

interface NotificationTickerProps {
  notices: NotificationItem[];
  onClick: () => void;
  isDark: boolean;
}

export const NotificationTicker: React.FC<NotificationTickerProps> = ({ notices, onClick, isDark }) => {
  if (notices.length === 0) {
    return (
      <Card
        className="cursor-pointer rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60"
        bodyStyle={{ padding: '12px 20px' }}
        onClick={onClick}
      >
        <Space>
          <IconNotification style={{ fontSize: 20, color: 'var(--color-text-3)' }} />
          <Typography.Text type="secondary">暂无异常通知</Typography.Text>
        </Space>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer rounded-xl shadow-none bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800/60"
      bodyStyle={{ padding: 0 }}
      style={{ overflow: 'hidden', borderLeft: '4px solid rgb(var(--red-6))' }}
      onClick={onClick}
    >
      <Carousel
        autoPlay
        indicatorType="never"
        showArrow="never"
        direction="vertical"
        style={{ height: 48, lineHeight: '48px' }}
        timingFunc="linear"
      >
        {notices.map((notice) => (
          <div key={notice.id} style={{ padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center' }}>
             <Space size={12} style={{ width: '100%' }}>
                <IconNotification style={{ fontSize: 20, color: 'rgb(var(--red-6))' }} />
                <Tag color={notice.type === 'status_change' ? 'red' : notice.type === 'ssl_expiry' ? 'orange' : 'blue'} size="small">
                  {notice.type === 'status_change' ? '状态变更' : notice.type === 'ssl_expiry' ? 'SSL过期' : notice.type}
                </Tag>
                <Typography.Text style={{ color: 'var(--color-text-2)', fontSize: 12 }}>
                  {new Date(notice.created_at).toLocaleTimeString()}
                </Typography.Text>
                <Typography.Paragraph 
                    ellipsis={{ rows: 1, showTooltip: true }} 
                    style={{ margin: 0, flex: 1, color: 'var(--color-text-1)' }}
                >
                  <span style={{ fontWeight: 500 }}>[{notice.monitor_name}]</span> {notice.message}
                </Typography.Paragraph>
             </Space>
          </div>
        ))}
      </Carousel>
    </Card>
  );
};
