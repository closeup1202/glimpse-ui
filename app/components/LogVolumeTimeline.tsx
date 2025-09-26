import React from 'react';

interface TimelineData {
  time: string;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  debugCount: number;
}

interface LogVolumeTimelineProps {
  data?: TimelineData[];
}

const defaultData: TimelineData[] = [
  { time: '14:00', errorCount: 2, warnCount: 5, infoCount: 45, debugCount: 12 },
  { time: '14:15', errorCount: 8, warnCount: 12, infoCount: 52, debugCount: 8 },
  { time: '14:30', errorCount: 1, warnCount: 3, infoCount: 38, debugCount: 15 },
  { time: '14:45', errorCount: 5, warnCount: 8, infoCount: 41, debugCount: 10 },
  { time: '15:00', errorCount: 12, warnCount: 15, infoCount: 33, debugCount: 6 },
  { time: '15:15', errorCount: 3, warnCount: 6, infoCount: 47, debugCount: 11 },
  { time: '15:30', errorCount: 7, warnCount: 9, infoCount: 39, debugCount: 13 },
  { time: '15:45', errorCount: 2, warnCount: 4, infoCount: 44, debugCount: 9 }
];

const LogVolumeTimeline: React.FC<LogVolumeTimelineProps> = ({
  data = defaultData
}) => {
  const maxTotal = Math.max(...data.map(d => d.errorCount + d.warnCount + d.infoCount + d.debugCount));

  const getBarHeight = (count: number): string => {
    return `${(count / maxTotal) * 100}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h3 className="text-base font-medium text-gray-900 mb-3">Log Volume Timeline</h3>

      <div className="flex items-end justify-between flex-1 gap-1">
        {data.map((item, index) => {
          const total = item.errorCount + item.warnCount + item.infoCount + item.debugCount;

          return (
            <div key={index} className="flex flex-col items-center flex-1 h-full">
              {/* 스택 바 차트 */}
              <div className="relative w-full flex-1 flex flex-col justify-end bg-gray-100 rounded-t">
                {/* ERROR */}
                {item.errorCount > 0 && (
                  <div
                    className="bg-red-500 w-full"
                    style={{ height: getBarHeight(item.errorCount) }}
                    title={`ERROR: ${item.errorCount}`}
                  />
                )}

                {/* WARN */}
                {item.warnCount > 0 && (
                  <div
                    className="bg-yellow-500 w-full"
                    style={{ height: getBarHeight(item.warnCount) }}
                    title={`WARN: ${item.warnCount}`}
                  />
                )}

                {/* INFO */}
                {item.infoCount > 0 && (
                  <div
                    className="bg-green-500 w-full"
                    style={{ height: getBarHeight(item.infoCount) }}
                    title={`INFO: ${item.infoCount}`}
                  />
                )}

                {/* DEBUG */}
                {item.debugCount > 0 && (
                  <div
                    className="bg-gray-500 w-full"
                    style={{ height: getBarHeight(item.debugCount) }}
                    title={`DEBUG: ${item.debugCount}`}
                  />
                )}

                {/* 총 개수 표시 */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium">
                  {total}
                </div>
              </div>

              {/* 시간 라벨 */}
              <div className="text-xs text-gray-500 mt-1 font-mono">
                {item.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex justify-center items-center space-x-3 mt-3 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>ERROR</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>WARN</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>INFO</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span>DEBUG</span>
        </div>
      </div>
    </div>
  );
};

export default LogVolumeTimeline;