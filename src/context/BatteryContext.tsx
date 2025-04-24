import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BatteryData, TimeRange, ThresholdConfig } from '../types';
import { defaultThresholds } from '../utils/thresholds';

interface BatteryContextType {
  batteryData: BatteryData[];
  selectedBatteryIds: string[];
  timeRange: TimeRange;
  thresholds: ThresholdConfig;
  isDarkMode: boolean;
  setSelectedBatteryIds: (ids: string[]) => void;
  setTimeRange: (range: TimeRange) => void;
  setThresholds: (thresholds: ThresholdConfig) => void;
  toggleDarkMode: () => void;
  getFilteredData: (batteryId: string) => BatteryData | null;
}

const BatteryContext = createContext<BatteryContextType | undefined>(undefined);

export const BatteryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batteryData, setBatteryData] = useState<BatteryData[]>([]);
  const [selectedBatteryIds, setSelectedBatteryIds] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [thresholds, setThresholds] = useState<ThresholdConfig>(defaultThresholds);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Subscribe to real-time Firebase updates
  useEffect(() => {
    console.log('Setting up Firebase listener');
    const batteryRef = collection(db, 'batteryData');
    
    // Create a query to get the latest data
    const q = query(
      batteryRef,
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Received Firebase update', snapshot.size);
      const newData: BatteryData[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Document data:', data);
        
        const battery = {
          id: doc.id,
          name: `Battery Pack`,
          isConnected: true, // Since we're getting live data
          lastUpdated: new Date()
        };

        const metrics = {
          timestamp: new Date(),
          voltage: parseFloat(data.voltage) || 0,
          current: parseFloat(data.current) || 0,
          power: parseFloat(data.power) || 0,
          soc: parseFloat(data.soc) || 0,
          soh: parseFloat(data.soh) || 0,
          temperature: parseFloat(data.temperature) || 0
        };

        // Generate alerts based on status
        const alerts = [];
        if (data.status && data.status !== 'Normal') {
          alerts.push({
            id: `status-${doc.id}-${Date.now()}`,
            timestamp: new Date(),
            batteryId: doc.id,
            metric: data.status.toLowerCase().includes('voltage') ? 'voltage' as const : 
                   data.status.toLowerCase().includes('current') ? 'current' as const : 'temperature' as const,
            value: metrics[data.status.toLowerCase().includes('voltage') ? 'voltage' : 
                         data.status.toLowerCase().includes('current') ? 'current' : 'temperature'],
            threshold: 0,
            type: data.status.toLowerCase().startsWith('over') ? 'high' as const : 'low' as const,
            isAcknowledged: false
          });
        }

        // Store historical data
        const historicalData = [metrics];

        newData.push({
          battery,
          currentMetrics: metrics,
          historicalData,
          alerts
        });
      });

      if (newData.length > 0) {
        setBatteryData(prev => {
          // Update existing battery data or add new
          const updated = [...prev];
          newData.forEach(data => {
            const index = updated.findIndex(b => b.battery.id === data.battery.id);
            if (index !== -1) {
              // Update existing battery
              updated[index] = {
                ...updated[index],
                currentMetrics: data.currentMetrics,
                historicalData: [...updated[index].historicalData, data.currentMetrics].slice(-100),
                alerts: [...updated[index].alerts, ...data.alerts]
              };
            } else {
              // Add new battery
              updated.push(data);
            }
          });
          return updated;
        });
      }

      // Set initial selection if none exists
      if (selectedBatteryIds.length === 0 && newData.length > 0) {
        setSelectedBatteryIds([newData[0].battery.id]);
      }
    }, (error) => {
      console.error("Error fetching real-time data:", error);
    });

    return () => unsubscribe();
  }, []);

  // Set dark mode based on system preference initially
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
    
    if (prefersDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  const getFilteredData = (batteryId: string): BatteryData | null => {
    const data = batteryData.find(d => d.battery.id === batteryId);
    if (!data) return null;
    return data;
  };

  const value = {
    batteryData,
    selectedBatteryIds,
    timeRange,
    thresholds,
    isDarkMode,
    setSelectedBatteryIds,
    setTimeRange,
    setThresholds,
    toggleDarkMode,
    getFilteredData,
  };

  return (
    <BatteryContext.Provider value={value}>
      {children}
    </BatteryContext.Provider>
  );
};

export const useBatteryContext = () => {
  const context = useContext(BatteryContext);
  if (context === undefined) {
    throw new Error('useBatteryContext must be used within a BatteryProvider');
  }
  return context;
};