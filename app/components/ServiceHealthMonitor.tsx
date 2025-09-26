import React from 'react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastError?: string;
  lastErrorTime?: string;
  endpoint: string;
}

interface ServiceHealthMonitorProps {
  services?: ServiceStatus[];
}

const defaultServices: ServiceStatus[] = [
  {
    name: 'User API',
    status: 'healthy',
    responseTime: 85,
    uptime: 99.9,
    endpoint: '/api/users',
  },
  {
    name: 'Payment Gateway',
    status: 'degraded',
    responseTime: 1250,
    uptime: 98.2,
    endpoint: '/api/payments',
    lastError: 'Connection timeout',
    lastErrorTime: '2m ago'
  },
  {
    name: 'Auth Service',
    status: 'down',
    responseTime: 0,
    uptime: 95.1,
    endpoint: '/api/auth',
    lastError: 'Service unavailable',
    lastErrorTime: '5m ago'
  },
  {
    name: 'Notification',
    status: 'healthy',
    responseTime: 120,
    uptime: 99.8,
    endpoint: '/api/notifications',
  },
  {
    name: 'File Storage',
    status: 'healthy',
    responseTime: 95,
    uptime: 99.7,
    endpoint: '/api/files',
  }
];

const ServiceHealthMonitor: React.FC<ServiceHealthMonitorProps> = ({
  services = defaultServices
}) => {
  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          dot: 'bg-green-500',
          border: 'border-green-200'
        };
      case 'degraded':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          dot: 'bg-yellow-500',
          border: 'border-yellow-200'
        };
      case 'down':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          dot: 'bg-red-500',
          border: 'border-red-200'
        };
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime === 0) return 'text-red-600';
    if (responseTime > 1000) return 'text-red-600';
    if (responseTime > 500) return 'text-yellow-600';
    return 'text-green-600';
  };

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const downCount = services.filter(s => s.status === 'down').length;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-gray-900">Service Health</h3>
        <div className="text-sm text-gray-600">
          {healthyCount}H / {degradedCount}D / {downCount}D
        </div>
      </div>

      {/* 서비스 목록 */}
      <div className="space-y-2 mb-3">
        {services.map((service, index) => {
          const statusColor = getStatusColor(service.status);

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border ${statusColor.border} ${statusColor.bg}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${statusColor.dot}`}></div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{service.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{service.endpoint}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold ${getResponseTimeColor(service.responseTime)}`}>
                    {service.responseTime === 0 ? 'DOWN' : `${service.responseTime}ms`}
                  </div>
                  <div className="text-xs text-gray-600">
                    {service.uptime}% uptime
                  </div>
                </div>
              </div>

              {/* 에러 정보 */}
              {service.lastError && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  <span className="font-medium">Last Error:</span> {service.lastError}
                  <span className="ml-2 text-red-500">({service.lastErrorTime})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 전체 상태 요약 */}
      <div className="border-t pt-3">
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="text-lg font-bold text-green-600">{healthyCount}</div>
            <div className="text-gray-500">Healthy</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">{degradedCount}</div>
            <div className="text-gray-500">Degraded</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{downCount}</div>
            <div className="text-gray-500">Down</div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      {(degradedCount > 0 || downCount > 0) && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-center space-x-2">
            <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
              Restart Services
            </button>
            <button className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors">
              View Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHealthMonitor;