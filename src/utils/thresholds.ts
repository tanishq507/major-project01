import { BatteryMetric, ThresholdConfig } from '../types';

// Default threshold configuration
export const defaultThresholds: ThresholdConfig = {
  temperature: {
    low: 0,
    high: 45,
  },
  voltage: {
    low: 11,
    high: 14.4,
  },
  soc: {
    low: 20,
    high: 90,
  },
};

// Function to check if a metric is within threshold
export const isWithinThreshold = (
  metric: keyof BatteryMetric,
  value: number,
  thresholds: ThresholdConfig
): { isValid: boolean; type?: 'low' | 'high' } => {
  if (metric === 'temperature') {
    if (value < thresholds.temperature.low) {
      return { isValid: false, type: 'low' };
    }
    if (value > thresholds.temperature.high) {
      return { isValid: false, type: 'high' };
    }
  } else if (metric === 'voltage') {
    if (value < thresholds.voltage.low) {
      return { isValid: false, type: 'low' };
    }
    if (value > thresholds.voltage.high) {
      return { isValid: false, type: 'high' };
    }
  } else if (metric === 'soc') {
    if (value < thresholds.soc.low) {
      return { isValid: false, type: 'low' };
    }
    if (value > thresholds.soc.high) {
      return { isValid: false, type: 'high' };
    }
  }
  
  return { isValid: true };
};

// Function to get status color based on threshold
export const getStatusColor = (
  metric: keyof BatteryMetric,
  value: number,
  thresholds: ThresholdConfig
): string => {
  const { isValid, type } = isWithinThreshold(metric, value, thresholds);
  
  if (!isValid) {
    return type === 'high' ? 'text-red-500' : 'text-orange-500';
  }
  
  // For SOC and SOH, add yellow for medium levels
  if (metric === 'soc' || metric === 'soh') {
    if (value < 50) {
      return 'text-yellow-500';
    }
  }
  
  return 'text-green-500';
};

// Get background color for visual indicators
export const getBackgroundColor = (
  metric: keyof BatteryMetric,
  value: number,
  thresholds: ThresholdConfig
): string => {
  const { isValid, type } = isWithinThreshold(metric, value, thresholds);
  
  if (!isValid) {
    return type === 'high' ? 'bg-red-100 dark:bg-red-900' : 'bg-orange-100 dark:bg-orange-900';
  }
  
  // For SOC and SOH, add yellow for medium levels
  if (metric === 'soc' || metric === 'soh') {
    if (value < 50) {
      return 'bg-yellow-100 dark:bg-yellow-900';
    }
  }
  
  return 'bg-green-100 dark:bg-green-900';
};