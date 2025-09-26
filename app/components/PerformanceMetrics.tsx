import React from 'react';

interface MetricItem {
  label: string;
  value: string;
  color: 'green' | 'blue' | 'red';
}

interface PerformanceMetricsProps {
  metrics?: MetricItem[];
}

const defaultMetrics: MetricItem[] = [
  { label: 'Response Time', value: '245ms', color: 'green' },
  { label: 'Throughput', value: '1.2k/min', color: 'blue' },
  { label: 'Error Rate', value: '2.1%', color: 'red' }
];

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics = defaultMetrics
}) => {
  const getColorClass = (color: MetricItem['color']): string => {
    const colors = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      red: 'text-red-600'
    };
    return colors[color];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm text-gray-600">{metric.label}</span>
            <span className={`text-sm font-medium ${getColorClass(metric.color)}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceMetrics;