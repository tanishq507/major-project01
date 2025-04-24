import React from 'react';
import { useBatteryContext } from '../context/BatteryContext';
import MetricsCard from './MetricsCard';

const MetricsGrid: React.FC = () => {
  const { selectedBatteryIds, batteryData } = useBatteryContext();
  
  // If multiple batteries are selected, show average values
  const selectedBatteries = batteryData.filter(d => 
    selectedBatteryIds.includes(d.battery.id)
  );

  if (selectedBatteries.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
        <p className="text-gray-700 dark:text-gray-300">
          No batteries selected. Please select at least one battery to view metrics.
        </p>
      </div>
    );
  }

  // Calculate average metrics if multiple batteries are selected
  const calculateMetrics = () => {
    if (selectedBatteries.length === 1) {
      return selectedBatteries[0].currentMetrics;
    }

    // Calculate averages
    const metrics = selectedBatteries.map(d => d.currentMetrics);
    const voltage = metrics.reduce((sum, m) => sum + m.voltage, 0) / metrics.length;
    const current = metrics.reduce((sum, m) => sum + m.current, 0) / metrics.length;
    const power = metrics.reduce((sum, m) => sum + m.power, 0) / metrics.length;
    const soc = metrics.reduce((sum, m) => sum + m.soc, 0) / metrics.length;
    const soh = metrics.reduce((sum, m) => sum + m.soh, 0) / metrics.length;
    const temperature = metrics.reduce((sum, m) => sum + m.temperature, 0) / metrics.length;

    return {
      timestamp: new Date(),
      voltage,
      current,
      power,
      soc,
      soh,
      temperature,
    };
  };

  // Get previous metrics (5 minutes ago) for trend calculation
  const getPreviousMetrics = () => {
    if (selectedBatteries.length === 0) return null;
    
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (selectedBatteries.length === 1) {
      const historicalData = selectedBatteries[0].historicalData;
      // Find the closest data point to 5 minutes ago
      const closestIndex = historicalData.findIndex(
        d => d.timestamp >= fiveMinutesAgo
      );
      
      return closestIndex !== -1 ? historicalData[closestIndex] : null;
    }
    
    // For multiple batteries, calculate average of previous values
    const previousMetrics = selectedBatteries.map(data => {
      const historicalData = data.historicalData;
      const closestIndex = historicalData.findIndex(
        d => d.timestamp >= fiveMinutesAgo
      );
      
      return closestIndex !== -1 ? historicalData[closestIndex] : data.currentMetrics;
    });
    
    if (previousMetrics.length === 0) return null;
    
    const voltage = previousMetrics.reduce((sum, m) => sum + m.voltage, 0) / previousMetrics.length;
    const current = previousMetrics.reduce((sum, m) => sum + m.current, 0) / previousMetrics.length;
    const power = previousMetrics.reduce((sum, m) => sum + m.power, 0) / previousMetrics.length;
    const soc = previousMetrics.reduce((sum, m) => sum + m.soc, 0) / previousMetrics.length;
    const soh = previousMetrics.reduce((sum, m) => sum + m.soh, 0) / previousMetrics.length;
    const temperature = previousMetrics.reduce((sum, m) => sum + m.temperature, 0) / previousMetrics.length;
    
    return {
      timestamp: fiveMinutesAgo,
      voltage,
      current,
      power,
      soc,
      soh,
      temperature,
    };
  };

  const currentMetrics = calculateMetrics();
  const previousMetrics = getPreviousMetrics();

  // Current direction description based on value
  const currentDescription = currentMetrics.current > 0 
    ? 'Discharging' 
    : currentMetrics.current < 0 
      ? 'Charging' 
      : 'Idle';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricsCard
        title="Voltage"
        value={currentMetrics.voltage}
        unit="V"
        metric="voltage"
        icon="battery"
        previousValue={previousMetrics?.voltage}
        description="Operating voltage"
      />
      
      <MetricsCard
        title="Current"
        value={currentMetrics.current}
        unit="mA"
        metric="current"
        icon="current"
        previousValue={previousMetrics?.current}
        description={currentDescription}
      />
      
      <MetricsCard
        title="Power"
        value={currentMetrics.power}
        unit="mW"
        metric="power"
        icon="power"
        previousValue={previousMetrics?.power}
        description="Output power"
      />
      
      <MetricsCard
        title="State of Charge"
        value={currentMetrics.soc}
        unit="%"
        metric="soc"
        icon="battery"
        previousValue={previousMetrics?.soc}
        description="Battery capacity"
      />
      
      <MetricsCard
        title="State of Health"
        value={currentMetrics.soh}
        unit="%"
        metric="soh"
        icon="health"
        description="Battery condition"
      />
      
      <MetricsCard
        title="Temperature"
        value={currentMetrics.temperature}
        unit="°C"
        metric="temperature"
        icon="temperature"
        previousValue={previousMetrics?.temperature}
        description="Cell temperature"
      />
    </div>
  );
};

export default MetricsGrid;