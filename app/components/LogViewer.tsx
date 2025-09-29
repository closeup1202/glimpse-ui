  import React, { useEffect, useMemo, useState } from 'react';
  import { useNavigate } from 'react-router';
  import useGlimpseWebSocket from '~/hooks/useGlimpseWebSocket';
  import type { LogEntry } from '~/types/glimpse';
  import ErrorRateTrend from './ErrorRateTrend';
  import LogBasedServiceStatus from './LogBasedServiceStatus';
  import CriticalAlertsPanel from './CriticalAlertsPanel';
  import TopErrorMessages from './TopErrorMessages';
  import ApplicationPerformance from './ApplicationPerformance';
  import LogPatternAnalysis from './LogPatternAnalysis';

  const LogViewer: React.FC = () => {
    const navigate = useNavigate();
    const { logs, stats, connectionStatus, sendPing, clearLogs, reconnect } = useGlimpseWebSocket(
      'http://localhost:9999/glimpse-ui/ws'
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLogLevel, setSelectedLogLevel] = useState<string>('all');
    const [timeRange, setTimeRange] = useState('24h');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
      navigate('/');
    };

    const getLogLevelWidths = useMemo(() => {
      if (!stats) {
        return { ERROR: 1, WARN: 1, INFO: 1, DEBUG: 1 }
      };

      const minWidth = 0.5; // 최소 너비 (0일 때도 보이도록)

      return {
        ERROR: Math.max(minWidth, stats.errorCount / stats.totalLogs * 4) || minWidth,
        WARN: Math.max(minWidth, stats.warnCount / stats.totalLogs * 4) || minWidth,
        INFO: Math.max(minWidth, stats.infoCount / stats.totalLogs * 4) || minWidth,
        DEBUG: Math.max(minWidth, stats.debugCount / stats.totalLogs * 4) || minWidth
      };
    }, [stats]);

    useEffect(() => {
      const interval = setInterval(() => {
        sendPing();
      }, 30000);

      return () => clearInterval(interval);
    }, [sendPing]);

    const formatTimestamp = (timestamp: string): string => {
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('sv-SE');
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
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Glimpse</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Logs
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Alerts
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
              </nav>

              {/* Sidebar Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Connection Status</div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${connectionStatusStyle}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    connectionStatus === 'Connected' ? 'bg-green-500' :
                    connectionStatus === 'Connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  {connectionStatus}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full mt-4 px-3 py-2 text-sm font-medium  hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ease-in-out overflow-x-hidden ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}>
          {/* Header Section */}
        <div className="bg-white border border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 flex-1">
              {/* Hamburger Menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Search Bar - Main Focus */}
              <div className="relative flex-1 max-w-lg ml-2">
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Time Range Selector */}
              <select
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-200 bg-white appearance-none flex-shrink-0"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '12px'
                }}
              >
                <option value="1h">1h</option>
                <option value="6h">6h</option>
                <option value="24h">24h</option>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
              </select>
            </div>

            {/* Actions and Connection Status - Right End */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Actions */}
              <button
                onClick={() => console.log('Exporting logs...')}
                className="px-2 py-1 text-gray-500 text-sm cursor-pointer hover:text-gray-700 transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => console.log('Generating report...')}
                className="px-2 py-1 text-gray-500 text-sm cursor-pointer hover:text-gray-700 transition-colors"
              >
                Generate Report
              </button>
              <button
                onClick={reconnect}
                className="p-2 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                title="Reconnect"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Connection Status */}
              <div className={`px-3 py-2 rounded-lg text-xs font-medium ${connectionStatusStyle}`}>
                {connectionStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Log Level Metrics Bar */}
        {stats && (
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center space-x-1">
              <div
                className={`bg-red-500 text-white text-center py-1.5 cursor-pointer hover:bg-red-700 transition-colors ${selectedLogLevel === 'ERROR' ? 'ring-2 ring-blue-300' : ''}`}
                style={{ flex: getLogLevelWidths.ERROR }}
                onClick={() => setSelectedLogLevel(selectedLogLevel === 'ERROR' ? 'all' : 'ERROR')}
              >
                <div className="text-xl font-bold">{stats.errorCount}</div>
                <div className="text-[10px]">ERROR</div>
              </div>

              <div
                className={`bg-yellow-400 text-white text-center py-1.5 cursor-pointer hover:bg-yellow-500 transition-colors ${selectedLogLevel === 'WARN' ? 'ring-2 ring-blue-300' : ''}`}
                style={{ flex: getLogLevelWidths.WARN }}
                onClick={() => setSelectedLogLevel(selectedLogLevel === 'WARN' ? 'all' : 'WARN')}
              >
                <div className="text-xl font-bold">{stats.warnCount}</div>
                <div className="text-[10px]">WARN</div>
              </div>

              <div
                className={`bg-green-600 text-white text-center py-1.5 cursor-pointer hover:bg-green-700 transition-colors ${selectedLogLevel === 'INFO' ? 'ring-2 ring-blue-300' : ''}`}
                style={{ flex: getLogLevelWidths.INFO }}
                onClick={() => setSelectedLogLevel(selectedLogLevel === 'INFO' ? 'all' : 'INFO')}
              >
                <div className="text-xl font-bold">{stats.infoCount}</div>
                <div className="text-[10px]">INFO</div>
              </div>

              <div
                className={`bg-gray-500 text-white text-center py-1.5 cursor-pointer hover:bg-gray-600 transition-colors ${selectedLogLevel === 'DEBUG' ? 'ring-2 ring-blue-300' : ''}`}
                style={{ flex: getLogLevelWidths.DEBUG }}
                onClick={() => setSelectedLogLevel(selectedLogLevel === 'DEBUG' ? 'all' : 'DEBUG')}
              >
                <div className="text-xl font-bold">{stats.debugCount}</div>
                <div className="text-[10px]">DEBUG</div>
              </div>

              <div
                className={`bg-white text-gray text-center py-1.5 cursor-pointer hover:bg-gray-300 transition-colors`}
                style={{ width: 'calc(20% - 100px)', minWidth: '100px' }}
                onClick={() => setSelectedLogLevel('all')}
              >
                <div className="text-xl font-bold">{stats.totalLogs}</div>
                <div className="text-[10px]">TOTAL</div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Panels */}
        <div className="p-4">
          {/* Top Row - Operational Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <ErrorRateTrend logs={logs} />
            <LogBasedServiceStatus logs={logs} />
            <CriticalAlertsPanel />
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
              <div className="p-4 h-96 overflow-y-auto overflow-x-hidden">
                {logs.length === 0 ? (
                  <div className="text-green-700 animate-pulse font-bold">
                    <span className="opacity-75">$</span> Waiting for logs...
                  </div>
                ) : (
                  <div className="space-y-1">
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
                            <div className="flex gap-1 items-center min-w-0">
                              <div className="text-xs text-gray-500 flex-shrink-0 w-40 truncate">
                                {formatTimestamp(log.timestamp)}
                              </div>
                              <div className={`font-bold flex-shrink-0 w-12 truncate ${levelColors[log.logLevelString] || 'text-white'}`}>
                                {log.logLevelString}
                              </div>
                              <div className="flex-shrink-0 w-40 truncate text-sm">
                                {log.applicationName}
                              </div>
                              <div className="flex-shrink-0 w-30 truncate text-xs text-gray-500">
                                {log.threadName ? `(${log.threadName})` : ''}
                              </div>
                              <div className="flex-shrink-0 w-40 truncate text-xs text-gray-400">
                                {log.loggerName || ''}
                              </div>
                              <div className="flex-1 min-w-0 break-words text-sm text-gray-700">
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
      </div>
    );
  };

  export default LogViewer;