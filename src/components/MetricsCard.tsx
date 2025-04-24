import React from 'react';
import { BatteryMetric } from '../types';
import { getStatusColor } from '../utils/thresholds';
import { useBatteryContext } from '../context/BatteryContext';
import { Battery, Zap, Gauge, Thermometer, Activity } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: number;
  unit: string;
  metric: keyof BatteryMetric;
  icon: 'battery' | 'current' | 'power' | 'temperature' | 'health';
  previousValue?: number;
  description?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  unit,
  metric,
  icon,
  previousValue,
  description,
}) => {
  const { thresholds } = useBatteryContext();
  const statusColor = getStatusColor(metric, value, thresholds);
  
  // Calculate trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (previousValue !== undefined) {
    if (value > previousValue) {
      trend = 'up';
    } else if (value < previousValue) {
      trend = 'down';
    }
  }

  // Get icon based on type
  const renderIcon = () => {
    switch (icon) {
      case 'battery':
        return <Battery className="h-6 w-6" />;
      case 'current':
        return <Zap className="h-6 w-6" />;
      case 'power':
        return <Gauge className="h-6 w-6" />;
      case 'temperature':
        return <Thermometer className="h-6 w-6" />;
      case 'health':
        return <Activity className="h-6 w-6" />;
      default:
        return <Battery className="h-6 w-6" />;
    }
  };

  // Format value based on metric type
  const formattedValue = metric === 'power' 
    ? value.toFixed(1) 
    : metric === 'soc' || metric === 'soh' 
      ? Math.round(value) 
      : value.toFixed(2);

  // Visual elements for different metrics
  const renderVisualIndicator = () => {
    if (metric === 'soc') {
      // Battery level indicator
      return (
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBatteryLevelColor(value)}`}
            style={{ width: `${value}%` }}
          />
        </div>
      );
    }
    
    if (metric === 'soh') {
      // Health indicator
      return (
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getHealthLevelColor(value)}`}
            style={{ width: `${value}%` }}
          />
        </div>
      );
    }
    
    return null;
  };

  // Get color for battery level indicator
  const getBatteryLevelColor = (value: number): string => {
    if (value < 20) return 'bg-red-500';
    if (value < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get color for health level indicator
  const getHealthLevelColor = (value: number): string => {
    if (value < 70) return 'bg-red-500';
    if (value < 85) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get color for trend indicator
  const getTrendColor = (): string => {
    if (metric === 'temperature') {
      return trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-blue-500' : 'text-gray-500';
    }
    if (metric === 'soc') {
      return trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
    }
    return trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${statusColor} bg-opacity-10 dark:bg-opacity-20`}>
            {renderIcon()}
          </div>
          <h3 className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
        </div>
        
        {previousValue !== undefined && (
          <div className={`flex items-center ${getTrendColor()}`}>
            {trend === 'up' && <span className="text-xs">↑</span>}
            {trend === 'down' && <span className="text-xs">↓</span>}
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <div className="flex items-baseline">
          <span className={`text-2xl font-semibold ${statusColor}`}>{formattedValue}</span>
          <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      
      {renderVisualIndicator()}
    </div>
  );
};

export default MetricsCard;