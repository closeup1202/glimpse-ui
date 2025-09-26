  import React, { useEffect, useMemo } from 'react';
  import useGlimpseWebSocket from '~/hooks/useGlimpseWebSocket';
  import type { LogEntry } from '~/types/glimpse';

  interface LogLevelStyle {
    text: string;
    bg: string;
    badge: string;
  }

  const LogViewer: React.FC = () => {
    const { logs, stats, connectionStatus, sendPing, clearLogs } = useGlimpseWebSocket(
      'http://localhost:9999/glimpse-ui/ws'
    );

    // 주기적으로 ping 전송 (연결 유지)
    useEffect(() => {
      const interval = setInterval(() => {
        sendPing();
      }, 30000); // 30초마다

      return () => clearInterval(interval);
    }, [sendPing]);

    const getLogLevelStyle = (level: LogEntry['logLevelString']): LogLevelStyle => {
      const styles: Record<LogEntry['logLevelString'], LogLevelStyle> = {
        ERROR: {
          text: 'text-red-600',
          bg: 'bg-red-50 border-red-100',
          badge: 'bg-red-100 text-red-800'
        },
        WARN: {
          text: 'text-yellow-600',
          bg: 'bg-yellow-50 border-yellow-100',
          badge: 'bg-yellow-100 text-yellow-800'
        },
        INFO: {
          text: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-100',
          badge: 'bg-blue-100 text-blue-800'
        },
        DEBUG: {
          text: 'text-gray-600',
          bg: 'bg-gray-50 border-gray-100',
          badge: 'bg-gray-100 text-gray-800'
        }
      };
      return styles[level] || styles.INFO;
    };

    const formatTimestamp = (timestamp: string): string => {
      return new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      });
    };

    const connectionStatusStyle = useMemo(() => {
      const styles = {
        Connected: 'bg-green-100 text-green-800',
        Connecting: 'bg-yellow-100 text-yellow-800',
        Disconnected: 'bg-red-100 text-red-800',
        Error: 'bg-red-100 text-red-800'
      };
      return styles[connectionStatus];
    }, [connectionStatus]);

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-medium text-gray-600">
              Glimpse
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={clearLogs}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50
  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear
              </button>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${connectionStatusStyle}`}>
                {connectionStatus}
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg p-5">
                <div className="text-gray-600 text-2xl font-bold">{logs.length}</div>
                <div className="text-gray-800 text-sm">TOTAL</div>
              </div>
              <div className="bg-red-50 rounded-lg p-5">
                <div className="text-red-600 text-2xl font-bold">{stats.errorCount}</div>
                <div className="text-red-800 text-sm">ERROR</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-5">
                <div className="text-yellow-600 text-2xl font-bold">{stats.warnCount}</div>
                <div className="text-yellow-800 text-sm">WARN</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-5">
                <div className="text-blue-600 text-2xl font-bold">{stats.infoCount}</div>
                <div className="text-blue-800 text-sm">INFO</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="text-gray-600 text-2xl font-bold">{stats.debugCount}</div>
                <div className="text-gray-800 text-sm">DEBUG</div>
              </div>
            </div>
          )}
        </div>

        {/* 로그 목록 */}
        <div className="bg-white shadow rounded-lg">
          <div className="max-h-[600px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-pulse">로그를 기다리는 중...</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {logs.map((log: LogEntry, index: number) => {
                  const levelStyle = getLogLevelStyle(log.logLevelString);
                  return (
                    <div
                      key={`${log.timestamp}-${index}`}
                      className={`p-4 hover:bg-gray-50 transition-colors ${levelStyle.bg}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1 flex-wrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelStyle.badge}`}>
                              {log.logLevelString}
                            </span>
                            <span className="text-sm text-gray-500 font-mono">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            <span className="text-sm text-gray-600 font-medium">
                              {log.applicationName}
                            </span>
                            {log.threadName && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {log.threadName}
                              </span>
                            )}
                          </div>
                          <pre className={`text-sm ${levelStyle.text} font-mono whitespace-pre-wrap break-words`}>
                            {log.message}
                          </pre>
                          {log.loggerName && (
                            <p className="text-xs text-gray-500 mt-1 font-mono">
                              📝 {log.loggerName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default LogViewer;