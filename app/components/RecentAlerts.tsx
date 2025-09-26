import React from 'react';

export interface Alert {
  id: string;
  message: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'success' | 'info';
}

interface RecentAlertsProps {
  alerts?: Alert[];
}

const defaultAlerts: Alert[] = [
  {
    id: '1',
    message: 'Database connection timeout',
    timestamp: '2 minutes ago',
    severity: 'error'
  },
  {
    id: '2',
    message: 'High memory usage detected',
    timestamp: '5 minutes ago',
    severity: 'warning'
  },
  {
    id: '3',
    message: 'Service recovery completed',
    timestamp: '10 minutes ago',
    severity: 'success'
  }
];

const RecentAlerts: React.FC<RecentAlertsProps> = ({
  alerts = defaultAlerts
}) => {
  const getSeverityColor = (severity: Alert['severity']): string => {
    const colors = {
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      success: 'bg-green-500',
      info: 'bg-blue-500'
    };
    return colors[severity];
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-base font-medium text-gray-900 mb-3">Recent Alerts</h3>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center space-x-3">
            <div className={`w-3 h-3 ${getSeverityColor(alert.severity)} rounded-full`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900 truncate">{alert.message}</p>
              <p className="text-xs text-gray-500">{alert.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;