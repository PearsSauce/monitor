import React, { useMemo } from 'react';
import { VChart } from '@visactor/react-vchart';

interface TrendData {
  time: string;
  avg_resp: number;
}

interface TrendChartProps {
  data: TrendData[];
  isDark: boolean;
}

export const ResponseTrendChart: React.FC<TrendChartProps> = ({ data, isDark }) => {
  const spec = useMemo(() => ({
    type: 'area',
    background: 'transparent',
    data: {
      values: data,
    },
    xField: 'time',
    yField: 'avg_resp',
    axes: [
      {
        orient: 'bottom',
        type: 'time',
        label: {
          visible: true,
          style: { fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }
        },
      },
      {
        orient: 'left',
        label: {
          visible: true,
          style: { fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }
        },
        grid: {
            style: { lineDash: [4, 4], stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
        }
      }
    ],
    crosshair: {
      xField: { visible: true, label: { visible: true, style: { fill: '#fff', background: { fill: '#165DFF' } } } },
      yField: { visible: false }
    },
    point: {
        visible: true,
        style: { fill: isDark ? '#60a5fa' : '#165DFF', stroke: isDark ? '#1f2937' : '#fff', lineWidth: 2 }
    },
    tooltip: {
        visible: true,
        style: {
          panel: {
            backgroundColor: isDark ? 'rgba(23,23,23,0.9)' : 'rgba(255,255,255,0.9)',
            border: {
              stroke: isDark ? '#333' : '#eee'
            },
            shadow: {
              color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
            }
          },
          title: {
            style: { fill: isDark ? '#fff' : '#000' }
          },
          content: {
            key: { style: { fill: isDark ? 'rgba(255,255,255,0.7)' : '#666' } },
            value: { style: { fill: isDark ? '#fff' : '#000' } }
          }
        },
        mark: {
            title: { value: '平均响应' },
            content: [{ key: (d: any) => new Date(d.time).toLocaleString(), value: (d: any) => `${d.avg_resp}ms` }]
        }
    },
    title: {
      visible: true,
      text: '24小时平均响应趋势',
      align: 'left',
      style: { fill: isDark ? '#fff' : '#000', fontSize: 16, fontWeight: 'normal' },
      padding: { bottom: 10 }
    },
    color: [isDark ? '#60a5fa' : '#165DFF'],
    area: {
        style: {
            fill: {
                gradient: 'linear',
                x0: 0.5, y0: 0, x1: 0.5, y1: 1,
                stops: [
                    { offset: 0, color: isDark ? 'rgba(96,165,250,0.5)' : 'rgba(22,93,255,0.5)' },
                    { offset: 1, color: isDark ? 'rgba(96,165,250,0.0)' : 'rgba(22,93,255,0.0)' }
                ]
            }
        }
    }
  }), [data, isDark]);

  return <VChart spec={spec as any} options={{ mode: 'desktop-browser' }} style={{ height: 320 }} />;
};

interface DistProps {
  data: { range: string; count: number }[];
  isDark: boolean;
}

export const ResponseDistChart: React.FC<DistProps> = ({ data, isDark }) => {
  const spec = useMemo(() => ({
    type: 'pie',
    background: 'transparent',
    data: {
      values: data,
    },
    outerRadius: 0.75,
    innerRadius: 0.5,
    padAngle: 1,
    valueField: 'count',
    categoryField: 'range',
    pie: {
      style: {
        cornerRadius: 4
      },
      state: {
          hover: { outerRadius: 0.8 }
      }
    },
    legends: {
      visible: true,
      orient: 'bottom',
      item: {
        label: {
            style: { fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }
        }
      }
    },
    tooltip: {
        visible: true,
        style: {
          panel: {
            backgroundColor: isDark ? 'rgba(23,23,23,0.9)' : 'rgba(255,255,255,0.9)',
            border: {
              stroke: isDark ? '#333' : '#eee'
            },
            shadow: {
              color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
            }
          },
          title: {
            style: { fill: isDark ? '#fff' : '#000' }
          },
          content: {
            key: { style: { fill: isDark ? 'rgba(255,255,255,0.7)' : '#666' } },
            value: { style: { fill: isDark ? '#fff' : '#000' } }
          }
        }
    },
    title: {
      visible: true,
      text: '实时响应耗时分布',
      align: 'left',
      style: { fill: isDark ? '#fff' : '#000', fontSize: 16, fontWeight: 'normal' },
      padding: { bottom: 10 }
    },
    color: isDark ? 
      ['#4ade80', '#60a5fa', '#fb923c', '#f87171'] : 
      ['#00B42A', '#165DFF', '#FF7D00', '#F53F3F']
  }), [data, isDark]);

  return <VChart spec={spec as any} options={{ mode: 'desktop-browser' }} style={{ height: 320 }} />;
};
