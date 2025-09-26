import React, { useMemo } from 'react';
import type { LogEntry } from '~/types/glimpse';

interface ErrorMessage {
  message: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface TopErrorMessagesProps {
  logs: LogEntry[];
  timeWindowMinutes?: number;
}


const TopErrorMessages: React.FC<TopErrorMessagesProps> = ({
  logs,
  timeWindowMinutes = 60
}) => {
  const errors = useMemo(() => {
    if (!logs.length) return [];

    const now = new Date();
    const timeWindow = timeWindowMinutes * 60 * 1000;
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return (now.getTime() - logTime.getTime()) <= timeWindow;
    });

    // Get only error logs
    const errorLogs = recentLogs.filter(log => log.logLevelString === 'ERROR');

    if (errorLogs.length === 0) return [];

    // Count error messages
    const errorCounts = errorLogs.reduce((acc, log) => {
      const message = log.message.length > 80 ? log.message.substring(0, 80) + '...' : log.message;
      acc[message] = (acc[message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by count
    const sortedErrors = Object.entries(errorCounts)
      .map(([message, count]): ErrorMessage => {
        const percentage = (count / errorLogs.length) * 100;

        // Simulate trend (in real app, compare with previous time window)
        const trend: ErrorMessage['trend'] =
          percentage > 20 ? 'up' :
          percentage < 5 ? 'down' : 'stable';

        return {
          message,
          count,
          trend,
          percentage
        };
      })
      .sort((a, b) => b.count - a.count);

    return sortedErrors;
  }, [logs, timeWindowMinutes]);
  const getTrendIcon = (trend: ErrorMessage['trend']) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getTrendColor = (trend: ErrorMessage['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-base font-medium text-gray-900 mb-3">Top Error Messages</h3>

      <div className="space-y-2">
        {errors.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <div className="text-sm">No error messages found in recent logs</div>
          </div>
        ) : (
          errors.slice(0, 4).map((error, index) => (
          <div key={index} className="border-l-4 border-red-400 pl-3 py-2 bg-red-50 rounded-r">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-gray-900 truncate">
                    {error.message}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <span className="font-medium text-red-600">
                    {error.count} occurrences
                  </span>

                  <span className="text-gray-500">
                    {error.percentage}% of total errors
                  </span>

                  <div className="flex items-center space-x-1">
                    {getTrendIcon(error.trend)}
                    <span className={`text-xs font-medium ${getTrendColor(error.trend)}`}>
                      {error.trend === 'up' && '+12%'}
                      {error.trend === 'down' && '-8%'}
                      {error.trend === 'stable' && '0%'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    #{index + 1}
                  </div>
                </div>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${error.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Error Patterns →
        </button>
      </div>
    </div>
  );
};

export default TopErrorMessages;