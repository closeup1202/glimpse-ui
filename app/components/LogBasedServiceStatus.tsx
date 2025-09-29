import React, { useMemo } from 'react';
import type { LogEntry } from '~/types/glimpse';

interface LogBasedServiceStatusProps {
  logs: LogEntry[];
  timeWindowMinutes?: number;
}

interface ServiceLogInfo {
  applicationName: string;
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  lastLogTime: string;
  errorRate: number;
  status: 'healthy' | 'warning' | 'critical' | 'silent';
  recentErrors: string[];
}

const LogBasedServiceStatus: React.FC<LogBasedServiceStatusProps> = ({
  logs,
  timeWindowMinutes = 15
}) => {
  const serviceStats = useMemo(() => {
    if (!logs.length) return [];

    // 가장 최근 로그 시간을 기준점으로 사용
    const latestLogTime = new Date(Math.max(...logs.map(log => new Date(log.timestamp).getTime())));
    const timeWindow = timeWindowMinutes * 60 * 1000;
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return (latestLogTime.getTime() - logTime.getTime()) <= timeWindow;
    });

    // 애플리케이션별로 그룹화
    const appGroups = recentLogs.reduce((acc, log) => {
      const appName = log.applicationName || 'Unknown';
      if (!acc[appName]) {
        acc[appName] = [];
      }
      acc[appName].push(log);
      return acc;
    }, {} as Record<string, LogEntry[]>);

    // 각 애플리케이션 통계 계산
    return Object.entries(appGroups).map(([appName, appLogs]): ServiceLogInfo => {
      const totalLogs = appLogs.length;
      const errorCount = appLogs.filter(log => log.logLevelString === 'ERROR').length;
      const warnCount = appLogs.filter(log => log.logLevelString === 'WARN').length;
      const errorRate = totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0;

      // 최근 에러 메시지들
      const recentErrors = appLogs
        .filter(log => log.logLevelString === 'ERROR')
        .map(log => log.message);

      // 마지막 로그 시간
      const sortedLogs = appLogs.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const lastLogTime = sortedLogs[0]?.timestamp || '';

      // 상태 결정 (로그 기반)
      let status: ServiceLogInfo['status'] = 'healthy';

      if (totalLogs === 0) {
        status = 'silent'; // 로그가 아예 없음 - 서비스가 죽었을 가능성
      } else if (errorRate > 20) {
        status = 'critical'; // 에러율 20% 초과
      } else if (errorRate > 5 || (totalLogs > 0 && errorCount > 10)) {
        status = 'warning'; // 에러율 5% 초과 또는 에러 10개 이상
      }

      return {
        applicationName: appName,
        totalLogs,
        errorCount,
        warnCount,
        lastLogTime,
        errorRate,
        status,
        recentErrors
      };
    }).sort((a, b) => {
      // 문제가 있는 서비스 먼저 표시
      const statusPriority = { critical: 0, warning: 1, silent: 2, healthy: 3 };
      return statusPriority[a.status] - statusPriority[b.status];
    });
  }, [logs, timeWindowMinutes]);

  const getStatusConfig = (status: ServiceLogInfo['status']) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-50',
          text: 'text-green-800',
          dot: 'bg-green-500',
          border: 'border-green-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          dot: 'bg-yellow-500',
          border: 'border-yellow-200'
        };
      case 'critical':
        return {
          bg: 'bg-red-50',
          text: 'text-red-800',
          dot: 'bg-red-500',
          border: 'border-red-200'
        };
      case 'silent':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          dot: 'bg-gray-500',
          border: 'border-gray-200'
        };
    }
  };

  const formatLastSeen = (timestamp: string) => {
    if (!timestamp) return 'No logs';
    const lastSeen = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  const healthyCount = serviceStats.filter(s => s.status === 'healthy').length;
  const warningCount = serviceStats.filter(s => s.status === 'warning').length;
  const criticalCount = serviceStats.filter(s => s.status === 'critical').length;
  const silentCount = serviceStats.filter(s => s.status === 'silent').length;

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="relative group">
          <h3 className="text-base font-medium text-gray-900 cursor-help">
            Service Status (Log-based)
          </h3>
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
              <div className="space-y-1">
                <div>• Healthy: &lt;5% errors</div>
                <div>• Warning: 5-20% errors</div>
                <div>• Critical: &gt;20% errors</div>
                <div>• Silent: No recent logs</div>
              </div>
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Last {timeWindowMinutes}m
        </div>
      </div>

      {/* 서비스 목록 또는 빈 상태 */}
      {serviceStats.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-sm">No services detected in recent logs</div>
          </div>
        </div>
      ) : (
        <>
          {/* 서비스 목록 */}
          <div className="space-y-2 mb-3 flex-1">
            {serviceStats.slice(0, 3).map((service, index) => {
              const statusConfig = getStatusConfig(service.status);

              return (
                <div
                  key={index}
                  className={`p-2 rounded-lg border ${statusConfig.border} ${statusConfig.bg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${statusConfig.dot}`}></div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{service.applicationName}</div>
                        <div className="text-xs text-gray-500">
                          {service.totalLogs} logs, {service.errorCount} errors
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {service.status === 'silent' ? 'SILENT' : `${service.errorRate.toFixed(1)}%`}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatLastSeen(service.lastLogTime)}
                      </div>
                    </div>
                  </div>

                  {/* 최근 에러들 */}
                  {service.recentErrors.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-red-600 font-medium mb-1">Recent Errors:</div>
                      {service.recentErrors.slice(0, 1).map((error, errorIndex) => (
                        <div key={errorIndex} className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded truncate">
                          {error}
                        </div>
                      ))}
                      {service.recentErrors.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{service.recentErrors.length - 1} more errors
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 전체 상태 요약 */}
          <div className="border-t border-gray-300 pt-3 flex-shrink-0">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <div className="text-sm font-bold text-green-600">{healthyCount}</div>
                <div className="text-gray-500">Healthy</div>
              </div>
              <div>
                <div className="text-sm font-bold text-yellow-600">{warningCount}</div>
                <div className="text-gray-500">Warning</div>
              </div>
              <div>
                <div className="text-sm font-bold text-red-600">{criticalCount}</div>
                <div className="text-gray-500">Critical</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-600">{silentCount}</div>
                <div className="text-gray-500">Silent</div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default LogBasedServiceStatus;