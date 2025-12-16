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

const CHART_COLORS = {
  light: {
    trend: '#165DFF',
    trendGradientStart: 'rgba(22,93,255,0.5)',
    trendGradientEnd: 'rgba(22,93,255,0.0)',
    dist: ['#00B42A', '#165DFF', '#FF7D00', '#F53F3F'], // Green, Blue, Orange, Red
    text: 'rgba(0,0,0,0.7)',
    grid: 'rgba(0,0,0,0.1)',
    tooltipBg: 'rgba(255,255,255,0.9)',
    tooltipBorder: '#eee',
    tooltipShadow: 'rgba(0,0,0,0.1)',
    pointStroke: '#fff',
    crosshair: '#165DFF'
  },
  dark: {
    trend: '#4080FF',
    trendGradientStart: 'rgba(64,128,255,0.5)',
    trendGradientEnd: 'rgba(64,128,255,0.0)',
    dist: ['#27C346', '#4080FF', '#FF9626', '#F76560'], // Brighter/Lighter versions
    text: 'rgba(255,255,255,0.7)',
    grid: 'rgba(255,255,255,0.1)',
    tooltipBg: 'rgba(23,23,23,0.9)',
    tooltipBorder: '#333',
    tooltipShadow: 'rgba(0,0,0,0.5)',
    pointStroke: '#232324',
    crosshair: '#4080FF'
  }
};

export const ResponseTrendChart: React.FC<TrendChartProps> = ({ data, isDark }) => {
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

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
          style: { fill: colors.text }
        },
      },
      {
        orient: 'left',
        label: {
          visible: true,
          style: { fill: colors.text }
        },
        grid: {
            style: { lineDash: [4, 4], stroke: colors.grid }
        }
      }
    ],
    crosshair: {
      xField: { visible: true, label: { visible: true, style: { fill: '#fff', background: { fill: colors.crosshair } } } },
      yField: { visible: false }
    },
    point: {
        visible: true,
        style: { fill: colors.trend, stroke: colors.pointStroke, lineWidth: 2 }
    },
    tooltip: {
        visible: true,
        style: {
          panel: {
            backgroundColor: colors.tooltipBg,
            border: {
              stroke: colors.tooltipBorder
            },
            shadow: {
              color: colors.tooltipShadow
            }
          },
          title: {
            style: { fill: isDark ? '#fff' : '#000' }
          },
          content: {
            key: { style: { fill: colors.text } },
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
    color: [colors.trend],
    area: {
        style: {
            fill: {
                gradient: 'linear',
                x0: 0.5, y0: 0, x1: 0.5, y1: 1,
                stops: [
                    { offset: 0, color: colors.trendGradientStart },
                    { offset: 1, color: colors.trendGradientEnd }
                ]
            }
        }
    }
  }), [data, isDark, colors]);

  return <VChart spec={spec as any} options={{ mode: 'desktop-browser' }} style={{ height: 320 }} />;
};

interface DistProps {
  data: { range: string; count: number }[];
  isDark: boolean;
}

export const ResponseDistChart: React.FC<DistProps> = ({ data, isDark }) => {
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

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
            style: { fill: colors.text }
        }
      }
    },
    tooltip: {
        visible: true,
        style: {
          panel: {
            backgroundColor: colors.tooltipBg,
            border: {
              stroke: colors.tooltipBorder
            },
            shadow: {
              color: colors.tooltipShadow
            }
          },
          title: {
            style: { fill: isDark ? '#fff' : '#000' }
          },
          content: {
            key: { style: { fill: colors.text } },
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
    color: colors.dist
  }), [data, isDark, colors]);

  return <VChart spec={spec as any} options={{ mode: 'desktop-browser' }} style={{ height: 320 }} />;
};
