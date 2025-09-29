import React from 'react';

interface CriticalAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
  service: string;
  status: 'active' | 'acknowledged' | 'resolved';
  actionRequired: boolean;
}

interface CriticalAlertsPanelProps {
  alerts?: CriticalAlert[];
}

const defaultAlerts: CriticalAlert[] = [
  {
    id: 'alert-001',
    title: 'Payment Service Down',
    description: 'Payment gateway is completely unresponsive. All payment processing stopped.',
    severity: 'critical',
    timestamp: '2m ago',
    service: 'Payment Gateway',
    status: 'active',
    actionRequired: true
  },
  {
    id: 'alert-002',
    title: 'High Error Rate Detected',
    description: 'Auth service error rate exceeded 15% in the last 5 minutes.',
    severity: 'high',
    timestamp: '5m ago',
    service: 'Auth Service',
    status: 'acknowledged',
    actionRequired: true
  },
  {
    id: 'alert-003',
    title: 'Database Connection Pool Exhausted',
    description: 'Primary database connection pool is at 95% capacity.',
    severity: 'high',
    timestamp: '8m ago',
    service: 'Database',
    status: 'active',
    actionRequired: true
  },
  {
    id: 'alert-004',
    title: 'Memory Usage Warning',
    description: 'User service memory usage consistently above 90%.',
    severity: 'medium',
    timestamp: '12m ago',
    service: 'User Service',
    status: 'acknowledged',
    actionRequired: false
  }
];

const CriticalAlertsPanel: React.FC<CriticalAlertsPanelProps> = ({
  alerts = defaultAlerts
}) => {
  const getSeverityConfig = (severity: CriticalAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: '🚨',
          badgeColor: 'bg-red-500'
        };
      case 'high':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-500',
          text: 'text-orange-800',
          icon: '⚠️',
          badgeColor: 'bg-orange-500'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-500',
          text: 'text-yellow-800',
          icon: '⚡',
          badgeColor: 'bg-yellow-500'
        };
    }
  };

  const getStatusConfig = (status: CriticalAlert['status']) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'ACTIVE'
        };
      case 'acknowledged':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'ACK'
        };
      case 'resolved':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'RESOLVED'
        };
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged');
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && alert.status === 'active').length;

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-medium text-gray-900 leading-none mr-3">Critical Alerts</h3>
          {criticalCount > 0 && (
            <div className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full animate-pulse leading-none flex items-center">
              {criticalCount} CRITICAL
            </div>
          )}
          <div className="bg-green-800 text-white text-[10px] px-2 py-1 rounded-full leading-none flex items-center">
            {activeAlerts.length} active
          </div>
        </div>
        {activeAlerts.length > 0 && (
          <button className="px-2 py-1 border border-gray-300 cursor-pointer text-gray-600 text-xs rounded-md hover:bg-gray-50">
            Ack All
          </button>
        )}
      </div>

      {/* 알림 목록 */}
      <div className="space-y-2 mb-3 max-h-64 overflow-y-auto mt-3">
        {alerts.slice(0, 4).map((alert) => {
          const severityConfig = getSeverityConfig(alert.severity);
          const statusConfig = getStatusConfig(alert.status);

          return (
            <div
              key={alert.id}
              className={`p-1 rounded-lg border-l-4 ${severityConfig.border} ${severityConfig.bg}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{severityConfig.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  <span className="text-xs text-gray-500">{alert.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Service:</span>
                  <span className="text-xs font-medium text-gray-900">{alert.service}</span>
                  {alert.actionRequired && (
                    <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded">
                      Action Required
                    </span>
                  )}
                </div>

                {alert.status === 'active' && (
                  <div className="flex space-x-1">
                    <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                      ACK
                    </button>
                    <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 요약 통계 - 맨 하단 */}
      <div className="border-t border-gray-300 pt-3 mt-4">
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="text-sm font-bold text-red-600">
              {alerts.filter(a => a.severity === 'critical').length}
            </div>
            <div className="text-gray-500">Critical</div>
          </div>
          <div>
            <div className="text-sm font-bold text-orange-600">
              {alerts.filter(a => a.severity === 'high').length}
            </div>
            <div className="text-gray-500">High</div>
          </div>
          <div>
            <div className="text-sm font-bold text-yellow-600">
              {alerts.filter(a => a.severity === 'medium').length}
            </div>
            <div className="text-gray-500">Medium</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalAlertsPanel;