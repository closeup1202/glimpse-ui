import React, { useMemo } from 'react';
import type { LogEntry } from '~/types/glimpse';

interface LogPattern {
  pattern: string;
  regex: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
  examples: string[];
  category: 'authentication' | 'database' | 'network' | 'system' | 'business';
}

interface LogPatternAnalysisProps {
  logs: LogEntry[];
  timeWindowMinutes?: number;
}

const PATTERN_DEFINITIONS = [
  {
    pattern: 'Database Connection Failures',
    regex: /connection.*timeout|connection.*failed|database.*unavailable/i,
    severity: 'high' as const,
    category: 'database' as const
  },
  {
    pattern: 'Authentication Errors',
    regex: /auth.*failed|invalid.*token|unauthorized|login.*failed/i,
    severity: 'high' as const,
    category: 'authentication' as const
  },
  {
    pattern: 'API Rate Limiting',
    regex: /rate.*limit|too.*many.*requests|quota.*exceeded/i,
    severity: 'medium' as const,
    category: 'network' as const
  },
  {
    pattern: 'Memory Issues',
    regex: /out.*of.*memory|memory.*allocation|heap.*space/i,
    severity: 'high' as const,
    category: 'system' as const
  },
  {
    pattern: 'Validation Errors',
    regex: /validation.*failed|invalid.*input|parse.*error/i,
    severity: 'low' as const,
    category: 'business' as const
  },
  {
    pattern: 'Timeout Errors',
    regex: /timeout|timed.*out|connection.*refused/i,
    severity: 'medium' as const,
    category: 'network' as const
  }
];

const LogPatternAnalysis: React.FC<LogPatternAnalysisProps> = ({
  logs,
  timeWindowMinutes = 60
}) => {
  const patterns = useMemo(() => {
    if (!logs.length) return [];

    const now = new Date();
    const timeWindow = timeWindowMinutes * 60 * 1000;
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return (now.getTime() - logTime.getTime()) <= timeWindow;
    });

    // Analyze patterns
    const patternResults: LogPattern[] = [];

    PATTERN_DEFINITIONS.forEach(definition => {
      const matchingLogs = recentLogs.filter(log =>
        definition.regex.test(log.message)
      );

      if (matchingLogs.length > 0) {
        const examples = matchingLogs
          .slice(0, 3)
          .map(log => log.message.length > 60 ? log.message.substring(0, 60) + '...' : log.message);

        patternResults.push({
          pattern: definition.pattern,
          regex: definition.regex.toString(),
          count: matchingLogs.length,
          severity: definition.severity,
          category: definition.category,
          examples
        });
      }
    });

    return patternResults.sort((a, b) => b.count - a.count);
  }, [logs, timeWindowMinutes]);
  const getSeverityColor = (severity: LogPattern['severity']) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          dot: 'bg-red-500'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          dot: 'bg-yellow-500'
        };
      case 'low':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          dot: 'bg-green-500'
        };
    }
  };

  const getCategoryIcon = (category: LogPattern['category']) => {
    switch (category) {
      case 'authentication':
        return '🔐';
      case 'database':
        return '💾';
      case 'network':
        return '🌐';
      case 'system':
        return '⚙️';
      case 'business':
        return '💼';
    }
  };

  const sortedPatterns = [...patterns].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-base font-medium text-gray-900 mb-3">Log Pattern Analysis</h3>

      <div className="space-y-2">
        {patterns.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <div className="text-sm">No patterns detected in recent logs</div>
          </div>
        ) : (
          patterns.slice(0, 3).map((pattern, index) => {
          const severityColor = getSeverityColor(pattern.severity);

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 ${severityColor.border} ${severityColor.bg}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {getCategoryIcon(pattern.category)}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{pattern.pattern}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityColor.bg} ${severityColor.text}`}>
                        {pattern.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {pattern.count}
                  </div>
                  <div className="text-xs text-gray-500">matches</div>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Frequency</span>
                  <span>{((pattern.count / Math.max(...patterns.map(p => p.count))) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${severityColor.dot.replace('bg-', 'bg-').replace('-500', '-400')}`}
                    style={{
                      width: `${(pattern.count / Math.max(...patterns.map(p => p.count))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* 요약 통계 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {patterns.length}
            </div>
            <div className="text-sm text-gray-500">Patterns</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {patterns.filter(p => p.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-500">High Severity</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {patterns.filter(p => p.severity === 'medium').length}
            </div>
            <div className="text-sm text-gray-500">Medium</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {patterns.filter(p => p.severity === 'low').length}
            </div>
            <div className="text-sm text-gray-500">Low</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {patterns.reduce((sum, p) => sum + p.count, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Matches</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogPatternAnalysis;