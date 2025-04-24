export interface Battery {
  id: string;
  name: string;
  isConnected: boolean;
  lastUpdated: Date;
}

export interface BatteryMetric {
  timestamp: Date;
  voltage: number;
  current: number;
  power: number;
  soc: number;
  soh: number;
  temperature: number;
}

export interface Alert {
  id: string;
  timestamp: Date;
  batteryId: string;
  metric: 'voltage' | 'current' | 'temperature' | 'soc' | 'soh';
  value: number;
  threshold: number;
  type: 'low' | 'high';
  isAcknowledged: boolean;
}

export interface BatteryData {
  battery: Battery;
  currentMetrics: BatteryMetric;
  historicalData: BatteryMetric[];
  alerts: Alert[];
}

export type TimeRange = '1h' | '24h' | '7d' | '30d';

export interface ThresholdConfig {
  temperature: {
    low: number;
    high: number;
  };
  voltage: {
    low: number;
    high: number;
  };
  soc: {
    low: number;
    high: number;
  };
}