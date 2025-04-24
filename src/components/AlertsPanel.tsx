import React, { useState } from 'react';
import { useBatteryContext } from '../context/BatteryContext';
import { Alert } from '../types';
import { BellRing, X, Check, AlertTriangle } from 'lucide-react';

const AlertsPanel: React.FC = () => {
  const { batteryData, selectedBatteryIds } = useBatteryContext();
  const [expandedAlerts, setExpandedAlerts] = useState<string[]>([]);

  // Get all alerts from selected batteries
  const getAlerts = (): Alert[] => {
    if (selectedBatteryIds.length === 0) return [];
    
    const alerts: Alert[] = [];
    
    selectedBatteryIds.forEach(id => {
      const battery = batteryData.find(d => d.battery.id === id);
      if (battery) {
        alerts.push(...battery.alerts);
      }
    });
    
    // Sort by timestamp (newest first) and acknowledgment status
    return alerts.sort((a, b) => {
      // Unacknowledged alerts first
      if (a.isAcknowledged !== b.isAcknowledged) {
        return a.isAcknowledged ? 1 : -1;
      }
      // Then by timestamp (newest first)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  };

  const toggleExpandAlert = (alertId: string) => {
    setExpandedAlerts(prev => 
      prev.includes(alertId)
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(timestamp);
  };

  const getAlertMessage = (alert: Alert): string => {
    const { metric, type, value, threshold } = alert;
    
    const metricName = metric.charAt(0).toUpperCase() + metric.slice(1);
    const formattedValue = metric === 'soc' || metric === 'soh'
      ? `${Math.round(value)}%`
      : metric === 'temperature'
        ? `${value.toFixed(1)}°C`
        : `${value.toFixed(2)} ${getUnit(metric)}`;
    
    const formattedThreshold = metric === 'soc' || metric === 'soh'
      ? `${threshold}%`
      : metric === 'temperature'
        ? `${threshold}°C`
        : `${threshold} ${getUnit(metric)}`;
    
    return `${metricName} ${type === 'high' ? 'exceeded' : 'fell below'} threshold: ${formattedValue} (Threshold: ${formattedThreshold})`;
  };

  const getUnit = (metric: string): string => {
    switch (metric) {
      case 'voltage':
        return 'V';
      case 'current':
        return 'A';
      case 'power':
        return 'W';
      case 'temperature':
        return '°C';
      default:
        return '';
    }
  };

  const getAlertTypeColor = (alert: Alert): string => {
    const baseClass = alert.isAcknowledged
      ? 'opacity-60 '
      : '';
    
    if (alert.type === 'high') {
      if (alert.metric === 'temperature') {
        return `${baseClass}bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
      }
      return `${baseClass}bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200`;
    }
    
    return `${baseClass}bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`;
  };

  const alerts = getAlerts();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center mb-4">
        <BellRing className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alert History
        </h2>
      </div>
      
      {alerts.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-md p-3 transition-all duration-200 ${getAlertTypeColor(alert)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getAlertMessage(alert)}</span>
                      {alert.isAcknowledged && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          <Check className="h-3 w-3 mr-1" />
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <div className="text-sm opacity-75 mt-1">
                      <span>
                        {batteryData.find(d => d.battery.id === alert.batteryId)?.battery.name || 'Unknown Battery'}
                      </span>
                      <span className="mx-1">•</span>
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleExpandAlert(alert.id)}
                  className="ml-2 text-current opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-gray-500 dark:text-gray-400">
            {selectedBatteryIds.length === 0
              ? 'Select a battery to view alerts'
              : 'No alerts for the selected batteries'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;