  export interface LogEntry {
    timestamp: string;
    logLevelString: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
    message: string;
    applicationName: string;
    loggerName?: string;
    threadName?: string;
  }

  export interface LogStats {
    totalLogs: number;
    errorCount: number;
    warnCount: number;
    infoCount: number;
    debugCount: number;
    recentLogsCount: number;
    lastUpdated: string;
  }

  export interface WebSocketMessage<T = any> {
    type: 'connected' | 'initial_logs' | 'real_time_logs' | 'log_stats' | 'error';
    message: string;
    data: T;
    timestamp: string;
  }

  export type ConnectionStatus = 'Connecting' | 'Connected' | 'Disconnected' | 'Error';
