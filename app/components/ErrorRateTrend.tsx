import React, { useMemo } from 'react';
import type { LogEntry } from '~/types/glimpse';

interface ErrorTrendData {
  time: string;
  errorRate: number;
  totalRequests: number;
  errors: number;
  status: 'normal' | 'warning' | 'critical';
}

interface ErrorRateTrendProps {
  logs: LogEntry[];
  timeWindowMinutes?: number;
}


const ErrorRateTrend: React.FC<ErrorRateTrendProps> = ({
  logs,
  timeWindowMinutes = 120
}) => {
  const data = useMemo(() => {
    if (!logs.length) return [];

    const now = new Date();
    const timeWindow = timeWindowMinutes * 60 * 1000;
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return (now.getTime() - logTime.getTime()) <= timeWindow;
    });

    // Create 8 time buckets (15-minute intervals)
    const buckets: ErrorTrendData[] = [];
    const bucketDuration = timeWindow / 8;

    for (let i = 0; i < 8; i++) {
      const bucketEnd = now.getTime() - (i * bucketDuration);
      const bucketStart = bucketEnd - bucketDuration;

      const bucketLogs = recentLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= bucketStart && logTime < bucketEnd;
      });

      const totalRequests = bucketLogs.length;
      const errors = bucketLogs.filter(log => log.logLevelString === 'ERROR').length;
      const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;

      // Determine status based on error rate
      let status: ErrorTrendData['status'] = 'normal';
      if (errorRate > 5) {
        status = 'critical';
      } else if (errorRate > 2) {
        status = 'warning';
      }

      const bucketTime = new Date(bucketEnd - bucketDuration / 2);
      const timeStr = bucketTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      buckets.unshift({
        time: timeStr,
        errorRate,
        totalRequests,
        errors,
        status
      });
    }

    return buckets;
  }, [logs, timeWindowMinutes]);
  const maxErrorRate = Math.max(...data.map(d => d.errorRate));
  const currentErrorRate = data[data.length - 1]?.errorRate || 0;
  const previousErrorRate = data[data.length - 2]?.errorRate || 0;
  const trend = currentErrorRate > previousErrorRate ? 'up' : currentErrorRate < previousErrorRate ? 'down' : 'stable';

  const getStatusColor = (status: ErrorTrendData['status']) => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <span className="text-red-500">↗️</span>;
    } else if (trend === 'down') {
      return <span className="text-green-500">↘️</span>;
    }
    return <span className="text-gray-500">➡️</span>;
  };

  const currentStatus = data[data.length - 1]?.status || 'normal';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-gray-900">Error Rate Trend</h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-lg font-bold ${getStatusColor(currentStatus)}`}>
            {currentErrorRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="flex items-end justify-between h-20 mb-3">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full">
            <div className="relative w-full flex-1 flex items-end">
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  item.status === 'critical' ? 'bg-red-500' :
                  item.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ height: `${(item.errorRate / Math.max(maxErrorRate, 15)) * 100}%` }}
                title={`${item.time}: ${item.errorRate}% (${item.errors}/${item.totalRequests})`}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 font-mono">
              {item.time}
            </div>
          </div>
        ))}
      </div>

      {/* 현재 상태 요약 */}
      <div className="border-t pt-3">
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className={`text-sm font-bold ${getStatusColor(currentStatus)}`}>
              {data[data.length - 1]?.errors || 0}
            </div>
            <div className="text-gray-500">Current Errors</div>
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
              {data[data.length - 1]?.totalRequests || 0}
            </div>
            <div className="text-gray-500">Total Logs</div>
          </div>
          <div>
            <div className={`text-sm font-bold ${
              trend === 'up' ? 'text-red-600' :
              trend === 'down' ? 'text-green-600' : 'text-gray-600'
            }`}>
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
              {Math.abs(currentErrorRate - previousErrorRate).toFixed(1)}%
            </div>
            <div className="text-gray-500">vs Previous</div>
          </div>
        </div>
      </div>

      {/* 임계값 상태 */}
      <div className="mt-3 flex justify-center">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Normal (&lt;2%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Warning (2-5%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Critical (&gt;5%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorRateTrend;