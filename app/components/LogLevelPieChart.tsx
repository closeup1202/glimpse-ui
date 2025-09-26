import React from 'react';

interface LogStats {
  errorCount: number;
  warnCount: number;
  infoCount: number;
  debugCount: number;
}

interface LogLevelPieChartProps {
  stats?: LogStats;
}

const LogLevelPieChart: React.FC<LogLevelPieChartProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-base font-medium text-gray-900 mb-3">Log Distribution</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400 text-sm">No data available</div>
        </div>
      </div>
    );
  }

  const total = stats.errorCount + stats.warnCount + stats.infoCount + stats.debugCount;

  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-base font-medium text-gray-900 mb-3">Log Distribution</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400 text-sm">No logs</div>
        </div>
      </div>
    );
  }

  // 각 레벨의 비율 계산
  const errorPercent = (stats.errorCount / total) * 100;
  const warnPercent = (stats.warnCount / total) * 100;
  const infoPercent = (stats.infoCount / total) * 100;
  const debugPercent = (stats.debugCount / total) * 100;

  // SVG 원형차트용 각도 계산
  const errorAngle = (stats.errorCount / total) * 360;
  const warnAngle = (stats.warnCount / total) * 360;
  const infoAngle = (stats.infoCount / total) * 360;
  const debugAngle = (stats.debugCount / total) * 360;

  // SVG 경로 생성 함수
  const createPath = (startAngle: number, endAngle: number, radius: number = 60) => {
    const centerX = 50;
    const centerY = 50;

    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  let currentAngle = 0;
  const segments = [];

  // ERROR 세그먼트
  if (stats.errorCount > 0) {
    segments.push({
      path: createPath(currentAngle, currentAngle + errorAngle),
      color: "#ef4444",
      label: "ERROR",
      count: stats.errorCount,
      percent: errorPercent
    });
    currentAngle += errorAngle;
  }

  // WARN 세그먼트
  if (stats.warnCount > 0) {
    segments.push({
      path: createPath(currentAngle, currentAngle + warnAngle),
      color: "#eab308",
      label: "WARN",
      count: stats.warnCount,
      percent: warnPercent
    });
    currentAngle += warnAngle;
  }

  // INFO 세그먼트
  if (stats.infoCount > 0) {
    segments.push({
      path: createPath(currentAngle, currentAngle + infoAngle),
      color: "#22c55e",
      label: "INFO",
      count: stats.infoCount,
      percent: infoPercent
    });
    currentAngle += infoAngle;
  }

  // DEBUG 세그먼트
  if (stats.debugCount > 0) {
    segments.push({
      path: createPath(currentAngle, currentAngle + debugAngle),
      color: "#6b7280",
      label: "DEBUG",
      count: stats.debugCount,
      percent: debugPercent
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-base font-medium text-gray-900 mb-3">Log Distribution</h3>

      <div className="flex flex-col items-center">
        {/* SVG 원형차트 */}
        <div className="relative mb-3">
          <svg width="140" height="140" viewBox="0 0 100 100" className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth="1"
                className="hover:opacity-80 transition-opacity"
                title={`${segment.label}: ${segment.count} (${segment.percent.toFixed(1)}%)`}
              />
            ))}
          </svg>

          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap justify-center gap-3 text-xs w-full">
          {/* ERROR */}
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
            <span className="font-medium text-gray-900">ERROR</span>
            <span className="text-gray-500">{stats.errorCount} ({errorPercent.toFixed(1)}%)</span>
          </div>

          {/* WARN */}
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
            <span className="font-medium text-gray-900">WARN</span>
            <span className="text-gray-500">{stats.warnCount} ({warnPercent.toFixed(1)}%)</span>
          </div>

          {/* INFO */}
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
            <span className="font-medium text-gray-900">INFO</span>
            <span className="text-gray-500">{stats.infoCount} ({infoPercent.toFixed(1)}%)</span>
          </div>

          {/* DEBUG */}
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-gray-500 flex-shrink-0"></div>
            <span className="font-medium text-gray-900">DEBUG</span>
            <span className="text-gray-500">{stats.debugCount} ({debugPercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogLevelPieChart;