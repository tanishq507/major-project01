import { Battery, BatteryData, BatteryMetric, Alert, TimeRange } from '../types';

// Generate random number between min and max
const randomNumber = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Generate random battery metric
export const generateBatteryMetric = (timestamp: Date): BatteryMetric => {
  const voltage = randomNumber(11, 14.4);
  const current = randomNumber(-20, 20);
  const power = voltage * current;
  const soc = randomNumber(10, 100);
  const soh = randomNumber(70, 100);
  const temperature = randomNumber(-10, 55);

  return {
    timestamp,
    voltage,
    current,
    power,
    soc,
    soh,
    temperature,
  };
};

// Generate mock battery data
export const generateMockBatteryData = (id: string, name: string): BatteryData => {
  const isConnected = Math.random() > 0.2;
  const lastUpdated = new Date();
  
  const battery: Battery = {
    id,
    name,
    isConnected,
    lastUpdated,
  };

  const currentMetrics = generateBatteryMetric(lastUpdated);
  
  // Generate historical data (last 24 hours)
  const historicalData: BatteryMetric[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    historicalData.push(generateBatteryMetric(timestamp));
  }

  // Generate some random alerts
  const alerts: Alert[] = [];
  const alertTypes: ('temperature' | 'voltage' | 'soc')[] = ['temperature', 'voltage', 'soc'];
  
  for (let i = 0; i < 3; i++) {
    if (Math.random() > 0.7) {
      const timestamp = new Date(now.getTime() - randomNumber(1, 24) * 60 * 60 * 1000);
      const metric = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const type = Math.random() > 0.5 ? 'high' : 'low';
      
      let value, threshold;
      if (metric === 'temperature') {
        value = type === 'high' ? randomNumber(46, 60) : randomNumber(-20, -1);
        threshold = type === 'high' ? 45 : 0;
      } else if (metric === 'voltage') {
        value = type === 'high' ? randomNumber(14.5, 16) : randomNumber(8, 10.9);
        threshold = type === 'high' ? 14.4 : 11;
      } else {
        value = type === 'high' ? randomNumber(91, 100) : randomNumber(5, 19);
        threshold = type === 'high' ? 90 : 20;
      }
      
      alerts.push({
        id: `alert-${id}-${i}`,
        timestamp,
        batteryId: id,
        metric,
        value,
        threshold,
        type,
        isAcknowledged: Math.random() > 0.5,
      });
    }
  }

  return {
    battery,
    currentMetrics,
    historicalData,
    alerts,
  };
};

// Create initial mock batteries
export const generateInitialBatteries = (): BatteryData[] => {
  return [
    generateMockBatteryData('batt-01', 'Battery Pack 01'),
    generateMockBatteryData('batt-02', 'Battery Pack 02'),
    generateMockBatteryData('batt-03', 'Battery Pack 03'),
    generateMockBatteryData('batt-04', 'Solar Battery 01'),
  ];
};

// Update battery data in real-time
export const updateBatteryData = (batteryData: BatteryData): BatteryData => {
  const now = new Date();
  const isConnected = batteryData.battery.isConnected 
    ? Math.random() > 0.05 // 5% chance to disconnect
    : Math.random() > 0.7; // 30% chance to connect
  
  const battery: Battery = {
    ...batteryData.battery,
    isConnected,
    lastUpdated: isConnected ? now : batteryData.battery.lastUpdated,
  };

  // Only update metrics if connected
  let currentMetrics = batteryData.currentMetrics;
  let historicalData = [...batteryData.historicalData];
  
  if (isConnected) {
    currentMetrics = generateBatteryMetric(now);
    
    // Add current metrics to historical data
    historicalData.push(currentMetrics);
    
    // Keep only the last 24 hours
    if (historicalData.length > 24) {
      historicalData.shift();
    }
  }

  return {
    battery,
    currentMetrics,
    historicalData,
    alerts: batteryData.alerts, // Keep existing alerts
  };
};

// Filter historical data based on time range
export const filterDataByTimeRange = (data: BatteryMetric[], timeRange: TimeRange): BatteryMetric[] => {
  const now = new Date();
  let timeLimit: Date;
  
  switch (timeRange) {
    case '1h':
      timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      timeLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return data.filter(metric => metric.timestamp >= timeLimit);
};