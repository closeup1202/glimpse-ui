import React, { useState } from 'react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  action: () => void;
  dangerous?: boolean;
  requiresConfirmation?: boolean;
}

interface QuickActionsProps {
  onClearLogs?: () => void;
  onExportLogs?: () => void;
  onRestartServices?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onClearLogs,
  onExportLogs,
  onRestartServices
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);

  const executeAction = (action: QuickAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setIsModalOpen(true);
    } else {
      action.action();
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      pendingAction.action();
      setPendingAction(null);
      setIsModalOpen(false);
    }
  };

  const actions: QuickAction[] = [
    {
      id: 'export-logs',
      title: 'Export Logs',
      description: 'Download current logs as CSV/JSON',
      icon: '📥',
      color: 'blue',
      action: () => {
        onExportLogs?.();
        // 실제 구현에서는 로그 내보내기 로직
        console.log('Exporting logs...');
      }
    },
    {
      id: 'clear-filters',
      title: 'Clear Filters',
      description: 'Reset all search and level filters',
      icon: '🔄',
      color: 'gray',
      action: () => {
        // 실제 구현에서는 필터 초기화 로직
        console.log('Clearing filters...');
      }
    },
    {
      id: 'restart-failed',
      title: 'Restart Failed Services',
      description: 'Restart all services marked as down',
      icon: '🔄',
      color: 'yellow',
      action: () => {
        onRestartServices?.();
        console.log('Restarting failed services...');
      },
      requiresConfirmation: true
    },
    {
      id: 'emergency-mode',
      title: 'Emergency Mode',
      description: 'Enable emergency logging mode',
      icon: '🚨',
      color: 'red',
      action: () => {
        console.log('Enabling emergency mode...');
      },
      dangerous: true,
      requiresConfirmation: true
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create incident summary report',
      icon: '📊',
      color: 'purple',
      action: () => {
        console.log('Generating report...');
      }
    },
    {
      id: 'clear-logs',
      title: 'Clear Logs',
      description: 'Clear all current log entries',
      icon: '🗑️',
      color: 'red',
      action: () => {
        onClearLogs?.();
        console.log('Clearing logs...');
      },
      dangerous: true,
      requiresConfirmation: true
    }
  ];

  const getColorClasses = (color: QuickAction['color'], dangerous?: boolean) => {
    const baseClasses = 'hover:scale-105 transition-all duration-200';

    if (dangerous) {
      return `${baseClasses} bg-red-50 border-red-200 hover:bg-red-100 text-red-700`;
    }

    switch (color) {
      case 'blue':
        return `${baseClasses} bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700`;
      case 'green':
        return `${baseClasses} bg-green-50 border-green-200 hover:bg-green-100 text-green-700`;
      case 'red':
        return `${baseClasses} bg-red-50 border-red-200 hover:bg-red-100 text-red-700`;
      case 'yellow':
        return `${baseClasses} bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700`;
      case 'purple':
        return `${baseClasses} bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700`;
      case 'gray':
        return `${baseClasses} bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700`;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-base font-medium text-gray-900 mb-3">Quick Actions</h3>

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => executeAction(action)}
              className={`p-3 rounded-lg border-2 text-left ${getColorClasses(action.color, action.dangerous)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-75 mt-1">{action.description}</div>
                  {action.dangerous && (
                    <div className="text-xs text-red-600 font-medium mt-1">
                      ⚠️ Requires confirmation
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 빠른 통계 */}
        <div className="mt-4 pt-3 border-t">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="text-sm font-bold text-blue-600">6</div>
              <div className="text-gray-500">Available Actions</div>
            </div>
            <div>
              <div className="text-sm font-bold text-yellow-600">2</div>
              <div className="text-gray-500">Need Confirmation</div>
            </div>
            <div>
              <div className="text-sm font-bold text-red-600">2</div>
              <div className="text-gray-500">Dangerous</div>
            </div>
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      {isModalOpen && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{pendingAction.icon}</span>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{pendingAction.title}</h3>
                <p className="text-sm text-gray-600">{pendingAction.description}</p>
              </div>
            </div>

            {pendingAction.dangerous && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">⚠️</span>
                  <span className="text-sm text-red-800 font-medium">
                    This action is potentially dangerous and cannot be undone.
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded ${
                  pendingAction.dangerous
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {pendingAction.dangerous ? 'Execute Anyway' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;