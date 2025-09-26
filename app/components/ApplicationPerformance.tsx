import React, { useMemo } from 'react';
import type { LogEntry } from '~/types/glimpse';

interface AppLogStats {
  applicationName: string;
  totalLogs: number;
  errorRate: number;
  logFrequency: number; // 분당 로그 수
  recentActivity: number; // 최근 5분간 로그 수
  status: 'healthy' | 'warning' | 'critical' | 'silent';
}

interface ApplicationPerformanceProps {
  logs: LogEntry[];
  timeWindowMinutes?: number;
}

const ApplicationPerformance: React.FC<ApplicationPerformanceProps> = ({
  logs,
  timeWindowMinutes = 30
}) => {
  const applicationStats = useMemo(() => {
    if (!logs.length) return [];

    const now = new Date();
    const timeWindow = timeWindowMinutes * 60 * 1000;
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return (now.getTime() - logTime.getTime()) <= timeWindow;
    });

    // 최근 5분간 로그 (활동성 체크용)
    const last5MinutesLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return (now.getTime() - logTime.getTime()) <= (5 * 60 * 1000);
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
    return Object.entries(appGroups).map(([appName, appLogs]): AppLogStats => {
      const totalLogs = appLogs.length;
      const errorCount = appLogs.filter(log => log.logLevelString === 'ERROR').length;
      const errorRate = totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0;
      const logFrequency = totalLogs / timeWindowMinutes; // 분당 로그 수

      // 최근 5분간 해당 앱의 로그 수
      const recentActivity = last5MinutesLogs.filter(log =>
        (log.applicationName || 'Unknown') === appName
      ).length;

      // 상태 결정
      let status: AppLogStats['status'] = 'healthy';
      if (recentActivity === 0 && totalLogs < 5) {
        status = 'silent'; // 거의 로그가 없음
      } else if (errorRate > 15) {
        status = 'critical';
      } else if (errorRate > 5 || logFrequency < 0.5) {
        status = 'warning';
      }

      return {
        applicationName: appName,
        totalLogs,
        errorRate,
        logFrequency,
        recentActivity,
        status
      };
    }).sort((a, b) => b.totalLogs - a.totalLogs); // 로그 수 많은 순으로 정렬
  }, [logs, timeWindowMinutes]);
  const getStatusColor = (status: AppLogStats['status']) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          dot: 'bg-green-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          dot: 'bg-yellow-500'
        };
      case 'critical':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          dot: 'bg-red-500'
        };
      case 'silent':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          dot: 'bg-gray-500'
        };
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-base font-medium text-gray-900 mb-3">Application Performance</h3>

      <div className="space-y-2">
        {applicationStats.slice(0, 3).map((app, index) => {
          const statusColor = getStatusColor(app.status);

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border ${statusColor.bg} border-opacity-50`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${statusColor.dot}`}></div>
                  <h4 className="text-sm font-medium text-gray-900">{app.applicationName}</h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor.bg} ${statusColor.text}`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-gray-600">
                  {formatNumber(app.totalLogs)} logs
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Error Rate */}
                <div className="text-center">
                  <div className="text-sm font-bold text-red-600">
                    {app.errorRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Error Rate</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-red-500 h-1 rounded-full"
                      style={{ width: `${Math.min(app.errorRate, 20) * 5}%` }}
                    ></div>
                  </div>
                </div>

                {/* Log Frequency */}
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600">
                    {app.logFrequency.toFixed(1)}/min
                  </div>
                  <div className="text-xs text-gray-500">Log Freq</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${Math.min((app.logFrequency / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="text-center">
                  <div className="text-sm font-bold text-green-600">
                    {app.recentActivity}
                  </div>
                  <div className="text-xs text-gray-500">Recent 5m</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${Math.min((app.recentActivity / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 요약 통계 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {applicationStats.length}
            </div>
            <div className="text-sm text-gray-500">Total Apps</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {applicationStats.filter(app => app.status === 'healthy').length}
            </div>
            <div className="text-sm text-gray-500">Healthy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {applicationStats.filter(app => app.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-500">Warning</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {applicationStats.filter(app => app.status === 'critical').length}
            </div>
            <div className="text-sm text-gray-500">Critical</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPerformance;