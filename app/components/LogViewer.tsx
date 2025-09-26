  import React, { useEffect, useMemo, useState } from 'react';
  import useGlimpseWebSocket from '~/hooks/useGlimpseWebSocket';
  import type { LogEntry } from '~/types/glimpse';
  import ErrorRateTrend from './ErrorRateTrend';
  import LogBasedServiceStatus from './LogBasedServiceStatus';
  import CriticalAlertsPanel from './CriticalAlertsPanel';
  import QuickActions from './QuickActions';
  import TopErrorMessages from './TopErrorMessages';
  import ApplicationPerformance from './ApplicationPerformance';
  import LogPatternAnalysis from './LogPatternAnalysis';

  interface LogLevelStyle {
    text: string;
    bg: string;
    badge: string;
  }

  const LogViewer: React.FC = () => {
    const { logs, stats, connectionStatus, sendPing, clearLogs } = useGlimpseWebSocket(
      'http://localhost:9999/glimpse-ui/ws'
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLogLevel, setSelectedLogLevel] = useState<string>('all');
    const [timeRange, setTimeRange] = useState('24h');

    const getLogLevelWidths = useMemo(() => {
      if (!stats) return { ERROR: 1, WARN: 1, INFO: 1, DEBUG: 1 };

      const total = stats.errorCount + stats.warnCount + stats.infoCount + stats.debugCount;
      const minWidth = 0.5; // 최소 너비 (0일 때도 보이도록)

      if (total === 0) {
        return { ERROR: 1, WARN: 1, INFO: 1, DEBUG: 1 };
      }

      return {
        ERROR: Math.max(minWidth, stats.errorCount / total * 4) || minWidth,
        WARN: Math.max(minWidth, stats.warnCount / total * 4) || minWidth,
        INFO: Math.max(minWidth, stats.infoCount / total * 4) || minWidth,
        DEBUG: Math.max(minWidth, stats.debugCount / total * 4) || minWidth
      };
    }, [stats]);

    useEffect(() => {
      const interval = setInterval(() => {
        sendPing();
      }, 30000); // 30초마다

      return () => clearInterval(interval);
    }, [sendPing]);

    const formatTimestamp = (timestamp: string): string => {
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('sv-SE'); // YYYY-MM-DD 형식
      const timeStr = date.toLocaleTimeString('ko-KR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      });
      return `${dateStr} ${timeStr}`;
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
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4 flex-1">
              {/* Search Bar - Main Focus */}
              <div className="relative flex-1 max-w-2xl">
                <input
                  type="text"
                  placeholder="Search logs, applications, messages..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Date Picker */}
              <div className="relative">
                <input
                  type="date"
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Time Range Selector */}
              <select
                className="pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="1h">Last 1 hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>

            {/* Connection Status - Right End */}
            <div className="flex items-center">
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${connectionStatusStyle}`}>
                {connectionStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Log Level Metrics Bar */}
        {stats && (
          <div className="bg-white border-b border-gray-200 py-1">
            <div className="flex items-center space-x-1">
              <div
                className={`bg-red-500 text-white text-center py-3 cursor-pointer hover:bg-red-700 transition-colors ${selectedLogLevel === 'ERROR' ? 'ring-2 ring-blue-300' : ''}`}
                style={{ flex: getLogLevelWidths.ERROR }}
                onClick={() => setSelectedLogLevel(selectedLogLevel === 'ERROR' ? 'all' : 'ERROR')}
              >
                <div className="text-2xl font-bold">{stats.errorCount}</div>
                <div className="text-sm">ERROR</div>
              </div>

              <div
                className={`bg-yellow-400 text-white text-center py-3 cursor-pointer hover:bg-yellow-500 transition-colors ${selectedLogLevel === 'WARN' ? 'ring-2 ring-blue-300' : ''}`}
                style={{ flex: getLogLevelWidths.WARN }}
                onClick={() => setSelectedLogLevel(selectedLogLevel === 'WARN' ? 'all' : 'WARN')}
              >
                <div className="text-2xl font-bold">{stats.warnCount}</div>
                <div className="text-sm">WARN</div>
              </div>

              <div
                className={`bg-green-600 text-white text-center py-3 cursor-pointer hover:bg-green-700 transition-colors ${selectedLogLevel === 'INFO' ? 'ring-2 ring-blue-300' : ''}`}
                style={{ flex: getLogLevelWidths.INFO }}
                onClick={() => setSelectedLogLevel(selectedLogLevel === 'INFO' ? 'all' : 'INFO')}
              >
                <div className="text-2xl font-bold">{stats.infoCount}</div>
                <div className="text-sm">INFO</div>
              </div>

              <div
                className={`bg-gray-500 text-white text-center py-3 cursor-pointer hover:bg-gray-600 transition-colors ${selectedLogLevel === 'DEBUG' ? 'ring-2 ring-blue-300' : ''}`}
                style={{ flex: getLogLevelWidths.DEBUG }}
                onClick={() => setSelectedLogLevel(selectedLogLevel === 'DEBUG' ? 'all' : 'DEBUG')}
              >
                <div className="text-2xl font-bold">{stats.debugCount}</div>
                <div className="text-sm">DEBUG</div>
              </div>

              <div
                className={`bg-white text-gray text-center py-3 cursor-pointer hover:bg-gray-300 transition-colors`}
                style={{ width: 'calc(20% - 100px)', minWidth: '100px' }}
                onClick={() => setSelectedLogLevel('all')}
              >
                <div className="text-2xl font-bold">{logs.length}</div>
                <div className="text-sm">TOTAL</div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Panels */}
        <div className="p-4">
          {/* Top Row - Operational Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <ErrorRateTrend logs={logs} />
            <LogBasedServiceStatus logs={logs} />
            <CriticalAlertsPanel />
            <QuickActions onClearLogs={clearLogs} />
          </div>

          {/* Second Row - Deep Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <TopErrorMessages logs={logs} />
            <ApplicationPerformance logs={logs} />
            <LogPatternAnalysis logs={logs} />
          </div>

          {/* Logs Stream Panel */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-medium text-gray-900">Stream</h3>
            </div>

            <div className="bg-white text-green-400 font-mono text-sm">
              <div className="p-4 h-96 overflow-y-auto overflow-x-auto">
                {logs.length === 0 ? (
                  <div className="text-green-400 animate-pulse">
                    <span className="opacity-75">$</span> Waiting for logs...
                  </div>
                ) : (
                  <div className="space-y-1 min-w-max">
                    {logs
                      .filter(log =>
                        selectedLogLevel === 'all' || log.logLevelString === selectedLogLevel
                      )
                      .filter(log =>
                        searchQuery === '' ||
                        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.applicationName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(-100)
                      .map((log: LogEntry, index: number) => {
                        const levelColors = {
                          ERROR: 'text-red-500',
                          WARN: 'text-yellow-500',
                          INFO: 'text-green-500',
                          DEBUG: 'text-gray-500'
                        };

                        return (
                          <div key={`${log.timestamp}-${index}`} className="leading-relaxed text-gray-500 text-left">
                            <div className="flex gap-1 min-w-fit">
                              <div className="font-bold text-gray-500 flex-grow-0 flex-shrink-0" style={{ flexBasis: '9%' }}>
                                {formatTimestamp(log.timestamp)}
                              </div>
                              <div className={`font-bold flex-grow-0 flex-shrink-0 ${levelColors[log.logLevelString] || 'text-white'}`} style={{ flexBasis: '3%' }}>
                                {log.logLevelString}
                              </div>
                              <div className="flex-grow-0 flex-shrink-0 truncate" style={{ flexBasis: '8.11%' }}>
                                {log.applicationName}
                              </div>
                              <div className="flex-grow-0 flex-shrink-0 truncate text-xs" style={{ flexBasis: '8.11%' }}>
                                {log.threadName ? `(${log.threadName})` : ''}
                              </div>
                              <div className="flex-grow-0 flex-shrink-0 text-gray-400 text-xs truncate" style={{ flexBasis: '11.11%' }}>
                                {log.loggerName || ''}
                              </div>
                              <div className="flex-grow-0 flex-shrink-0 break-words" style={{ flexBasis: '48.44%' }}>
                                {log.message}
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
        </div>
      </div>
    );
  };

  export default LogViewer;