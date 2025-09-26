import React from 'react';

interface HealthMetric {
  label: string;
  percentage: number;
  color: 'green' | 'yellow' | 'blue' | 'red';
}

interface SystemHealthProps {
  metrics?: HealthMetric[];
}

const defaultMetrics: HealthMetric[] = [
  { label: 'CPU Usage', percentage: 65, color: 'yellow' },
  { label: 'Memory', percentage: 45, color: 'green' },
  { label: 'Disk I/O', percentage: 30, color: 'blue' }
];

const SystemHealth: React.FC<SystemHealthProps> = ({
  metrics = defaultMetrics
}) => {
  const getColorClass = (color: HealthMetric['color']): string => {
    const colors = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      red: 'bg-red-500'
    };
    return colors[color];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{metric.label}</span>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className={`h-2 rounded-full ${getColorClass(metric.color)}`}
                  style={{ width: `${metric.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{metric.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;